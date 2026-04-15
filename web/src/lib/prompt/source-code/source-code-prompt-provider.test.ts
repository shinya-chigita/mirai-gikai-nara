import { describe, expect, it } from "vitest";
import { SourceCodePromptProvider } from "./source-code-prompt-provider";

describe("SourceCodePromptProvider", () => {
  const provider = new SourceCodePromptProvider();

  it("top-chat-system プロンプトを変数付きで返す", async () => {
    const result = await provider.getPrompt("top-chat-system", {
      billSummary: '[{"id":"1","name":"テスト法案"}]',
    });

    expect(result.content).toContain("みらい議会");
    expect(result.content).toContain('[{"id":"1","name":"テスト法案"}]');
  });

  it("bill-chat-system-normal プロンプトを変数付きで返す", async () => {
    const result = await provider.getPrompt("bill-chat-system-normal", {
      billName: "テスト法案",
      billTitle: "テスト法案のタイトル",
      billSummary: "テスト法案の要約",
      billContent: "テスト法案の詳細内容",
    });

    expect(result.content).toContain("みらい議会");
    expect(result.content).toContain("テスト法案");
    expect(result.content).toContain("テスト法案のタイトル");
    expect(result.content).toContain("テスト法案の要約");
    expect(result.content).toContain("テスト法案の詳細内容");
    expect(result.content).toContain("回答の難易度：ふつう");
  });

  it("metadata にソースコード情報を含む", async () => {
    const result = await provider.getPrompt("top-chat-system", {
      billSummary: "test",
    });

    const metadata = JSON.parse(result.metadata);
    expect(metadata.source).toBe("source-code");
    expect(metadata.name).toBe("top-chat-system");
  });

  it("存在しないプロンプト名でエラーをスローする", async () => {
    await expect(provider.getPrompt("nonexistent-prompt")).rejects.toThrow(
      'Source code prompt not found: "nonexistent-prompt"'
    );
  });

  it("billSummary が未指定の場合にエラーをスローする", async () => {
    await expect(provider.getPrompt("top-chat-system")).rejects.toThrow(
      'Missing required variable "billSummary"'
    );
  });

  it("bill-chat-system-normal の必須変数が未指定の場合にエラーをスローする", async () => {
    await expect(
      provider.getPrompt("bill-chat-system-normal", {})
    ).rejects.toThrow(
      'Missing required variables for prompt "bill-chat-system-normal"'
    );
  });

  it("bill-chat-system-normal は空文字列の変数を許容する", async () => {
    const result = await provider.getPrompt("bill-chat-system-normal", {
      billName: "",
      billTitle: "",
      billSummary: "",
      billContent: "",
    });

    expect(result.content).toContain("みらい議会");
  });

  it("bill-chat-system-hard プロンプトを変数付きで返す", async () => {
    const result = await provider.getPrompt("bill-chat-system-hard", {
      billName: "テスト法案",
      billTitle: "テスト法案のタイトル",
      billSummary: "テスト法案の要約",
      billContent: "テスト法案の詳細内容",
    });

    expect(result.content).toContain("みらい議会");
    expect(result.content).toContain("テスト法案");
    expect(result.content).toContain("テスト法案のタイトル");
    expect(result.content).toContain("テスト法案の要約");
    expect(result.content).toContain("テスト法案の詳細内容");
    expect(result.content).toContain("回答の難易度：難しい");
  });

  it("bill-chat-system-hard の必須変数が未指定の場合にエラーをスローする", async () => {
    await expect(
      provider.getPrompt("bill-chat-system-hard", {})
    ).rejects.toThrow(
      'Missing required variables for prompt "bill-chat-system-hard"'
    );
  });

  it("bill-chat-system-hard は空文字列の変数を許容する", async () => {
    const result = await provider.getPrompt("bill-chat-system-hard", {
      billName: "",
      billTitle: "",
      billSummary: "",
      billContent: "",
    });

    expect(result.content).toContain("みらい議会");
  });

  it("bill-chat-system-normal に factionStancesSection を渡すとプロンプトに含まれる", async () => {
    const result = await provider.getPrompt("bill-chat-system-normal", {
      billName: "テスト法案",
      billTitle: "テスト法案のタイトル",
      billSummary: "テスト法案の要約",
      billContent: "テスト法案の詳細内容",
      factionStancesSection: "## 会派の立場\n- A会派: 賛成 — 「コメントA」",
    });

    expect(result.content).toContain("## 会派の立場");
    expect(result.content).toContain("A会派: 賛成 — 「コメントA」");
  });

  it("bill-chat-system-hard に factionStancesSection を渡すとプロンプトに含まれる", async () => {
    const result = await provider.getPrompt("bill-chat-system-hard", {
      billName: "テスト法案",
      billTitle: "テスト法案のタイトル",
      billSummary: "テスト法案の要約",
      billContent: "テスト法案の詳細内容",
      factionStancesSection: "## 会派の立場\n- B会派: 反対 — 「コメントB」",
    });

    expect(result.content).toContain("## 会派の立場");
    expect(result.content).toContain("B会派: 反対 — 「コメントB」");
  });

  it("factionStancesSection 未指定でも正常動作する（後方互換）", async () => {
    const result = await provider.getPrompt("bill-chat-system-normal", {
      billName: "テスト法案",
      billTitle: "テスト法案のタイトル",
      billSummary: "テスト法案の要約",
      billContent: "テスト法案の詳細内容",
    });

    expect(result.content).not.toContain("## 会派の立場");
  });

  it("bill-chat-system-normal に proceedingStatementsSection を渡すとプロンプトに含まれる", async () => {
    const result = await provider.getPrompt("bill-chat-system-normal", {
      billName: "テスト法案",
      billTitle: "テスト法案のタイトル",
      billSummary: "テスト法案の要約",
      billContent: "テスト法案の詳細内容",
      proceedingStatementsSection:
        "## 議会での発言（会議録抜粋）\n- 山田（賛成派、2026-02-15）: 「発言X」",
    });

    expect(result.content).toContain("## 議会での発言（会議録抜粋）");
    expect(result.content).toContain("山田（賛成派、2026-02-15）: 「発言X」");
  });

  it("bill-chat-system-hard に proceedingStatementsSection を渡すとプロンプトに含まれる", async () => {
    const result = await provider.getPrompt("bill-chat-system-hard", {
      billName: "テスト法案",
      billTitle: "テスト法案のタイトル",
      billSummary: "テスト法案の要約",
      billContent: "テスト法案の詳細内容",
      proceedingStatementsSection:
        "## 議会での発言（会議録抜粋）\n- 田中（反対派、2026-02-15）: 「発言Y」",
    });

    expect(result.content).toContain("## 議会での発言（会議録抜粋）");
    expect(result.content).toContain("田中（反対派、2026-02-15）: 「発言Y」");
  });

  it("proceedingStatementsSection 未指定でも正常動作する（後方互換）", async () => {
    const result = await provider.getPrompt("bill-chat-system-normal", {
      billName: "テスト法案",
      billTitle: "テスト法案のタイトル",
      billSummary: "テスト法案の要約",
      billContent: "テスト法案の詳細内容",
    });

    expect(result.content).not.toContain("## 議会での発言");
  });
});
