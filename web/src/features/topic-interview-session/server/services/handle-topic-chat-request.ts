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
import { createInterviewMessage } from "@/features/interview-session/server/repositories/interview-session-repository";
import { AI_MODELS } from "@/lib/ai/models";
import { env } from "@/lib/env";
import { buildTopicDiscoverSystemPrompt } from "../../shared/utils/build-topic-system-prompt";
import { formatBillIndexForPrompt } from "../../shared/utils/format-bill-index";
import { getPublicTopicConfigById } from "../loaders/get-public-topic-config";

type HandleTopicChatRequestParams = {
  messages: UIMessage[];
  userId: string;
  topicConfigId: string;
  sessionId: string;
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

  // トピック設定と議案カタログを並列取得
  const [topicConfig, bills] = await Promise.all([
    getPublicTopicConfigById(topicConfigId),
    getBills(),
  ]);

  if (!topicConfig) {
    throw new ChatError(
      ChatErrorCode.LLM_GENERATION_FAILED,
      "topic config not found or not public"
    );
  }

  // システムプロンプト構築
  const billIndexSection = formatBillIndexForPrompt(
    bills.map((b) => ({
      id: b.id,
      name: b.name,
      summary: b.bill_content?.summary ?? null,
      tags: b.tags,
    }))
  );

  const systemPrompt = buildTopicDiscoverSystemPrompt({
    topicTitle: topicConfig.topic_title ?? "",
    topicDescription: topicConfig.topic_description,
    knowledgeSource: topicConfig.knowledge_source,
    themes: topicConfig.themes,
    billIndexSection,
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
          sessionId,
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

  try {
    const result = streamText({
      model,
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      onFinish: async (event) => {
        try {
          await createInterviewMessage({
            sessionId,
            role: "assistant",
            content: event.text,
          });
        } catch (saveError) {
          console.error("Failed to save assistant message:", saveError);
        }

        try {
          await recordChatUsage({
            userId,
            sessionId,
            promptName: "topic-discover-system",
            model: modelName,
            usage: event.totalUsage,
            costUsd: undefined,
            metadata: {
              topicConfigId,
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
