/**
 * トピック型インタビューの discover プロンプトに渡す議案カタログを整形する純粋関数。
 * 各議案を「タグ・要約付きの一行」に整形し、LLM が関心 → 議案マッチを行えるようにする。
 *
 * 出力例:
 *   1. [議案ID:abc-123] 〇〇に関する条例 / タグ: 教育, 子育て / 要約: ...
 */

export type BillIndexEntry = {
  id: string;
  name: string;
  summary: string | null;
  tags: { label: string }[];
};

// プロンプト長を抑えるための上限。100件×（タイトル+タグ+要約200字）でおよそ数万字に収まる。
const MAX_BILLS = 100;
const MAX_SUMMARY_CHARS = 200;

function truncate(text: string | null | undefined, max: number): string {
  if (!text) return "";
  return text.length <= max ? text : `${text.slice(0, max)}…`;
}

export function formatBillIndexForPrompt(
  bills: BillIndexEntry[] | undefined
): string {
  if (!bills || bills.length === 0) {
    return "（公開中の議案はありません）";
  }

  const lines = bills.slice(0, MAX_BILLS).map((bill, index) => {
    const tagsPart =
      bill.tags.length > 0
        ? ` / タグ: ${bill.tags.map((t) => t.label).join(", ")}`
        : "";
    const summary = truncate(bill.summary, MAX_SUMMARY_CHARS);
    const summaryPart = summary ? ` / 要約: ${summary}` : "";
    return `${index + 1}. [議案ID:${bill.id}] ${bill.name}${tagsPart}${summaryPart}`;
  });

  return lines.join("\n");
}
