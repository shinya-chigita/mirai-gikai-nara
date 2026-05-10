import "server-only";

import { createAdminClient } from "@mirai-gikai/supabase";
import type { ConversationsFilter } from "../../shared/utils/parse-conversations-search-params";

export type ConversationListItem = {
  id: string;
  user_id: string;
  started_at: string;
  completed_at: string | null;
  rating: number | null;
  message_count: number;
  user_message_count: number;
  assistant_message_count: number;
  first_user_message: string | null;
  latest_message_at: string | null;
};

export type ConversationListResult = {
  items: ConversationListItem[];
  totalCount: number;
};

export type ConversationDetail = {
  session_id: string;
  user_id: string;
  started_at: string;
  completed_at: string | null;
  rating: number | null;
  messages: { role: "user" | "assistant"; content: string }[];
};

type SessionRow = {
  id: string;
  user_id: string;
  started_at: string;
  completed_at: string | null;
  rating: number | null;
};

type MessageRow = {
  interview_session_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

const LOW_MESSAGE_THRESHOLD = 1;

/**
 * フィルタ・ソート適用後の全候補（ページング前）を返す共通処理。
 * - SQL でハンドルできる絞り込み（status / 日付 / テキスト検索の session_id 集合）は
 *   サーバ側で適用
 * - 集計が必要なフィルタ（hasUser / lowMessage）と most_messages ソートは
 *   メッセージを bulk 取得後に TS 側で適用
 *
 * 設定単位のセッション数は数百件オーダー想定のため、まずは TS 集計で十分。
 * スケールしたら group by の RPC / view 化を検討。
 */
async function findFilteredItems(
  configId: string,
  filter: ConversationsFilter
): Promise<ConversationListItem[]> {
  const supabase = createAdminClient();

  // テキスト検索: 該当する session_id 集合を先に取る（null = 制約なし）
  const sessionIdSet = await findSessionIdsMatchingTextSearch(
    configId,
    filter.q
  );
  if (sessionIdSet !== null && sessionIdSet.size === 0) return [];

  let query = supabase
    .from("interview_sessions")
    .select("id, user_id, started_at, completed_at, rating")
    .eq("interview_config_id", configId);

  if (sessionIdSet !== null) {
    query = query.in("id", Array.from(sessionIdSet));
  }
  if (filter.status === "completed") {
    query = query.not("completed_at", "is", null);
  } else if (filter.status === "in_progress") {
    query = query.is("completed_at", null);
  }
  if (filter.startedFrom) {
    query = query.gte("started_at", filter.startedFrom);
  }
  if (filter.startedTo) {
    // 「終了日まで含める」運用にするため、終了日 +1 日の 00:00 を上限にする
    const to = new Date(filter.startedTo);
    if (!Number.isNaN(to.getTime())) {
      to.setUTCDate(to.getUTCDate() + 1);
      query = query.lt("started_at", to.toISOString());
    }
  }

  const { data: sessions, error: sessErr } = await query.order("started_at", {
    ascending: filter.sort === "oldest",
  });
  if (sessErr) {
    console.error("Failed to fetch sessions:", sessErr);
    return [];
  }
  const sessionRows = (sessions ?? []) as SessionRow[];
  if (sessionRows.length === 0) return [];

  const sessionIds = sessionRows.map((s) => s.id);
  const { data: messagesRaw, error: msgErr } = await supabase
    .from("interview_messages")
    .select("interview_session_id, role, content, created_at")
    .in("interview_session_id", sessionIds)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });
  if (msgErr) {
    console.error("Failed to fetch messages for aggregation:", msgErr);
    return [];
  }

  const aggregated = aggregateSessions(
    sessionRows,
    (messagesRaw ?? []) as MessageRow[]
  );

  const filtered = aggregated.filter((item) => {
    if (
      filter.hasUserMessage === "with_user" &&
      item.user_message_count === 0
    ) {
      return false;
    }
    if (
      filter.hasUserMessage === "without_user" &&
      item.user_message_count > 0
    ) {
      return false;
    }
    if (filter.lowMessageOnly && item.message_count > LOW_MESSAGE_THRESHOLD) {
      return false;
    }
    return true;
  });

  if (filter.sort === "most_messages") {
    return [...filtered].sort((a, b) => b.message_count - a.message_count);
  }
  return filtered;
}

/** session 行と メッセージ行 から ConversationListItem を組み立てる純粋的な集計処理 */
function aggregateSessions(
  sessions: SessionRow[],
  messages: MessageRow[]
): ConversationListItem[] {
  const messagesBySession = new Map<string, MessageRow[]>();
  for (const m of messages) {
    const list = messagesBySession.get(m.interview_session_id);
    if (list) {
      list.push(m);
    } else {
      messagesBySession.set(m.interview_session_id, [m]);
    }
  }

  return sessions.map((s) => {
    const ms = messagesBySession.get(s.id) ?? [];
    const userMessages = ms.filter((m) => m.role === "user");
    const assistantMessages = ms.filter((m) => m.role === "assistant");
    const latest = ms.at(-1);
    return {
      id: s.id,
      user_id: s.user_id,
      started_at: s.started_at,
      completed_at: s.completed_at,
      rating: s.rating,
      message_count: ms.length,
      user_message_count: userMessages.length,
      assistant_message_count: assistantMessages.length,
      first_user_message: userMessages[0]?.content ?? null,
      latest_message_at: latest?.created_at ?? null,
    };
  });
}

async function findSessionIdsMatchingTextSearch(
  configId: string,
  q: string | null
): Promise<Set<string> | null> {
  if (!q) return null;

  const supabase = createAdminClient();
  const { data: configSessions, error: cfgErr } = await supabase
    .from("interview_sessions")
    .select("id")
    .eq("interview_config_id", configId);
  if (cfgErr) {
    console.error("Failed to list session ids for text search:", cfgErr);
    return new Set();
  }
  const ids = (configSessions ?? []).map((r) => r.id);
  if (ids.length === 0) return new Set();

  // ILIKE は ANSI 文字でも全角でも前方/後方ワイルドカードで動作する。
  // % と _ はエスケープが必要だが MVP では検索は管理者のみ・短文想定なので未対応。
  const { data: matches, error: msgErr } = await supabase
    .from("interview_messages")
    .select("interview_session_id")
    .in("interview_session_id", ids)
    .ilike("content", `%${q}%`);
  if (msgErr) {
    console.error("Failed to search interview_messages content:", msgErr);
    return new Set();
  }
  return new Set((matches ?? []).map((m) => m.interview_session_id));
}

/** ページング済みの会話一覧 + 総件数を返す（UI 用）。 */
export async function getTopicConversations(
  configId: string,
  filter: ConversationsFilter
): Promise<ConversationListResult> {
  const all = await findFilteredItems(configId, filter);
  const totalCount = all.length;
  const offset = (filter.page - 1) * filter.perPage;
  const items = all.slice(offset, offset + filter.perPage);
  return { items, totalCount };
}

/**
 * CSV 出力用に、フィルタ適用後の全件をメッセージ詳細付きで返す。
 * UI と同じソート順で並べる（「現在のフィルター条件を反映して出力」要件を満たす）。
 */
export async function getTopicConversationsForCsv(
  configId: string,
  filter: ConversationsFilter
): Promise<ConversationDetail[]> {
  const all = await findFilteredItems(configId, filter);
  if (all.length === 0) return [];

  const ids = all.map((i) => i.id);
  const supabase = createAdminClient();
  const { data: messagesRaw, error } = await supabase
    .from("interview_messages")
    .select("interview_session_id, role, content, created_at")
    .in("interview_session_id", ids)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });
  if (error) {
    console.error("Failed to fetch messages for CSV:", error);
    return [];
  }

  const messagesBySession = new Map<
    string,
    { role: "user" | "assistant"; content: string }[]
  >();
  for (const m of (messagesRaw ?? []) as MessageRow[]) {
    const list = messagesBySession.get(m.interview_session_id) ?? [];
    list.push({ role: m.role, content: m.content });
    messagesBySession.set(m.interview_session_id, list);
  }

  return all.map((item) => ({
    session_id: item.id,
    user_id: item.user_id,
    started_at: item.started_at,
    completed_at: item.completed_at,
    rating: item.rating,
    messages: messagesBySession.get(item.id) ?? [],
  }));
}
