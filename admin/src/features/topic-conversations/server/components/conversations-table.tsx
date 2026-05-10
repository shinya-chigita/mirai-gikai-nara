import "server-only";
import { ChevronRight, MessageCircleOff } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { routes } from "@/lib/routes";
import type { ConversationListItem } from "../loaders/get-topic-conversations";

interface Props {
  configId: string;
  items: ConversationListItem[];
}

const FIRST_MESSAGE_PREVIEW_MAX = 60;

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
}

function shortId(value: string): string {
  return `${value.slice(0, 8)}…`;
}

function previewFirstUserMessage(value: string | null): string {
  if (!value) return "";
  if (value.length <= FIRST_MESSAGE_PREVIEW_MAX) return value;
  return `${value.slice(0, FIRST_MESSAGE_PREVIEW_MAX)}…`;
}

export function ConversationsTable({ configId, items }: Props) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          該当する会話ログがありません
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="rounded-md border bg-white overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>開始日時</TableHead>
            <TableHead>状態</TableHead>
            <TableHead>セッション</TableHead>
            <TableHead>ユーザー</TableHead>
            <TableHead className="text-right">メッセージ</TableHead>
            <TableHead className="text-right">user / AI</TableHead>
            <TableHead>最初のユーザー発言</TableHead>
            <TableHead>最新メッセージ</TableHead>
            <TableHead>完了日時</TableHead>
            <TableHead className="w-12 text-right">詳細</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const noUser = item.user_message_count === 0;
            return (
              <TableRow
                key={item.id}
                className={noUser ? "bg-amber-50/50" : undefined}
              >
                <TableCell className="text-sm text-gray-700 whitespace-nowrap">
                  {formatDateTime(item.started_at)}
                </TableCell>
                <TableCell>
                  <Badge variant={item.completed_at ? "secondary" : "default"}>
                    {item.completed_at ? "完了" : "進行中"}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-gray-600">
                  {shortId(item.id)}
                </TableCell>
                <TableCell className="font-mono text-xs text-gray-600">
                  {shortId(item.user_id)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-gray-800">
                  {item.message_count}
                </TableCell>
                <TableCell className="text-right tabular-nums text-xs text-gray-600 whitespace-nowrap">
                  {item.user_message_count} / {item.assistant_message_count}
                </TableCell>
                <TableCell className="max-w-xs">
                  {item.first_user_message ? (
                    <span className="text-sm text-gray-700 line-clamp-2">
                      {previewFirstUserMessage(item.first_user_message)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-700">
                      <MessageCircleOff className="h-3 w-3" />
                      ユーザー発言なし
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                  {formatDateTime(item.latest_message_at)}
                </TableCell>
                <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                  {formatDateTime(item.completed_at)}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={routes.topicSessionDetail(configId, item.id) as Route}
                    className="inline-flex items-center text-gray-500 hover:text-gray-900"
                    aria-label="詳細を開く"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
