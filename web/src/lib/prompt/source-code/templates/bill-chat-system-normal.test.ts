import { describe, expect, it } from "vitest";
import { buildBillChatSystemNormalPrompt } from "./bill-chat-system-normal";

describe("buildBillChatSystemNormalPrompt", () => {
  it("4つのパラメータがプロンプトに埋め込まれる", () => {
    const result = buildBillChatSystemNormalPrompt(
      "テスト法案名",
      "テスト法案タイトル",
      "テスト法案要約",
      "テスト法案詳細"
    );

    expect(result).toContain("テスト法案名");
    expect(result).toContain("テスト法案タイトル");
    expect(result).toContain("テスト法案要約");
    expect(result).toContain("テスト法案詳細");
  });

  it("難易度「ふつう」セクションが含まれる", () => {
    const result = buildBillChatSystemNormalPrompt("a", "b", "c", "d");

    expect(result).toContain("回答の難易度：ふつう");
  });

  it("みらい議会の説明が含まれる", () => {
    const result = buildBillChatSystemNormalPrompt("a", "b", "c", "d");

    expect(result).toContain("みらい議会");
    expect(result).toContain("チームみらい");
  });

  it("factionStancesSection を渡すとプロンプトに含まれる", () => {
    const result = buildBillChatSystemNormalPrompt(
      "a",
      "b",
      "c",
      "d",
      "## 会派の立場\n- X会派: 賛成 — 「ok」"
    );

    expect(result).toContain("## 会派の立場");
    expect(result).toContain("X会派: 賛成 — 「ok」");
  });

  it("factionStancesSection が空文字の場合はセクションが含まれない", () => {
    const result = buildBillChatSystemNormalPrompt("a", "b", "c", "d", "");

    expect(result).not.toContain("## 会派の立場");
  });

  it("proceedingStatementsSection を渡すとプロンプトに含まれる", () => {
    const result = buildBillChatSystemNormalPrompt(
      "a",
      "b",
      "c",
      "d",
      "",
      "## 議会での発言（会議録抜粋）\n- 山田（自由民主党、2026-02-15）: 「発言」"
    );

    expect(result).toContain("## 議会での発言（会議録抜粋）");
    expect(result).toContain("山田（自由民主党、2026-02-15）: 「発言」");
  });

  it("proceedingStatementsSection が空文字の場合はセクションが含まれない", () => {
    const result = buildBillChatSystemNormalPrompt("a", "b", "c", "d", "", "");

    expect(result).not.toContain("## 議会での発言");
  });
});
