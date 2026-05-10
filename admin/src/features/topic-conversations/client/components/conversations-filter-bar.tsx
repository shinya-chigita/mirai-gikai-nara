"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { routes } from "@/lib/routes";
import {
  type ConversationsFilter,
  type ConversationsHasUserFilter,
  type ConversationsSort,
  type ConversationsStatusFilter,
  serializeConversationsFilter,
} from "../../shared/utils/parse-conversations-search-params";

interface Props {
  configId: string;
  initial: ConversationsFilter;
  totalCount: number;
}

/**
 * 検索・フィルタ・並び順を URL クエリで持つフォーム。
 * 「適用」で URL を更新して Server Component を再描画する。
 */
export function ConversationsFilterBar({
  configId,
  initial,
  totalCount,
}: Props) {
  const router = useRouter();
  const [q, setQ] = useState(initial.q ?? "");
  const [status, setStatus] = useState<ConversationsStatusFilter>(
    initial.status
  );
  const [hasUser, setHasUser] = useState<ConversationsHasUserFilter>(
    initial.hasUserMessage
  );
  const [lowMessage, setLowMessage] = useState(initial.lowMessageOnly);
  const [from, setFrom] = useState(initial.startedFrom ?? "");
  const [to, setTo] = useState(initial.startedTo ?? "");
  const [sort, setSort] = useState<ConversationsSort>(initial.sort);
  const [perPage, setPerPage] = useState<20 | 50 | 100>(initial.perPage);

  const navigate = (next: ConversationsFilter) => {
    const qs = serializeConversationsFilter(next);
    const base = routes.topicConversations(configId);
    router.push(qs ? `${base}?${qs}` : base);
  };

  const applyFilters = (e: FormEvent) => {
    e.preventDefault();
    navigate({
      q: q.trim() ? q.trim() : null,
      status,
      hasUserMessage: hasUser,
      lowMessageOnly: lowMessage,
      startedFrom: from || null,
      startedTo: to || null,
      sort,
      perPage,
      page: 1, // フィルタ変更時は 1 ページ目に戻す
    });
  };

  const reset = () => {
    setQ("");
    setStatus("all");
    setHasUser("all");
    setLowMessage(false);
    setFrom("");
    setTo("");
    setSort("newest");
    setPerPage(20);
    router.push(routes.topicConversations(configId));
  };

  return (
    <form
      onSubmit={applyFilters}
      className="rounded-md border bg-white p-4 space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="conv-q">本文検索</Label>
          <div className="relative mt-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              id="conv-q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="メッセージ本文に含まれる語句"
              className="pl-8"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="conv-sort">並び順</Label>
          <Select
            value={sort}
            onValueChange={(v) => setSort(v as ConversationsSort)}
          >
            <SelectTrigger id="conv-sort" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">新しい順</SelectItem>
              <SelectItem value="oldest">古い順</SelectItem>
              <SelectItem value="most_messages">
                メッセージ数が多い順
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="conv-status">状態</Label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as ConversationsStatusFilter)}
          >
            <SelectTrigger id="conv-status" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="completed">完了</SelectItem>
              <SelectItem value="in_progress">進行中</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="conv-hasuser">ユーザー発言</Label>
          <Select
            value={hasUser}
            onValueChange={(v) => setHasUser(v as ConversationsHasUserFilter)}
          >
            <SelectTrigger id="conv-hasuser" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="with_user">ユーザー発言あり</SelectItem>
              <SelectItem value="without_user">ユーザー発言なし</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="conv-from">開始日（以降）</Label>
          <Input
            id="conv-from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="conv-to">開始日（以前）</Label>
          <Input
            id="conv-to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={lowMessage}
            onChange={(e) => setLowMessage(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          メッセージ数が少ないセッションのみ（1件以下）
        </label>
        <div className="ml-auto flex items-center gap-2">
          <Label htmlFor="conv-perPage" className="text-sm">
            1ページあたり
          </Label>
          <Select
            value={String(perPage)}
            onValueChange={(v) => setPerPage(Number(v) as 20 | 50 | 100)}
          >
            <SelectTrigger id="conv-perPage" className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-3">
        <div className="text-sm text-gray-600">検索結果: {totalCount}件</div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={reset}
            className="text-gray-600"
          >
            <X className="h-4 w-4 mr-1" />
            リセット
          </Button>
          <Button type="submit" size="sm">
            適用
          </Button>
        </div>
      </div>
    </form>
  );
}
