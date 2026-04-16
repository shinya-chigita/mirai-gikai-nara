import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getPublicTopicConfigById } from "@/features/topic-interview-session/server/loaders/get-public-topic-config";
import { routes } from "@/lib/routes";

interface Props {
  params: Promise<{ configId: string }>;
}

export default async function TopicLandingPage({ params }: Props) {
  const { configId } = await params;
  const config = await getPublicTopicConfigById(configId);

  if (!config) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-mirai-text mb-4">
        {config.topic_title}
      </h1>
      {config.topic_description && (
        <p className="text-mirai-text-muted whitespace-pre-wrap mb-8">
          {config.topic_description}
        </p>
      )}

      <div className="rounded-2xl border border-primary-accent/30 bg-card p-6 mb-8">
        <h2 className="text-base font-semibold text-mirai-text mb-2">
          このインタビューの進め方
        </h2>
        <ul className="text-sm text-mirai-text-muted space-y-2 list-disc list-inside">
          <li>
            AI
            があなたの関心を引き出す対話を行い、それに合う奈良県議会の議案を紹介します。
          </li>
          <li>
            紹介された議案について、AI が対話形式で分かりやすく解説します。
          </li>
          <li>
            内容は中立的にまとめられ、会話ログはサービス改善のために保存されます。
          </li>
        </ul>
      </div>

      <div className="flex justify-center">
        <Button asChild size="lg">
          <Link href={routes.topicInterviewChat(configId) as Route}>
            会話を始める
          </Link>
        </Button>
      </div>
    </div>
  );
}
