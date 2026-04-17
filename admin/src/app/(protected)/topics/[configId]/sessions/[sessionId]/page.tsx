import { ArrowLeft, Bot, Clock, MessageCircle, Star, User } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTopicSessionDetail } from "@/features/topic-interview-config/server/loaders/get-topic-session-detail";
import { routes } from "@/lib/routes";

interface Props {
  params: Promise<{ configId: string; sessionId: string }>;
}

export default async function TopicSessionDetailPage({ params }: Props) {
  const { configId, sessionId } = await params;
  const session = await getTopicSessionDetail(sessionId);

  if (!session) {
    notFound();
  }

  const duration =
    session.started_at && session.completed_at
      ? `${Math.round((new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()) / 60000)}分`
      : "—";

  return (
    <div>
      <div className="mb-6">
        <Link
          href={routes.topicSessions(configId) as Route}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          セッション一覧に戻る
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">セッション詳細</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">セッション情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">セッションID</div>
              <div className="font-mono text-xs">{session.id}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">開始時刻</div>
              <div className="flex items-center gap-1 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                {new Date(session.started_at).toLocaleString("ja-JP", {
                  timeZone: "Asia/Tokyo",
                })}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">所要時間</div>
              <div className="text-sm">{duration}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">メッセージ数</div>
              <div className="flex items-center gap-1 text-sm">
                <MessageCircle className="h-4 w-4 text-gray-400" />
                {session.messages.length}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">ユーザーID</div>
              <div className="font-mono text-xs text-gray-600">
                {session.user_id}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">ユーザー評価</div>
              <div className="flex items-center gap-1 text-sm">
                {session.rating ? (
                  <>
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    {session.rating}
                  </>
                ) : (
                  <span className="text-gray-400">未評価</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">チャット履歴</CardTitle>
        </CardHeader>
        <CardContent>
          {session.messages.length > 0 ? (
            <div className="space-y-4">
              {session.messages.map((message) => {
                const isAssistant = message.role === "assistant";
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isAssistant ? "" : "flex-row-reverse"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isAssistant
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {isAssistant ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`max-w-[75%] ${isAssistant ? "" : "text-right"}`}
                    >
                      <div
                        className={`inline-block rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap text-left ${
                          isAssistant
                            ? "bg-blue-50 text-gray-800 rounded-tl-sm"
                            : "bg-gray-100 text-gray-800 rounded-tr-sm"
                        }`}
                      >
                        {message.content}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 px-1">
                        {new Date(message.created_at).toLocaleString("ja-JP", {
                          timeZone: "Asia/Tokyo",
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">メッセージはありません</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
