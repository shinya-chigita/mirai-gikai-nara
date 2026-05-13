import "server-only";

import {
  convertToModelMessages,
  type LanguageModel,
  streamText,
  type UIMessage,
} from "ai";
import { getBills } from "@/features/bills/server/loaders/get-bills";
import {
  isWithinDailyCostLimit,
  recordChatUsage,
} from "@/features/chat/server/services/cost-tracker";
import {
  checkSystemDailyCostLimit,
  checkSystemMonthlyCostLimit,
} from "@/features/chat/server/services/system-cost-guard";
import { ChatError, ChatErrorCode } from "@/features/chat/shared/types/errors";
import {
  createInterviewMessage,
  createInterviewSessionRecord,
  findActiveInterviewSession,
} from "@/features/interview-session/server/repositories/interview-session-repository";
import { AI_MODELS } from "@/lib/ai/models";
import { env } from "@/lib/env";
import {
  buildTopicBroadListeningSystemPrompt,
  buildTopicDiscoverSystemPrompt,
} from "../../shared/utils/build-topic-system-prompt";
import { formatBillIndexForPrompt } from "../../shared/utils/format-bill-index";
import { getPublicTopicConfigById } from "../loaders/get-public-topic-config";

type HandleTopicChatRequestParams = {
  messages: UIMessage[];
  userId: string;
  topicConfigId: string;
  /**
   * クライアントから渡された sessionId。
   * 未指定 (空セッション抑制のため初回送信前は null) の場合、本関数内で
   * 既存アクティブセッションを検索し、無ければ新規作成する。
   */
  sessionId: string | null;
  deps?: { model?: LanguageModel };
};

/** トピック型インタビューチャットのストリーミング応答を返す */
export async function handleTopicChatRequest({
  messages,
  userId,
  topicConfigId,
  sessionId,
  deps,
}: HandleTopicChatRequestParams) {
  // 日次コスト制限チェック（fail-closed: エラー時もリクエストをブロック）
  const isWithinLimit = await isWithinDailyCostLimit(
    userId,
    env.chat.dailyUserCostLimitUsd
  );
  if (!isWithinLimit) {
    throw new ChatError(ChatErrorCode.DAILY_COST_LIMIT_REACHED);
  }
  await checkSystemDailyCostLimit();
  await checkSystemMonthlyCostLimit();

  // mode により議案カタログ取得の要否が分かれるため、まず topicConfig を取得する
  const topicConfig = await getPublicTopicConfigById(topicConfigId);
  if (!topicConfig) {
    throw new ChatError(
      ChatErrorCode.LLM_GENERATION_FAILED,
      "topic config not found or not public"
    );
  }

  const isBroadListening = topicConfig.mode === "broad_listening";

  // セッション解決: クライアントから受け取った id が無ければ、ユーザー＋設定で
  // アクティブセッションを find-or-create する（空セッション抑制のための遅延作成）。
  const resolvedSessionId = await resolveSessionId({
    sessionId,
    userId,
    interviewConfigId: topicConfigId,
  });

  // discover モードのみ議案カタログを取得（broad_listening では不要）
  const bills = isBroadListening ? [] : await getBills();

  // システムプロンプト構築（mode により分岐）
  const systemPrompt = isBroadListening
    ? buildTopicBroadListeningSystemPrompt({
        topicTitle: topicConfig.topic_title ?? "",
        topicDescription: topicConfig.topic_description,
        knowledgeSource: topicConfig.knowledge_source,
        themes: topicConfig.themes,
        referenceInfo: topicConfig.reference_info,
      })
    : buildTopicDiscoverSystemPrompt({
        topicTitle: topicConfig.topic_title ?? "",
        topicDescription: topicConfig.topic_description,
        knowledgeSource: topicConfig.knowledge_source,
        themes: topicConfig.themes,
        billIndexSection: formatBillIndexForPrompt(
          bills.map((b) => ({
            id: b.id,
            name: b.name,
            summary: b.bill_content?.summary ?? null,
            tags: b.tags,
          }))
        ),
      });

  // 直近のユーザーメッセージを保存（履歴差分で最新分のみ記録）
  const lastMessage = messages[messages.length - 1];
  if (lastMessage?.role === "user") {
    const text = lastMessage.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");
    if (text.trim()) {
      try {
        await createInterviewMessage({
          sessionId: resolvedSessionId,
          role: "user",
          content: text,
        });
      } catch (error) {
        console.error("Failed to save user message:", error);
      }
    }
  }

  const model = deps?.model ?? AI_MODELS.gpt4o;
  const modelName =
    typeof model === "string" ? model : (model.modelId ?? "unknown");
  const promptName = isBroadListening
    ? "topic-broad-listening-system"
    : "topic-discover-system";

  try {
    const result = streamText({
      model,
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      onFinish: async (event) => {
        try {
          await createInterviewMessage({
            sessionId: resolvedSessionId,
            role: "assistant",
            content: event.text,
          });
        } catch (saveError) {
          console.error("Failed to save assistant message:", saveError);
        }

        try {
          await recordChatUsage({
            userId,
            sessionId: resolvedSessionId,
            promptName,
            model: modelName,
            usage: event.totalUsage,
            costUsd: undefined,
            metadata: {
              topicConfigId,
              mode: topicConfig.mode,
              billsIncluded: bills.length,
            },
          });
        } catch (usageError) {
          console.error("Failed to record chat usage:", usageError);
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("LLM generation error:", error);
    throw new ChatError(
      ChatErrorCode.LLM_GENERATION_FAILED,
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * セッション解決ロジック。
 * - 明示的に sessionId が渡された場合はそれをそのまま使う（呼び出し側で所有者チェック済み想定）
 * - 渡されなかった場合、(userId, configId) のアクティブセッションを find-or-create
 *
 * これにより、トピックページ閲覧だけで session 行が無駄に作られなくなり、
 * 「初回ユーザー発言が来てから session を作る」運用に移行できる。
 */
async function resolveSessionId(params: {
  sessionId: string | null;
  userId: string;
  interviewConfigId: string;
}): Promise<string> {
  if (params.sessionId) return params.sessionId;

  const existing = await findActiveInterviewSession(
    params.interviewConfigId,
    params.userId
  );
  if (existing) return existing.id;

  const created = await createInterviewSessionRecord({
    interviewConfigId: params.interviewConfigId,
    userId: params.userId,
  });
  return created.id;
}
