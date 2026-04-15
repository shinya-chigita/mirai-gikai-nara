import { describe, expect, it } from "vitest";
import type { FactionStance } from "@/features/bills/shared/types";
import { formatFactionStancesForPrompt } from "./format-faction-stances";

function makeStance(overrides: Partial<FactionStance> = {}): FactionStance {
  return {
    id: "s1",
    stance: "for",
    comment: null,
    faction: {
      id: "f1",
      name: "sample",
      display_name: "サンプル会派",
      sort_order: 1,
    },
    ...overrides,
  };
}

describe("formatFactionStancesForPrompt", () => {
  it("スタンス未定義・空配列の場合は空文字を返す", () => {
    expect(formatFactionStancesForPrompt(undefined)).toBe("");
    expect(formatFactionStancesForPrompt([])).toBe("");
  });

  it("スタンスラベルが日本語で展開される", () => {
    const result = formatFactionStancesForPrompt([
      makeStance({ stance: "for", comment: "賛成理由" }),
      makeStance({ stance: "against", comment: "反対理由" }),
    ]);
    expect(result).toContain("サンプル会派: 賛成 — 「賛成理由」");
    expect(result).toContain("サンプル会派: 反対 — 「反対理由」");
  });

  it("コメントがnullの場合は「コメントなし」と表示される", () => {
    const result = formatFactionStancesForPrompt([
      makeStance({ comment: null }),
    ]);
    expect(result).toContain("コメントなし");
  });

  it("コメントが空白のみの場合も「コメントなし」と表示される", () => {
    const result = formatFactionStancesForPrompt([
      makeStance({ comment: "   " }),
    ]);
    expect(result).toContain("コメントなし");
  });

  it("見出しセクション `## 会派の立場` が含まれる", () => {
    const result = formatFactionStancesForPrompt([makeStance()]);
    expect(result).toContain("## 会派の立場");
  });

  it("複数の会派が順序通りに整形される", () => {
    const stances = [
      makeStance({
        id: "a",
        faction: {
          id: "f1",
          name: "a",
          display_name: "A会派",
          sort_order: 1,
        },
        stance: "for",
        comment: "コメントA",
      }),
      makeStance({
        id: "b",
        faction: {
          id: "f2",
          name: "b",
          display_name: "B会派",
          sort_order: 2,
        },
        stance: "against",
        comment: "コメントB",
      }),
    ];
    const result = formatFactionStancesForPrompt(stances);
    const indexA = result.indexOf("A会派");
    const indexB = result.indexOf("B会派");
    expect(indexA).toBeGreaterThan(0);
    expect(indexB).toBeGreaterThan(indexA);
  });
});
