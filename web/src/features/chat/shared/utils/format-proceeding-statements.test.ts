import { describe, expect, it } from "vitest";
import {
  formatProceedingStatementsForPrompt,
  type ProceedingStatementInput,
} from "./format-proceeding-statements";

function makeStatement(
  overrides: Partial<ProceedingStatementInput> = {}
): ProceedingStatementInput {
  return {
    speaker_name: "山田太郎",
    role: null,
    text: "発言本文です。",
    meeting_date: null,
    ...overrides,
  };
}

describe("formatProceedingStatementsForPrompt", () => {
  it("未定義・空配列の場合は空文字を返す", () => {
    expect(formatProceedingStatementsForPrompt(undefined)).toBe("");
    expect(formatProceedingStatementsForPrompt([])).toBe("");
  });

  it("見出しセクション `## 議会での発言（会議録抜粋）` が含まれる", () => {
    const result = formatProceedingStatementsForPrompt([makeStatement()]);
    expect(result).toContain("## 議会での発言（会議録抜粋）");
  });

  it("話者名・役職・日付が「（役職、日付）」形式で連結される", () => {
    const result = formatProceedingStatementsForPrompt([
      makeStatement({
        speaker_name: "山田太郎",
        role: "自由民主党",
        meeting_date: "2026-02-15",
        text: "本件について賛成します。",
      }),
    ]);
    expect(result).toContain(
      "山田太郎（自由民主党、2026-02-15）: 「本件について賛成します。」"
    );
  });

  it("役職なしの場合は役職部分が省略される", () => {
    const result = formatProceedingStatementsForPrompt([
      makeStatement({
        speaker_name: "田中花子",
        role: null,
        meeting_date: "2026-02-15",
        text: "発言",
      }),
    ]);
    expect(result).toContain("田中花子（2026-02-15）");
  });

  it("役職も日付も無い場合は括弧なしで話者名のみ表示", () => {
    const result = formatProceedingStatementsForPrompt([
      makeStatement({ speaker_name: "匿名", role: null, meeting_date: null }),
    ]);
    expect(result).toContain("- 匿名:");
    expect(result).not.toContain("匿名（");
  });

  it("長い発言は500文字で切り詰められ…が付く", () => {
    const longText = "あ".repeat(600);
    const result = formatProceedingStatementsForPrompt([
      makeStatement({ text: longText }),
    ]);
    expect(result).toContain(`「${"あ".repeat(500)}…」`);
    expect(result).not.toContain("あ".repeat(501));
  });

  it("500文字以下の発言は切り詰められない", () => {
    const text = "あ".repeat(499);
    const result = formatProceedingStatementsForPrompt([
      makeStatement({ text }),
    ]);
    expect(result).toContain(`「${text}」`);
    expect(result).not.toContain("…」");
  });

  it("発言数が20件を超えると上位20件のみ含まれる", () => {
    const statements = Array.from({ length: 25 }, (_, i) =>
      makeStatement({ text: `発言${i}` })
    );
    const result = formatProceedingStatementsForPrompt(statements);
    expect(result).toContain("発言0");
    expect(result).toContain("発言19");
    expect(result).not.toContain("発言20");
    expect(result).not.toContain("発言24");
  });

  it("先頭の記号プレフィックス（○◎等）は除去される", () => {
    const result = formatProceedingStatementsForPrompt([
      makeStatement({ text: "○山田議員（自由民主党）本件について賛成です。" }),
    ]);
    expect(result).not.toContain("○");
    expect(result).toContain("本件について賛成です。");
  });

  it("複数発言の順序は入力順が保たれる", () => {
    const result = formatProceedingStatementsForPrompt([
      makeStatement({ text: "最初の発言" }),
      makeStatement({ text: "次の発言" }),
    ]);
    const idxFirst = result.indexOf("最初の発言");
    const idxSecond = result.indexOf("次の発言");
    expect(idxFirst).toBeGreaterThan(0);
    expect(idxSecond).toBeGreaterThan(idxFirst);
  });
});
