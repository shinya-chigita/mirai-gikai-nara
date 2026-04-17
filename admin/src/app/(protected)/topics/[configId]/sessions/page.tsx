import { ArrowLeft, Clock, MessageCircle, Star, User } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getAllTopicInterviewConfigs } from "@/features/topic-interview-config/server/loaders/get-topic-interview-configs";
import {
  getTopicSessions,
  getTopicSessionsCount,
} from "@/features/topic-interview-config/server/loaders/get-topic-sessions";
import { routes } from "@/lib/routes";

interface Props {
  params: Promise<{ configId: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function TopicSessionsPage({
  params,
  searchParams,
}: Props) {
  const { configId } = await params;
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const configs = await getAllTopicInterviewConfigs();
  const config = configs.find((c) => c.id === configId);
  if (!config) {
    notFound();
  }

  const [sessions, totalCount] = await Promise.all([
    getTopicSessions(configId, currentPage),
    getTopicSessionsCount(configId),
  ]);

  const totalPages = Math.ceil(totalCount / 20);

  return (
    <div>
      <div className="mb-6">
        <Link
          href={routes.topics() as Route}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          トピック一覧に戻る
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">セッション一覧</h1>
        <p className="text-gray-600 mt-1">
          「{config.topic_title ?? config.name}」のインタビューセッション（
          {totalCount}件）
        </p>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            まだセッションがありません
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={routes.topicSessionDetail(configId, session.id) as Route}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {new Date(session.started_at).toLocaleString("ja-JP", {
                          timeZone: "Asia/Tokyo",
                        })}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MessageCircle className="h-4 w-4 text-gray-400" />
                        {session.message_count}件
                      </div>
                      {session.rating && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          {session.rating}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={session.completed_at ? "secondary" : "default"}
                      >
                        {session.completed_at ? "完了" : "進行中"}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <User className="h-3 w-3" />
                        {session.user_id.slice(0, 8)}…
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={
                `${routes.topicSessions(configId)}?page=${p}` as unknown as Route
              }
              className={`px-3 py-1 rounded text-sm ${
                p === currentPage
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
