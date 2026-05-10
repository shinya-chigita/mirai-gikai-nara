/**
 * /admin/topics/[configId]/conversations の URL クエリ → 内部フィルタ変換。
 *
 * 純粋関数。Server / Client / API route から共通で利用する。
 * 不正値はサイレントに無視してデフォルトに寄せる（管理画面でURL直叩きしても落ちないように）。
 */

export type ConversationsStatusFilter = "all" | "completed" | "in_progress";
export type ConversationsHasUserFilter = "all" | "with_user" | "without_user";
export type ConversationsSort = "newest" | "oldest" | "most_messages";

export type ConversationsFilter = {
  q: string | null;
  status: ConversationsStatusFilter;
  hasUserMessage: ConversationsHasUserFilter;
  lowMessageOnly: boolean;
  startedFrom: string | null;
  startedTo: string | null;
  sort: ConversationsSort;
  page: number;
  perPage: 20 | 50 | 100;
};

const ALLOWED_PER_PAGE = [20, 50, 100] as const satisfies readonly number[];

/** ISO 8601 (YYYY-MM-DD など) として最低限パース可能か。値が不正なら null を返す。 */
function normalizeDateInput(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return trimmed;
}

function pickStatus(value: string | undefined): ConversationsStatusFilter {
  if (value === "completed" || value === "in_progress") return value;
  return "all";
}

function pickHasUser(value: string | undefined): ConversationsHasUserFilter {
  if (value === "with_user" || value === "without_user") return value;
  return "all";
}

function pickSort(value: string | undefined): ConversationsSort {
  if (value === "oldest" || value === "most_messages") return value;
  return "newest";
}

function pickPerPage(value: string | undefined): 20 | 50 | 100 {
  const n = Number(value);
  return (ALLOWED_PER_PAGE as readonly number[]).includes(n)
    ? (n as 20 | 50 | 100)
    : 20;
}

function pickPage(value: string | undefined): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

function pickBoolean(value: string | undefined): boolean {
  return value === "true" || value === "1";
}

/**
 * Next.js の searchParams 等から渡される record 形 (string | string[] | undefined)
 * の値を 1 つに正規化する。配列の場合は先頭を採用。
 */
function pickFirst(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseConversationsSearchParams(
  raw: Record<string, string | string[] | undefined>
): ConversationsFilter {
  const q = pickFirst(raw.q)?.trim();
  return {
    q: q && q.length > 0 ? q : null,
    status: pickStatus(pickFirst(raw.status)),
    hasUserMessage: pickHasUser(pickFirst(raw.hasUser)),
    lowMessageOnly: pickBoolean(pickFirst(raw.lowMessage)),
    startedFrom: normalizeDateInput(pickFirst(raw.from)),
    startedTo: normalizeDateInput(pickFirst(raw.to)),
    sort: pickSort(pickFirst(raw.sort)),
    page: pickPage(pickFirst(raw.page)),
    perPage: pickPerPage(pickFirst(raw.perPage)),
  };
}

/**
 * フィルタ → URL クエリ文字列。デフォルト値は省略してURLを短く保つ。
 */
export function serializeConversationsFilter(
  filter: ConversationsFilter
): string {
  const params = new URLSearchParams();
  if (filter.q) params.set("q", filter.q);
  if (filter.status !== "all") params.set("status", filter.status);
  if (filter.hasUserMessage !== "all")
    params.set("hasUser", filter.hasUserMessage);
  if (filter.lowMessageOnly) params.set("lowMessage", "true");
  if (filter.startedFrom) params.set("from", filter.startedFrom);
  if (filter.startedTo) params.set("to", filter.startedTo);
  if (filter.sort !== "newest") params.set("sort", filter.sort);
  if (filter.page !== 1) params.set("page", String(filter.page));
  if (filter.perPage !== 20) params.set("perPage", String(filter.perPage));
  return params.toString();
}
