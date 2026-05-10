import { describe, expect, it } from "vitest";
import {
  buildConversationCsvLine,
  buildConversationsCsv,
  type ConversationCsvRow,
  escapeCsvCell,
  firstUserMessage,
  joinMessagesAsText,
  joinUserMessages,
} from "./build-conversations-csv";

describe("escapeCsvCell", () => {
  it("ASCII 文字列はそのまま", () => {
    expect(escapeCsvCell("hello")).toBe("hello");
  });

  it("カンマ含むときは引用", () => {
    expect(escapeCsvCell("a,b")).toBe('"a,b"');
  });

  it("改行含むときは引用", () => {
    expect(escapeCsvCell("line1\nline2")).toBe('"line1\nline2"');
    expect(escapeCsvCell("line1\r\nline2")).toBe('"line1\r\nline2"');
  });

  it('" を "" にエスケープ', () => {
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""');
  });

  it("null / undefined は空文字", () => {
    expect(escapeCsvCell(null)).toBe("");
    expect(escapeCsvCell(undefined)).toBe("");
  });

  it("数値はそのまま文字列化", () => {
    expect(escapeCsvCell(0)).toBe("0");
    expect(escapeCsvCell(42)).toBe("42");
  });
});

describe("メッセージ集約", () => {
  const messages = [
    { role: "assistant" as const, content: "こんにちは" },
    { role: "user" as const, content: "鹿に優しくしてほしい" },
    { role: "assistant" as const, content: "そう感じたのは?" },
    { role: "user" as const, content: "観光客が多いとき" },
  ];

  it("firstUserMessage は最初のユーザー発言", () => {
    expect(firstUserMessage(messages)).toBe("鹿に優しくしてほしい");
  });

  it("ユーザー発言が無ければ空文字", () => {
    expect(firstUserMessage([{ role: "assistant", content: "AIだけ" }])).toBe(
      ""
    );
  });

  it("joinUserMessages はユーザー発言だけを 2 改行区切りで連結", () => {
    expect(joinUserMessages(messages)).toBe(
      "鹿に優しくしてほしい\n\n観光客が多いとき"
    );
  });

  it("joinMessagesAsText は role を付けて全件連結", () => {
    expect(joinMessagesAsText(messages)).toBe(
      "[assistant] こんにちは\n\n[user] 鹿に優しくしてほしい\n\n[assistant] そう感じたのは?\n\n[user] 観光客が多いとき"
    );
  });
});

describe("buildConversationCsvLine", () => {
  const baseRow: ConversationCsvRow = {
    session_id: "sess-001",
    interview_config_id: "cfg-001",
    started_at: "2026-05-09T01:00:00Z",
    completed_at: "2026-05-09T01:30:00Z",
    user_id: "user-001",
    rating: 4,
    messages: [
      { role: "assistant", content: "どんな思いですか?" },
      { role: "user", content: "通院が大変" },
      { role: "assistant", content: "どんな場面で?" },
      { role: "user", content: "雨の日" },
    ],
  };

  it("12列を出力する", () => {
    const cells = buildConversationCsvLine(baseRow).split(",");
    // 引用無しの単純フィールドが12個（all_messages_text は改行を含むので引用される）
    // split(",") では引用内のカンマも分割してしまうため、列数は厳密にはチェックしない。
    // ここではキー値のみチェック。
    expect(cells[0]).toBe("sess-001");
    expect(cells[1]).toBe("cfg-001");
    expect(cells[4]).toBe("user-001");
  });

  it("メッセージ数集計が正しい", () => {
    const line = buildConversationCsvLine(baseRow);
    // 最後に rating, その前 (-1, -2, -3, -4) に各メッセージ集計列が並ぶが、
    // 引用フィールドを含むので位置は不安定。代わりに含むかチェック。
    // message_count=4, user=2, assistant=2
    expect(line).toContain(",4,2,2,");
  });

  it("first_user_message が含まれる", () => {
    expect(buildConversationCsvLine(baseRow)).toContain("通院が大変");
  });

  it("all_user_messages は user 発言を 2 改行で連結（CSV内では引用）", () => {
    expect(buildConversationCsvLine(baseRow)).toContain(
      '"通院が大変\n\n雨の日"'
    );
  });

  it("rating が null なら空セル", () => {
    const line = buildConversationCsvLine({ ...baseRow, rating: null });
    expect(line.endsWith(",")).toBe(true);
  });

  it("completed_at が null なら空文字を出す", () => {
    const line = buildConversationCsvLine({ ...baseRow, completed_at: null });
    expect(line).toContain("sess-001,cfg-001,2026-05-09T01:00:00Z,,");
  });

  it("user_id にカンマや改行が混入しても escape される", () => {
    const line = buildConversationCsvLine({
      ...baseRow,
      user_id: 'usr,"with\nbreak',
    });
    expect(line).toContain('"usr,""with\nbreak"');
  });
});

describe("buildConversationsCsv", () => {
  it("BOM＋ヘッダー＋データ行を CRLF で結合", () => {
    const csv = buildConversationsCsv([
      {
        session_id: "s1",
        interview_config_id: "c1",
        started_at: "2026-05-09T00:00:00Z",
        completed_at: null,
        user_id: "u1",
        rating: null,
        messages: [{ role: "user", content: "hi" }],
      },
    ]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    const withoutBom = csv.slice(1);
    const [header, row1] = withoutBom.split("\r\n");
    expect(header).toBe(
      "session_id,interview_config_id,started_at,completed_at,user_id,message_count,user_message_count,assistant_message_count,first_user_message,all_user_messages,all_messages_text,rating"
    );
    expect(row1.startsWith("s1,c1,2026-05-09T00:00:00Z,,u1,1,1,0,hi,hi,")).toBe(
      true
    );
  });

  it("空配列でもヘッダー1行は出る", () => {
    const csv = buildConversationsCsv([]);
    expect(csv).toBe(
      "\uFEFFsession_id,interview_config_id,started_at,completed_at,user_id,message_count,user_message_count,assistant_message_count,first_user_message,all_user_messages,all_messages_text,rating"
    );
  });
});
