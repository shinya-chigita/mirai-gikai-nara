import "server-only";

import { getChatSupabaseUser } from "@/features/chat/server/utils/supabase-server";
import {
  findActiveInterviewSession,
  findInterviewMessagesBySessionId,
} from "@/features/interview-session/server/repositories/interview-session-repository";
import type {
  InterviewMessage,
  InterviewSession,
} from "@/features/interview-session/shared/types";
import { getPublicTopicConfigById } from "./get-public-topic-config";

type InitializeTopicSessionResult = {
  session: InterviewSession | null;
  messages: InterviewMessage[];
};

/**
 * トピック型インタビューセッションの初期化（読み取り専用）。
 *
 * 既存のアクティブセッションがあれば返す。無ければ `session: null` を返し、
 * **セッションの新規作成はしない**（=「初回ユーザーメッセージが届いてはじめてセッションを作る」運用）。
 *
 * 旧実装はページ表示のたびに必ず session 行を作っていたため、トピック LP /
 * チャット画面を開いただけで離脱したユーザーの空セッションが大量に積もる
 * 問題があった。本関数の find-only 化により、空セッション（user 発言ゼロ）の
 * 発生を抑える。実際の作成は `handleTopicChatRequest` 側に集約する。
 *
 * `scope_type='topic'` かつ `status='public'` の config のみを対象に、
 * bill scope の configId 誤流用による誤セッション参照を loader 単体で防止する。
 */
export async function initializeTopicSession(
  interviewConfigId: string
): Promise<InitializeTopicSessionResult> {
  const topicConfig = await getPublicTopicConfigById(interviewConfigId);
  if (!topicConfig) {
    throw new Error(
      `Topic interview config not found or not public: ${interviewConfigId}`
    );
  }

  const {
    data: { user },
    error: getUserError,
  } = await getChatSupabaseUser();

  if (getUserError || !user) {
    throw new Error(
      `Failed to get user: ${getUserError?.message || "User not found"}`
    );
  }

  const session = await findActiveInterviewSession(interviewConfigId, user.id);
  if (!session) {
    return { session: null, messages: [] };
  }

  const messages = await findInterviewMessagesBySessionId(session.id);
  return { session, messages };
}
