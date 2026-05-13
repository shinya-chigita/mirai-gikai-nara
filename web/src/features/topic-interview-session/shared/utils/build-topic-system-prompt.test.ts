import { describe, expect, it } from "vitest";
import {
  buildTopicBroadListeningSystemPrompt,
  buildTopicDiscoverSystemPrompt,
} from "./build-topic-system-prompt";

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

describe("buildTopicBroadListeningSystemPrompt", () => {
  // broad_listening は議案カタログを持たないので billIndexSection を取らない
  const broadBase = {
    topicTitle: "奈良県政で気になること",
    topicDescription: null as string | null,
    knowledgeSource: null as string | null,
    themes: null as string[] | null,
    referenceInfo: null as string | null,
  };

  it("topic_title が見出し直後に含まれる", () => {
    const result = buildTopicBroadListeningSystemPrompt(broadBase);
    expect(result).toContain("## トピック\n奈良県政で気になること");
  });

  it("topic_description が指定されると本文に出る", () => {
    const result = buildTopicBroadListeningSystemPrompt({
      ...broadBase,
      topicDescription: "このテーマについて聴かせてください",
    });
    expect(result).toContain("このテーマについて聴かせてください");
  });

  it("themes が指定されると重点テーマセクションが出る", () => {
    const result = buildTopicBroadListeningSystemPrompt({
      ...broadBase,
      themes: ["子どもの居場所", "放課後"],
    });
    expect(result).toContain("## 重点テーマ");
    expect(result).toContain("- 子どもの居場所");
    expect(result).toContain("- 放課後");
  });

  it("knowledgeSource が指定されると補足知識セクションが出る", () => {
    const result = buildTopicBroadListeningSystemPrompt({
      ...broadBase,
      knowledgeSource: "対象は県内在住・在勤・在学者",
    });
    expect(result).toContain("## 補足知識");
    expect(result).toContain("対象は県内在住・在勤・在学者");
  });

  it("最初の発言を設定テーマへの回答として扱う指示が含まれる", () => {
    const result = buildTopicBroadListeningSystemPrompt(broadBase);
    expect(result).toContain(
      "ユーザーの最初の発言は、すでに上記テーマへの回答として扱ってください"
    );
  });

  it("入口に戻る質問をしないよう明示している", () => {
    const result = buildTopicBroadListeningSystemPrompt(broadBase);
    expect(result).toContain("何に興味がありますか");
    expect(result).toContain("入口に戻る質問はしないでください");
  });

  it("具体場面を聞くフローが含まれる", () => {
    const result = buildTopicBroadListeningSystemPrompt(broadBase);
    expect(result).toContain("具体場面");
    expect(result).toContain("どんな場面を見たり聞いたりした時ですか");
  });

  it("個人特定情報の聞き出し禁止が含まれる", () => {
    const result = buildTopicBroadListeningSystemPrompt(broadBase);
    expect(result).toContain("個人が特定される情報");
  });

  it("匿名要約のまとめ返しフォーマットが含まれる", () => {
    const result = buildTopicBroadListeningSystemPrompt(broadBase);
    expect(result).toContain("このまとめ方で大きな違和感はありませんか");
  });

  it("1質問・短文方針が含まれる", () => {
    const result = buildTopicBroadListeningSystemPrompt(broadBase);
    expect(result).toContain("1回の返答に質問は必ず1つだけ");
    expect(result).toContain("200〜250文字");
  });

  it("関連議案紹介が主目的でない旨が示される", () => {
    const result = buildTopicBroadListeningSystemPrompt(broadBase);
    expect(result).toContain("関連議案の紹介は主目的ではありません");
  });

  it("議案カタログセクション自体は含まない", () => {
    const result = buildTopicBroadListeningSystemPrompt(broadBase);
    expect(result).not.toContain("## 議案カタログ");
    expect(result).not.toContain("[議案ID:");
  });

  // テーマ固有語ハードコード混入チェック。
  // 意図: 任意の topic config に対して、無関係な他テーマ固有語が
  // プロンプト本文に混入していないことを保証する。
  it.each([
    ["鹿テーマ", "奈良県の鹿対策についての考えを聞かせてください"],
    ["交通テーマ", "奈良県の交通・移動についての考えを聞かせてください"],
    ["子育てテーマ", "奈良県の子育て・教育についての考えを聞かせてください"],
  ])("%s で生成しても、他テーマ固有語（鹿せんべい/観光客/通院/通勤）が混入しない", (_label, topicTitle) => {
    const result = buildTopicBroadListeningSystemPrompt({
      topicTitle,
      topicDescription: null,
      knowledgeSource: null,
      themes: null,
      referenceInfo: null,
    });

    // topic に含まれない他テーマ固有語が混入していないこと
    const otherTopicSpecificTerms = [
      "鹿せんべい",
      "観光客",
      "通院",
      "通勤",
      "保育",
      "鹿対策",
    ];
    for (const term of otherTopicSpecificTerms) {
      if (topicTitle.includes(term)) continue; // 自分のtopicに含まれる語はスキップ
      expect(
        result.includes(term),
        `"${term}" は ${topicTitle} のプロンプトに含まれてはならない`
      ).toBe(false);
    }
  });

  it("topic config に含まれる語は反映される（themes 経由）", () => {
    const result = buildTopicBroadListeningSystemPrompt({
      topicTitle: "テーマA",
      topicDescription: null,
      knowledgeSource: null,
      themes: ["放課後の居場所"],
      referenceInfo: null,
    });
    expect(result).toContain("放課後の居場所");
  });

  describe("参考情報セクション", () => {
    it("referenceInfo が null のときは参考情報セクションが出ない", () => {
      const result = buildTopicBroadListeningSystemPrompt(broadBase);
      expect(result).not.toContain("## 参考情報");
    });

    it("referenceInfo が空白だけのときも参考情報セクションは出ない", () => {
      const result = buildTopicBroadListeningSystemPrompt({
        ...broadBase,
        referenceInfo: "   \n  ",
      });
      expect(result).not.toContain("## 参考情報");
    });

    it("referenceInfo が指定されると参考情報セクションが出る", () => {
      const result = buildTopicBroadListeningSystemPrompt({
        ...broadBase,
        referenceInfo:
          "山下知事の任期: 2023-04 から / 主な施策: 教育の無償化 (2023-09 開始)",
      });
      expect(result).toContain(
        "## 参考情報（ユーザーから明示的に事実を尋ねられたときだけ短く引用してよい）"
      );
      expect(result).toContain("山下知事の任期: 2023-04 から");
      expect(result).toContain("教育の無償化 (2023-09 開始)");
    });

    it("referenceInfo は前後空白がトリムされる", () => {
      const result = buildTopicBroadListeningSystemPrompt({
        ...broadBase,
        referenceInfo: "\n\n  主な施策: A  \n\n",
      });
      expect(result).toContain("\n主な施策: A\n");
    });

    it("参考情報があっても、記載がない事項は推測しないルールが含まれる", () => {
      const result = buildTopicBroadListeningSystemPrompt({
        ...broadBase,
        referenceInfo: "X 施策の概要のみ",
      });
      expect(result).toContain(
        "両セクションに記載が無いことは「この場ではお答えできません」"
      );
    });
  });

  describe("AI が他ユーザーの声を捏造しないガード", () => {
    it("『他の方の意見』を引用しないことを明示する禁止文がある", () => {
      const result = buildTopicBroadListeningSystemPrompt(broadBase);
      expect(result).toContain("他の方の意見としては");
      expect(result).toContain(
        "実際には集計していない他ユーザーの声を要約・代弁・引用"
      );
    });

    it("『みなさん』『多くの方は』といった集計表現の禁止が含まれる", () => {
      const result = buildTopicBroadListeningSystemPrompt(broadBase);
      expect(result).toContain("みなさん");
      expect(result).toContain("根拠のない集計表現");
    });

    it("『知らないことは知らない』と返すルールが含まれる", () => {
      const result = buildTopicBroadListeningSystemPrompt(broadBase);
      expect(result).toContain("## 知らないことは知らないと言うルール");
      // 「補足知識」または「参考情報」セクションに記載があるものに限定
      expect(result).toContain(
        "「補足知識」または「参考情報」セクションに記載がある事実のみ"
      );
      expect(result).toContain("この場ではお答えできません");
    });
  });

  describe("1ターンあたり1質問の徹底", () => {
    it("『1メッセージで疑問符は最大1個』が明記される", () => {
      const result = buildTopicBroadListeningSystemPrompt(broadBase);
      expect(result).toContain("疑問符（？・?）の数は1メッセージで最大1個");
    });

    it("疑問符2つ以上の禁止が禁止リストに含まれる", () => {
      const result = buildTopicBroadListeningSystemPrompt(broadBase);
      expect(result).toContain("疑問符（？・?）を 2 つ以上使うこと");
    });
  });

  describe("同じ注意文の連続抑制", () => {
    it("『直近3ターン以内に既に伝えていれば繰り返さない』が含まれる", () => {
      const result = buildTopicBroadListeningSystemPrompt(broadBase);
      expect(result).toContain("直近3ターン以内に既に伝えている");
    });
  });
});
