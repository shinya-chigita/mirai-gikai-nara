/**
 * 議会発言をプロンプト整形関数に渡すための最小 shape。
 * `BillStatement` は `server-only` モジュールに由来するため、
 * shared 層で直接 import せず、必要なフィールドだけを局所的に定義する。
 */
export type ProceedingStatementInput = {
  speaker_name: string;
  role: string | null;
  text: string;
  meeting_date: string | null;
};

// LLM コンテキスト量と精度のバランスを踏まえた上限。変更時はトークン消費量の実測を推奨。
const MAX_STATEMENTS = 20;
const MAX_CHARS_PER_STATEMENT = 500;

/** 発言テキスト冒頭の話者名プレフィックス等を除去する */
function cleanStatementText(text: string): string {
  return text
    .replace(/^[○◎◆△▲▼＊]/, "")
    .replace(/^(?:議長|副議長|知事|[^（]+)（[^）]+）\s*/, "")
    .trim();
}

function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}…`;
}

function formatSpeakerLine(statement: ProceedingStatementInput): string {
  const role = statement.role?.trim();
  const date = statement.meeting_date?.trim();
  const meta = [role, date].filter(Boolean).join("、");
  return meta ? `${statement.speaker_name}（${meta}）` : statement.speaker_name;
}

/**
 * 議会発言配列をLLMプロンプト用の文字列セクションに整形する純粋関数。
 *
 * 長文になりがちな会議録の性質を踏まえ:
 *   - 上位 MAX_STATEMENTS 件に絞る（入力順序を尊重）
 *   - 1発言あたり MAX_CHARS_PER_STATEMENT で切り詰め
 *
 * 出力例:
 *   ## 議会での発言（会議録抜粋）
 *   - 山田太郎（自由民主党、2026-02-15）: 「発言本文…」
 *
 * 発言が無い場合は空文字を返す（セクションごと非表示）。
 */
export function formatProceedingStatementsForPrompt(
  statements: ProceedingStatementInput[] | undefined
): string {
  if (!statements || statements.length === 0) return "";

  const lines = statements.slice(0, MAX_STATEMENTS).map((statement) => {
    const cleaned = cleanStatementText(statement.text);
    const truncated = truncate(cleaned, MAX_CHARS_PER_STATEMENT);
    return `- ${formatSpeakerLine(statement)}: 「${truncated}」`;
  });

  if (lines.length === 0) return "";

  return `## 議会での発言（会議録抜粋）
${lines.join("\n")}`;
}
