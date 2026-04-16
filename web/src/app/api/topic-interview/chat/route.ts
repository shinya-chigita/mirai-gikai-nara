import type { UIMessage } from "ai";
import { chatErrorToResponse } from "@/features/chat/server/utils/chat-error-response";
import { getChatSupabaseUser } from "@/features/chat/server/utils/supabase-server";
import { isSessionOwner } from "@/features/interview-session/server/utils/verify-session-ownership";
import { findSessionOwnerById } from "@/features/interview-session/server/repositories/interview-session-repository";
import { handleTopicChatRequest } from "@/features/topic-interview-session/server/services/handle-topic-chat-request";
import { jsonResponse } from "@/lib/api/response";
import { registerNodeTelemetry } from "@/lib/telemetry/register";

export async function POST(req: Request) {
  await registerNodeTelemetry();

  const body = (await req.json()) as {
    messages?: UIMessage[];
    topicConfigId?: string;
    sessionId?: string;
  };

  const { messages, topicConfigId, sessionId } = body;

  const {
    data: { user },
    error: getUserError,
  } = await getChatSupabaseUser();

  if (getUserError || !user) {
    return jsonResponse({ error: "Anonymous session required" }, 401);
  }

  if (!messages || messages.length === 0) {
    return jsonResponse({ error: "messages is required" }, 400);
  }
  if (!topicConfigId) {
    return jsonResponse({ error: "topicConfigId is required" }, 400);
  }
  if (!sessionId) {
    return jsonResponse({ error: "sessionId is required" }, 400);
  }

  // セッション所有者検証（他人の sessionId 注入を防ぐ）
  const sessionOwner = await findSessionOwnerById(sessionId).catch(() => null);
  if (!sessionOwner || !isSessionOwner(sessionOwner.user_id, user.id)) {
    return jsonResponse({ error: "session not found or forbidden" }, 403);
  }

  try {
    return await handleTopicChatRequest({
      messages,
      userId: user.id,
      topicConfigId,
      sessionId,
    });
  } catch (error) {
    return chatErrorToResponse(error);
  }
}
