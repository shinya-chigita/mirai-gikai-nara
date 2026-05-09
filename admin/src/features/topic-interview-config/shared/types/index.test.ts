import { describe, expect, it } from "vitest";
import { topicInterviewConfigSchema } from "./index";

describe("topicInterviewConfigSchema", () => {
  const validInput = {
    name: "県政で気になること",
    status: "closed" as const,
    mode: "discover" as const,
    topic_title: "奈良県政で気になることを教えてください",
  };

  it("最小必須項目で検証を通す", () => {
    const result = topicInterviewConfigSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("name が空文字だと失敗する", () => {
    const result = topicInterviewConfigSchema.safeParse({
      ...validInput,
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("topic_title が空文字だと失敗する", () => {
    const result = topicInterviewConfigSchema.safeParse({
      ...validInput,
      topic_title: "",
    });
    expect(result.success).toBe(false);
  });

  it("estimated_duration は 1〜180 以外で失敗する", () => {
    expect(
      topicInterviewConfigSchema.safeParse({
        ...validInput,
        estimated_duration: 0,
      }).success
    ).toBe(false);
    expect(
      topicInterviewConfigSchema.safeParse({
        ...validInput,
        estimated_duration: 181,
      }).success
    ).toBe(false);
    expect(
      topicInterviewConfigSchema.safeParse({
        ...validInput,
        estimated_duration: 30,
      }).success
    ).toBe(true);
  });

  it("不明な chat_model 文字列は refine で失敗する", () => {
    const result = topicInterviewConfigSchema.safeParse({
      ...validInput,
      chat_model: "unknown/model-999",
    });
    expect(result.success).toBe(false);
  });

  it("chat_model が null / undefined は許容", () => {
    expect(
      topicInterviewConfigSchema.safeParse({
        ...validInput,
        chat_model: null,
      }).success
    ).toBe(true);
    expect(topicInterviewConfigSchema.safeParse(validInput).success).toBe(true);
  });

  it("topic_description は 2000 文字以内", () => {
    const result = topicInterviewConfigSchema.safeParse({
      ...validInput,
      topic_description: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  describe("mode フィールド", () => {
    it("discover を許容する", () => {
      const result = topicInterviewConfigSchema.safeParse({
        ...validInput,
        mode: "discover",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.mode).toBe("discover");
      }
    });

    it("broad_listening を許容する", () => {
      const result = topicInterviewConfigSchema.safeParse({
        ...validInput,
        mode: "broad_listening",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.mode).toBe("broad_listening");
      }
    });

    it("topic scope では認められない loop / bulk は失敗する", () => {
      expect(
        topicInterviewConfigSchema.safeParse({ ...validInput, mode: "loop" })
          .success
      ).toBe(false);
      expect(
        topicInterviewConfigSchema.safeParse({ ...validInput, mode: "bulk" })
          .success
      ).toBe(false);
    });

    it("mode 未指定は失敗する（フォーム側で必ず初期値を入れる前提）", () => {
      const { mode: _mode, ...withoutMode } = validInput;
      const result = topicInterviewConfigSchema.safeParse(withoutMode);
      expect(result.success).toBe(false);
    });
  });
});
