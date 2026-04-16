import { describe, expect, it } from "vitest";
import {
  type BillIndexEntry,
  formatBillIndexForPrompt,
} from "./format-bill-index";

function makeBill(overrides: Partial<BillIndexEntry> = {}): BillIndexEntry {
  return {
    id: "bill-1",
    name: "議案A",
    summary: "概要A",
    tags: [],
    ...overrides,
  };
}

describe("formatBillIndexForPrompt", () => {
  it("空配列・undefined の場合はプレースホルダ文を返す", () => {
    expect(formatBillIndexForPrompt(undefined)).toContain(
      "公開中の議案はありません"
    );
    expect(formatBillIndexForPrompt([])).toContain("公開中の議案はありません");
  });

  it("議案IDが [議案ID:xxx] 形式で含まれる", () => {
    const result = formatBillIndexForPrompt([makeBill({ id: "abc-123" })]);
    expect(result).toContain("[議案ID:abc-123]");
  });

  it("タグが「タグ: A, B」形式で連結される", () => {
    const result = formatBillIndexForPrompt([
      makeBill({
        tags: [{ label: "教育" }, { label: "子育て" }],
      }),
    ]);
    expect(result).toContain("タグ: 教育, 子育て");
  });

  it("タグなしの場合はタグ部分が省略される", () => {
    const result = formatBillIndexForPrompt([makeBill({ tags: [] })]);
    expect(result).not.toContain("タグ:");
  });

  it("要約が200文字を超えると切り詰められ…が付く", () => {
    const longSummary = "あ".repeat(300);
    const result = formatBillIndexForPrompt([
      makeBill({ summary: longSummary }),
    ]);
    expect(result).toContain(`${"あ".repeat(200)}…`);
    expect(result).not.toContain("あ".repeat(201));
  });

  it("要約が null/空文字なら要約部分が省略される", () => {
    const result = formatBillIndexForPrompt([makeBill({ summary: null })]);
    expect(result).not.toContain("要約:");
  });

  it("100件を超えると上位100件のみ含まれる", () => {
    const bills = Array.from({ length: 110 }, (_, i) =>
      makeBill({ id: `b${i}`, name: `議案${i}` })
    );
    const result = formatBillIndexForPrompt(bills);
    expect(result).toContain("議案0");
    expect(result).toContain("議案99");
    expect(result).not.toContain("議案100");
  });

  it("行頭に連番が付く", () => {
    const result = formatBillIndexForPrompt([
      makeBill({ id: "a", name: "X" }),
      makeBill({ id: "b", name: "Y" }),
    ]);
    expect(result).toMatch(/^1\. \[議案ID:a\] X/);
    expect(result).toContain("\n2. [議案ID:b] Y");
  });
});
