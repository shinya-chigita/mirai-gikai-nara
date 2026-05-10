/**
 * トピック会話ログのCSV出力ビルダ。
 *
 * 純粋関数。データ取得は別レイヤーが担当し、ここではフォーマットだけを行う。
 */

export type ConversationCsvMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ConversationCsvRow = {
  session_id: string;
  interview_config_id: string;
  started_at: string;
  completed_at: string | null;
  user_id: string;
  rating: number | null;
  messages: ConversationCsvMessage[];
};

const CSV_HEADERS = [
  "session_id",
  "interview_config_id",
  "started_at",
  "completed_at",
  "user_id",
  "message_count",
  "user_message_count",
  "assistant_message_count",
  "first_user_message",
  "all_user_messages",
  "all_messages_text",
  "rating",
] as const;

/**
 * RFC4180 準拠の CSV エスケープ。
 * - " を "" に置換
 * - " , 改行 のいずれかを含むなら全体を " で囲む
 * - null/undefined は空文字
 */
export function escapeCsvCell(
  value: string | number | null | undefined
): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str === "") return "";
  const needsQuote = /[",\r\n]/.test(str);
  const escaped = str.replace(/"/g, '""');
  return needsQuote ? `"${escaped}"` : escaped;
}

/**
 * 会話 1 件分の messages を [role] content 形式の単一テキストに連結する。
 * 区切りは改行 2 つ。CSV のセル内では本関数の出力をそのまま入れて escape する。
 */
export function joinMessagesAsText(messages: ConversationCsvMessage[]): string {
  return messages.map((m) => `[${m.role}] ${m.content}`).join("\n\n");
}

/** ユーザー発言だけを改行2つで連結する。 */
export function joinUserMessages(messages: ConversationCsvMessage[]): string {
  return messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n\n");
}

/** 最初のユーザー発言を取り出す。なければ空文字。 */
export function firstUserMessage(messages: ConversationCsvMessage[]): string {
  return messages.find((m) => m.role === "user")?.content ?? "";
}

/** 1 行分の CSV 文字列を組み立てる（末尾改行は付けない）。 */
export function buildConversationCsvLine(row: ConversationCsvRow): string {
  const userMessages = row.messages.filter((m) => m.role === "user");
  const assistantMessages = row.messages.filter((m) => m.role === "assistant");

  const cells = [
    row.session_id,
    row.interview_config_id,
    row.started_at,
    row.completed_at ?? "",
    row.user_id,
    row.messages.length,
    userMessages.length,
    assistantMessages.length,
    firstUserMessage(row.messages),
    joinUserMessages(row.messages),
    joinMessagesAsText(row.messages),
    row.rating,
  ];
  return cells.map(escapeCsvCell).join(",");
}

/**
 * 全行の CSV を組み立てる。
 * - BOM を先頭に付与（Excel 互換のため）
 * - 改行コードは CRLF
 */
export function buildConversationsCsv(rows: ConversationCsvRow[]): string {
  const BOM = "\uFEFF";
  const headerLine = CSV_HEADERS.join(",");
  const dataLines = rows.map(buildConversationCsvLine);
  return BOM + [headerLine, ...dataLines].join("\r\n");
}
