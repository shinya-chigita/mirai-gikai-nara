import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import { getPublicTopicConfigById } from "@/features/topic-interview-session/server/loaders/get-public-topic-config";
import { initializeTopicSession } from "@/features/topic-interview-session/server/loaders/initialize-topic-session";
import { TopicChatClient } from "@/features/topic-interview-session/client/components/topic-chat-client";
import { TopicSessionErrorView } from "@/features/topic-interview-session/client/components/topic-session-error-view";

interface Props {
  params: Promise<{ configId: string }>;
}

export default async function TopicChatPage({ params }: Props) {
  const { configId } = await params;
  const config = await getPublicTopicConfigById(configId);
  if (!config) {
    notFound();
  }

  try {
    // session が null の場合は「まだ何も発言していない＝セッション未作成」状態。
    // 初回ユーザーメッセージ送信時にサーバが find-or-create する。
    const { session, messages } = await initializeTopicSession(configId);

    return (
      <TopicChatClient
        topicConfigId={configId}
        sessionId={session?.id ?? null}
        topicTitle={config.topic_title ?? ""}
        mode={
          config.mode === "broad_listening" ? "broad_listening" : "discover"
        }
        initialMessages={messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        }))}
      />
    );
  } catch (error) {
    console.error("Failed to initialize topic session:", error);
    return <TopicSessionErrorView configId={configId} />;
  }
}
