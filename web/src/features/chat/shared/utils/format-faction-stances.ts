import {
  type FactionStance,
  STANCE_LABELS,
} from "@/features/bills/shared/types";

/**
 * 会派スタンス配列をLLMプロンプト用の文字列セクションに整形する純粋関数。
 *
 * 出力例:
 *   ## 会派の立場
 *   - A会派: 賛成 — 「コメント本文」
 *   - B会派: 反対 — コメントなし
 *
 * 会派スタンスが無い場合は空文字を返す（プロンプトにセクションごと表示しない）。
 */
export function formatFactionStancesForPrompt(
  stances: FactionStance[] | undefined
): string {
  if (!stances || stances.length === 0) return "";

  const lines = stances.map((s) => {
    // DB側にenum追加直後など型と実データが一時的にずれる場合のフォールバック
    const label = STANCE_LABELS[s.stance] ?? s.stance;
    const comment = s.comment?.trim();
    const commentPart = comment ? `「${comment}」` : "コメントなし";
    return `- ${s.faction.display_name}: ${label} — ${commentPart}`;
  });

  return `## 会派の立場
${lines.join("\n")}`;
}
