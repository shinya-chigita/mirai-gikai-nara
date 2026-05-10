import "server-only";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageCircle, Pencil, Plus } from "lucide-react";
import { routes } from "@/lib/routes";
import type { TopicInterviewConfigRow } from "../../shared/types";

interface Props {
  configs: TopicInterviewConfigRow[];
}

export function TopicInterviewConfigList({ configs }: Props) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {configs.length}件のトピック設定
        </div>
        <Button asChild size="sm">
          <Link href={routes.topicNew() as Route}>
            <Plus className="h-4 w-4 mr-1" />
            新規作成
          </Link>
        </Button>
      </div>

      {configs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          トピック設定がありません。「新規作成」から追加できます。
        </div>
      ) : (
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>設定名</TableHead>
                <TableHead>トピックタイトル</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>作成日</TableHead>
                <TableHead>アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell>
                    <Link
                      href={routes.topicEdit(config.id) as Route}
                      className="font-medium hover:underline"
                    >
                      {config.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {config.topic_title}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        config.status === "public" ? "default" : "secondary"
                      }
                      className="w-16 justify-center"
                    >
                      {config.status === "public" ? "公開" : "非公開"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(config.created_at).toLocaleDateString("ja-JP")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={routes.topicEdit(config.id) as Route}>
                          <Pencil className="h-4 w-4 mr-1" />
                          編集
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link
                          href={routes.topicConversations(config.id) as Route}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          会話ログ
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
