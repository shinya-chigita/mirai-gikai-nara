import "server-only";

import type { Route } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { getPublicTopicConfigs } from "../loaders/get-public-topic-configs";

export async function TopicInterviewSection() {
  const configs = await getPublicTopicConfigs();

  if (configs.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[22px] font-bold text-mirai-text leading-[1.48]">
          AIインタビューで議案を探す
        </h2>
        <p className="text-xs font-medium text-mirai-text-secondary leading-[1.67]">
          あなたの関心をもとにAIが関連する議案を紹介します
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {configs.map((config) => (
          <Link
            key={config.id}
            href={routes.topicInterview(config.id) as Route}
            className="block rounded-2xl border border-primary-accent/20 bg-card p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-mirai-text">
                  {config.topic_title}
                </h3>
                {config.topic_description && (
                  <p className="mt-1 text-sm text-mirai-text-muted line-clamp-2">
                    {config.topic_description}
                  </p>
                )}
                {config.estimated_duration && (
                  <p className="mt-2 text-xs text-mirai-text-subtle">
                    目安時間: 約{config.estimated_duration}分
                  </p>
                )}
              </div>
              <div className="flex-shrink-0 self-center">
                <Button size="sm" variant="outline" tabIndex={-1}>
                  はじめる
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
