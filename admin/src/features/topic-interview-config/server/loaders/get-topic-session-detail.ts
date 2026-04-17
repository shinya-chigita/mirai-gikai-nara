import "server-only";

import {
  findInterviewMessagesBySessionId,
  findInterviewSessionById,
} from "@/features/interview-reports/server/repositories/interview-report-repository";

export type TopicSessionDetail = {
  id: string;
  user_id: string;
  started_at: string;
  completed_at: string | null;
  rating: number | null;
  messages: {
    id: string;
    role: "assistant" | "user";
    content: string;
    created_at: string;
  }[];
};

export async function getTopicSessionDetail(
  sessionId: string
): Promise<TopicSessionDetail | null> {
  try {
    const session = await findInterviewSessionById(sessionId);
    const messages = await findInterviewMessagesBySessionId(sessionId);

    return {
      id: session.id,
      user_id: session.user_id,
      started_at: session.started_at,
      completed_at: session.completed_at,
      rating: session.rating,
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role as "assistant" | "user",
        content: m.content,
        created_at: m.created_at,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch topic session detail:", error);
    return null;
  }
}
