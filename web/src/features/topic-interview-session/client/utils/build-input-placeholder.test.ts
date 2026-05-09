import { describe, expect, it } from "vitest";
import { buildInputPlaceholder } from "./build-input-placeholder";

describe("buildInputPlaceholder", () => {
  it("discover モードでは固定文言を返す", () => {
    expect(buildInputPlaceholder("discover", "奈良の鹿対策")).toBe(
      "気になっていることを入力…"
    );
    expect(buildInputPlaceholder("discover", "")).toBe(
      "気になっていることを入力…"
    );
  });

  it("broad_listening で短い topicTitle はそのまま埋め込む", () => {
    expect(buildInputPlaceholder("broad_listening", "鹿対策")).toBe(
      "鹿対策について感じていることを入力…"
    );
  });

  it("broad_listening で前後空白は trim される", () => {
    expect(buildInputPlaceholder("broad_listening", "  鹿対策  ")).toBe(
      "鹿対策について感じていることを入力…"
    );
  });

  it("broad_listening で空 topicTitle は汎用文言になる", () => {
    expect(buildInputPlaceholder("broad_listening", "")).toBe(
      "このテーマについて感じていることを入力…"
    );
    expect(buildInputPlaceholder("broad_listening", "   ")).toBe(
      "このテーマについて感じていることを入力…"
    );
  });

  it("broad_listening で長すぎる topicTitle は汎用文言にフォールバックする", () => {
    // 24文字を超える長文（UI崩れ防止）
    const longTitle =
      "奈良県政において子育て家庭の負担軽減と教育機会の充実について";
    expect(longTitle.length).toBeGreaterThan(24);
    expect(buildInputPlaceholder("broad_listening", longTitle)).toBe(
      "このテーマについて感じていることを入力…"
    );
  });

  it("broad_listening で 24文字ぴったりは埋め込む", () => {
    const title24 = "あ".repeat(24);
    expect(buildInputPlaceholder("broad_listening", title24)).toBe(
      `${title24}について感じていることを入力…`
    );
  });
});
