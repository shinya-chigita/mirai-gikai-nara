import { ArrowLeft, Download } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConversationsFilterBar } from "@/features/topic-conversations/client/components/conversations-filter-bar";
import { ConversationsSummaryCard } from "@/features/topic-conversations/server/components/conversations-summary-card";
import { ConversationsTable } from "@/features/topic-conversations/server/components/conversations-table";
import { getTopicConversations } from "@/features/topic-conversations/server/loaders/get-topic-conversations";
import { getTopicConversationsSummary } from "@/features/topic-conversations/server/loaders/get-topic-conversations-summary";
import { getAllTopicInterviewConfigs } from "@/features/topic-interview-config/server/loaders/get-topic-interview-configs";
import { routes } from "@/lib/routes";
import {
  parseConversationsSearchParams,
  serializeConversationsFilter,
} from "@/features/topic-conversations/shared/utils/parse-conversations-search-params";

interface Props {
  params: Promise<{ configId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TopicConversationsPage({
  params,
  searchParams,
}: Props) {
  const { configId } = await params;
  const rawSearch = await searchParams;
  const filter = parseConversationsSearchParams(rawSearch);

  const configs = await getAllTopicInterviewConfigs();
  const config = configs.find((c) => c.id === configId);
  if (!config) {
    notFound();
  }

  const [{ items, totalCount }, summary] = await Promise.all([
    getTopicConversations(configId, filter),
    getTopicConversationsSummary(configId),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / filter.perPage));
  const exportQs = serializeConversationsFilter({ ...filter, page: 1 });
  const exportHref = exportQs
    ? `/api/topics/${configId}/conversations/export?${exportQs}`
    : `/api/topics/${configId}/conversations/export`;

  const buildPageHref = (page: number) => {
    const qs = serializeConversationsFilter({ ...filter, page });
    const base = routes.topicConversations(configId);
    return qs ? (`${base}?${qs}` as Route) : (base as Route);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={routes.topics() as Route}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          トピック一覧に戻る
        </Link>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">会話ログ閲覧</h1>
          <p className="text-gray-600 mt-1">
            「{config.topic_title ?? config.name}」のインタビューやりとり一覧
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={exportHref} download>
              <Download className="h-4 w-4 mr-1" />
              CSVエクスポート
            </a>
          </Button>
        </div>
      </div>

      <ConversationsSummaryCard summary={summary} />

      <ConversationsFilterBar
        configId={configId}
        initial={filter}
        totalCount={totalCount}
      />

      <ConversationsTable configId={configId} items={items} />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildPageHref(p)}
              className={`px-3 py-1 rounded text-sm ${
                p === filter.page
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
