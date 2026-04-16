import { describe, expect, it } from "vitest";
import { buildTopicDiscoverSystemPrompt } from "./build-topic-system-prompt";

const baseInput = {
  topicTitle: "奈良県政で気になること",
  topicDescription: null,
  knowledgeSource: null,
  themes: null,
  billIndexSection: "1. [議案ID:bill-1] 議案A",
};

describe("buildTopicDiscoverSystemPrompt", () => {
  it("topic_title が見出し直後に含まれる", () => {
    const result = buildTopicDiscoverSystemPrompt(baseInput);
    expect(result).toContain("## トピック\n奈良県政で気になること");
  });

  it("議案カタログが末尾セクションに含まれる", () => {
    const result = buildTopicDiscoverSystemPrompt(baseInput);
    expect(result).toContain("## 議案カタログ（公開中の奈良県議会議案）");
    expect(result).toContain("1. [議案ID:bill-1] 議案A");
  });

  it("topic_description が指定されると本文に出る", () => {
    const result = buildTopicDiscoverSystemPrompt({
      ...baseInput,
      topicDescription: "テーマ説明文です",
    });
    expect(result).toContain("テーマ説明文です");
  });

  it("topic_description が null/空白なら出ない", () => {
    expect(
      buildTopicDiscoverSystemPrompt({
        ...baseInput,
        topicDescription: "   ",
      })
    ).not.toContain("   ");
  });

  it("themes が指定されると重点テーマセクションが出る", () => {
    const result = buildTopicDiscoverSystemPrompt({
      ...baseInput,
      themes: ["教育", "子育て"],
    });
    expect(result).toContain("## 重点テーマ");
    expect(result).toContain("- 教育");
    expect(result).toContain("- 子育て");
  });

  it("themes が空配列/null なら重点テーマセクションは出ない", () => {
    expect(
      buildTopicDiscoverSystemPrompt({ ...baseInput, themes: [] })
    ).not.toContain("## 重点テーマ");
    expect(buildTopicDiscoverSystemPrompt(baseInput)).not.toContain(
      "## 重点テーマ"
    );
  });

  it("knowledgeSource が指定されると補足知識セクションが出る", () => {
    const result = buildTopicDiscoverSystemPrompt({
      ...baseInput,
      knowledgeSource: "県の人口は130万人",
    });
    expect(result).toContain("## 補足知識");
    expect(result).toContain("県の人口は130万人");
  });

  it("議案IDフォーマットの指示がプロンプトに含まれる", () => {
    const result = buildTopicDiscoverSystemPrompt(baseInput);
    expect(result).toContain("[議案ID:xxx]");
  });

  it("中立性ルールが含まれる", () => {
    const result = buildTopicDiscoverSystemPrompt(baseInput);
    expect(result).toContain("政治的に中立");
  });
});
