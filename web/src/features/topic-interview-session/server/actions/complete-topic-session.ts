"use server";

import { getChatSupabaseUser } from "@/features/chat/server/utils/supabase-server";
import {
  findActiveInterviewSession,
  updateInterviewSessionCompleted,
} from "@/features/interview-session/server/repositories/interview-session-repository";
import type { InterviewSession } from "@/features/interview-session/shared/types";

export type CompleteTopicSessionResult =
  | { success: true; sessionId: string }
  | { success: false; error: string };

/**
 * 「会話を終える」ボタン用 server action。
 *
 * 認証済みユーザーの当該トピックのアクティブセッションを探し、
 * `completed_at` をセットして完了扱いにする。
 *
 * クライアントは sessionId を保持していないため、(userId, topicConfigId)
 * から自動で当該セッションを解決する。
 * アクティブセッションがない（まだ何も発言していない）場合は no-op success。
 */
export async function completeTopicSession(
  topicConfigId: string
): Promise<CompleteTopicSessionResult> {
  if (!topicConfigId) {
    return { success: false, error: "topicConfigId is required" };
  }

  const {
    data: { user },
    error: userErr,
  } = await getChatSupabaseUser();
  if (userErr || !user) {
    return { success: false, error: "unauthenticated" };
  }

  let session: InterviewSession | null;
  try {
    session = await findActiveInterviewSession(topicConfigId, user.id);
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "lookup failed",
    };
  }

  if (!session) {
    // 進行中セッションが無い場合は no-op success（ユーザー体験としては「終わってる」と同じ）
    return { success: true, sessionId: "" };
  }

  try {
    await updateInterviewSessionCompleted(session.id);
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "update failed",
    };
  }
  return { success: true, sessionId: session.id };
}
