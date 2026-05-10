import "server-only";

import { createAdminClient } from "@mirai-gikai/supabase";

export type TopicConversationsSummary = {
  totalSessions: number;
  withUserMessages: number;
  withoutUserMessages: number;
  completedSessions: number;
  inProgressSessions: number;
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
};

const EMPTY_SUMMARY: TopicConversationsSummary = {
  totalSessions: 0,
  withUserMessages: 0,
  withoutUserMessages: 0,
  completedSessions: 0,
  inProgressSessions: 0,
  totalMessages: 0,
  userMessages: 0,
  assistantMessages: 0,
};

/**
 * テーマ単位の会話ログサマリー。フィルタ非依存（テーマ全体の母数を見る）。
 *
 * 構成:
 *   1. 対象テーマの全 session_id と完了状態を取得
 *   2. 該当 session の messages を bulk 取得して role 別に集計
 *
 * 設定単位のセッション数は数百件オーダー想定。
 */
export async function getTopicConversationsSummary(
  configId: string
): Promise<TopicConversationsSummary> {
  const supabase = createAdminClient();

  const { data: sessions, error: sessErr } = await supabase
    .from("interview_sessions")
    .select("id, completed_at")
    .eq("interview_config_id", configId);
  if (sessErr) {
    console.error("Failed to fetch sessions for summary:", sessErr);
    return EMPTY_SUMMARY;
  }

  const sessionRows = sessions ?? [];
  if (sessionRows.length === 0) return EMPTY_SUMMARY;

  const sessionIds = sessionRows.map((s) => s.id);
  const completedSessions = sessionRows.filter(
    (s) => s.completed_at !== null
  ).length;
  const inProgressSessions = sessionRows.length - completedSessions;

  const { data: messages, error: msgErr } = await supabase
    .from("interview_messages")
    .select("interview_session_id, role")
    .in("interview_session_id", sessionIds);
  if (msgErr) {
    console.error("Failed to fetch messages for summary:", msgErr);
    return {
      ...EMPTY_SUMMARY,
      totalSessions: sessionRows.length,
      completedSessions,
      inProgressSessions,
      withoutUserMessages: sessionRows.length,
    };
  }

  const userBySession = new Set<string>();
  let userMessages = 0;
  let assistantMessages = 0;
  for (const m of messages ?? []) {
    if (m.role === "user") {
      userMessages += 1;
      userBySession.add(m.interview_session_id);
    } else if (m.role === "assistant") {
      assistantMessages += 1;
    }
  }

  return {
    totalSessions: sessionRows.length,
    withUserMessages: userBySession.size,
    withoutUserMessages: sessionRows.length - userBySession.size,
    completedSessions,
    inProgressSessions,
    totalMessages: userMessages + assistantMessages,
    userMessages,
    assistantMessages,
  };
}
