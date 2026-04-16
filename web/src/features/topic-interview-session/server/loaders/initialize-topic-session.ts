import "server-only";

import { getChatSupabaseUser } from "@/features/chat/server/utils/supabase-server";
import {
  createInterviewSessionRecord,
  findActiveInterviewSession,
  findInterviewMessagesBySessionId,
} from "@/features/interview-session/server/repositories/interview-session-repository";
import type {
  InterviewMessage,
  InterviewSession,
} from "@/features/interview-session/shared/types";
import { getPublicTopicConfigById } from "./get-public-topic-config";

type InitializeTopicSessionResult = {
  session: InterviewSession;
  messages: InterviewMessage[];
};

/**
 * トピック型インタビューセッションの初期化。
 * 既存のアクティブセッションがあれば再利用、なければ新規作成。
 * 初期メッセージは生成せず、クライアントから初回 user メッセージで会話が始まる想定。
 *
 * `scope_type='topic'` かつ `status='public'` の config のみを対象に、
 * bill scope の configId 誤流用による誤セッション生成を loader 単体で防止する。
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

  let session = await findActiveInterviewSession(interviewConfigId, user.id);
  if (!session) {
    session = await createInterviewSessionRecord({
      interviewConfigId,
      userId: user.id,
    });
  }

  const messages = await findInterviewMessagesBySessionId(session.id);
  return { session, messages };
}
