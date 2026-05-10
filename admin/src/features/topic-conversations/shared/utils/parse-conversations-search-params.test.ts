import { describe, expect, it } from "vitest";
import {
  parseConversationsSearchParams,
  serializeConversationsFilter,
} from "./parse-conversations-search-params";

describe("parseConversationsSearchParams", () => {
  it("空クエリでデフォルト値を返す", () => {
    const f = parseConversationsSearchParams({});
    expect(f).toEqual({
      q: null,
      status: "all",
      hasUserMessage: "all",
      lowMessageOnly: false,
      startedFrom: null,
      startedTo: null,
      sort: "newest",
      page: 1,
      perPage: 20,
    });
  });

  it("q は trim される。空白だけは null", () => {
    expect(parseConversationsSearchParams({ q: "  通院  " }).q).toBe("通院");
    expect(parseConversationsSearchParams({ q: "   " }).q).toBeNull();
  });

  it("status は完了/進行中のみ許可、不正値は all", () => {
    expect(parseConversationsSearchParams({ status: "completed" }).status).toBe(
      "completed"
    );
    expect(parseConversationsSearchParams({ status: "weird" }).status).toBe(
      "all"
    );
  });

  it("hasUser は with_user/without_user のみ許可", () => {
    expect(
      parseConversationsSearchParams({ hasUser: "with_user" }).hasUserMessage
    ).toBe("with_user");
    expect(
      parseConversationsSearchParams({ hasUser: "without_user" }).hasUserMessage
    ).toBe("without_user");
    expect(parseConversationsSearchParams({ hasUser: "" }).hasUserMessage).toBe(
      "all"
    );
  });

  it("lowMessage は true/1 のみ true", () => {
    expect(
      parseConversationsSearchParams({ lowMessage: "true" }).lowMessageOnly
    ).toBe(true);
    expect(
      parseConversationsSearchParams({ lowMessage: "1" }).lowMessageOnly
    ).toBe(true);
    expect(
      parseConversationsSearchParams({ lowMessage: "no" }).lowMessageOnly
    ).toBe(false);
  });

  it("不正な日付は null", () => {
    expect(
      parseConversationsSearchParams({ from: "abc" }).startedFrom
    ).toBeNull();
    expect(
      parseConversationsSearchParams({ from: "2026-05-01" }).startedFrom
    ).toBe("2026-05-01");
  });

  it("perPage は 20/50/100 のみ、それ以外は 20", () => {
    expect(parseConversationsSearchParams({ perPage: "50" }).perPage).toBe(50);
    expect(parseConversationsSearchParams({ perPage: "100" }).perPage).toBe(
      100
    );
    expect(parseConversationsSearchParams({ perPage: "999" }).perPage).toBe(20);
  });

  it("page は 1 以上、不正値は 1", () => {
    expect(parseConversationsSearchParams({ page: "3" }).page).toBe(3);
    expect(parseConversationsSearchParams({ page: "0" }).page).toBe(1);
    expect(parseConversationsSearchParams({ page: "-2" }).page).toBe(1);
    expect(parseConversationsSearchParams({ page: "abc" }).page).toBe(1);
  });

  it("string[] が渡された場合は先頭値を採用", () => {
    expect(
      parseConversationsSearchParams({ status: ["completed", "in_progress"] })
        .status
    ).toBe("completed");
  });
});

describe("serializeConversationsFilter", () => {
  const defaults = parseConversationsSearchParams({});

  it("デフォルト値はクエリに含めない（短く保つ）", () => {
    expect(serializeConversationsFilter(defaults)).toBe("");
  });

  it("非デフォルト値だけ含む", () => {
    expect(
      serializeConversationsFilter({
        ...defaults,
        q: "通院",
        status: "completed",
        page: 3,
        perPage: 50,
      })
    ).toBe("q=%E9%80%9A%E9%99%A2&status=completed&page=3&perPage=50");
  });
});
