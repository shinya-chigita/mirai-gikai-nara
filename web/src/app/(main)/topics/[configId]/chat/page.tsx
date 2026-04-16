import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import { getPublicTopicConfigById } from "@/features/topic-interview-session/server/loaders/get-public-topic-config";
import { initializeTopicSession } from "@/features/topic-interview-session/server/loaders/initialize-topic-session";
import { TopicChatClient } from "@/features/topic-interview-session/client/components/topic-chat-client";

interface Props {
  params: Promise<{ configId: string }>;
}

export default async function TopicChatPage({ params }: Props) {
  const { configId } = await params;
  const config = await getPublicTopicConfigById(configId);
  if (!config) {
    notFound();
  }

  const { session, messages } = await initializeTopicSession(configId);

  return (
    <div className="h-[calc(100vh-4rem)]">
      <TopicChatClient
        topicConfigId={configId}
        sessionId={session.id}
        topicTitle={config.topic_title ?? ""}
        initialMessages={messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        }))}
      />
    </div>
  );
}
