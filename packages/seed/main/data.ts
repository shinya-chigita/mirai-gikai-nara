import type { Database } from "@mirai-gikai/supabase";

type BillInsert = Database["public"]["Tables"]["bills"]["Insert"];
type FactionStanceInsert =
  Database["public"]["Tables"]["faction_stances"]["Insert"];
type TagInsert = Database["public"]["Tables"]["tags"]["Insert"];
type BillsTagsInsert = Database["public"]["Tables"]["bills_tags"]["Insert"];
type CouncilSessionInsert =
  Database["public"]["Tables"]["council_sessions"]["Insert"];
type FactionInsert = Database["public"]["Tables"]["factions"]["Insert"];
type CommitteeInsert = Database["public"]["Tables"]["committees"]["Insert"];
type InterviewConfigInsert =
  Database["public"]["Tables"]["interview_configs"]["Insert"];
type InterviewQuestionInsert =
  Database["public"]["Tables"]["interview_questions"]["Insert"];
type InterviewSessionInsert =
  Database["public"]["Tables"]["interview_sessions"]["Insert"];
type InterviewMessageInsert =
  Database["public"]["Tables"]["interview_messages"]["Insert"];
type InterviewReportInsert =
  Database["public"]["Tables"]["interview_report"]["Insert"];

// 定例会データ
export const councilSessions: CouncilSessionInsert[] = [
  {
    name: "令和8年 2月定例会",
    slug: "r8-2",
    council_url:
      "https://www.pref.nara.lg.jp/n161/p114001.html",
    start_date: "2026-02-20",
    end_date: "2026-03-25",
    is_active: true,
  },
  {
    name: "令和7年 12月定例会",
    slug: "r7-12",
    council_url:
      "https://www.pref.nara.lg.jp/n161/70511.html",
    start_date: "2025-12-01",
    end_date: "2025-12-15",
    is_active: false,
  },
];

// 会派データ
export const factions: FactionInsert[] = [
  {
    name: "jimin",
    display_name: "自由民主党",
    sort_order: 1,
    is_active: true,
  },
  {
    name: "ishin",
    display_name: "日本維新の会",
    sort_order: 2,
    is_active: true,
  },
  {
    name: "komei",
    display_name: "公明党",
    sort_order: 3,
    is_active: true,
  },
  {
    name: "kenmin",
    display_name: "奈良県民の声",
    sort_order: 4,
    is_active: true,
  },
];

// 委員会データ
export const committees: CommitteeInsert[] = [
  {
    name: "総務警察委員会",
    description: "県の総務、企画、財政、警察に関する事項の審査",
    sort_order: 1,
    is_active: true,
  },
  {
    name: "文教くらし委員会",
    description:
      "教育、文化、スポーツ、くらし創造に関する事項の審査",
    sort_order: 2,
    is_active: true,
  },
  {
    name: "福祉医療委員会",
    description: "福祉、医療、健康、子育て支援に関する事項の審査",
    sort_order: 3,
    is_active: true,
  },
  {
    name: "経済労働委員会",
    description: "産業振興、農林業、観光、雇用・労働に関する事項の審査",
    sort_order: 4,
    is_active: true,
  },
  {
    name: "建設委員会",
    description: "県土整備、道路、河川、都市計画、住宅に関する事項の審査",
    sort_order: 5,
    is_active: true,
  },
];

// タグデータ
export const tags: TagInsert[] = [
  {
    label: "予算・財政",
    description: "一般会計予算、特別会計予算、補正予算に関する議案",
    featured_priority: 1,
  },
  {
    label: "子育て・教育",
    description: "子育て支援、教育政策、学校に関する議案",
    featured_priority: 2,
  },
  {
    label: "福祉・医療",
    description: "福祉、医療、高齢者支援、児童福祉に関する議案",
    featured_priority: 3,
  },
  {
    label: "観光・文化",
    description: "観光振興、文化財保護、世界遺産に関する議案",
    featured_priority: 4,
  },
  {
    label: "県土整備・防災",
    description: "道路整備、防災対策、住宅、環境に関する議案",
    featured_priority: 5,
  },
  {
    label: "産業・経済",
    description: "企業誘致、農林業、中小企業支援に関する議案",
    featured_priority: 6,
  },
];

export const bills: BillInsert[] = [
  // ===== 令和8年2月定例会（議決日: 3月25日）=====
  {
    name: "令和8年度奈良県一般会計予算",
    status: "approved",
    status_note: "3月25日 原案可決",
    published_at: "2026-03-25T09:00:00+09:00",
    publish_status: "published",
    is_featured: true,
    thumbnail_url: "https://placehold.co/600x400",
  },
  {
    name: "奈良県認定こども園の認定の要件に関する条例等の一部を改正する条例",
    status: "approved",
    status_note: "3月25日 原案可決",
    published_at: "2026-03-25T09:00:00+09:00",
    publish_status: "published",
    is_featured: true,
    thumbnail_url: "https://placehold.co/600x400",
  },
  {
    name: "奈良県文化財保存活用基金条例",
    status: "approved",
    status_note: "3月25日 原案可決",
    published_at: "2026-03-25T09:00:00+09:00",
    publish_status: "published",
    is_featured: true,
    thumbnail_url: "https://placehold.co/600x400",
  },
  {
    name: "奈良県防災会議等の組織及び運営に関する条例の一部を改正する条例",
    status: "approved",
    status_note: "3月25日 原案可決",
    published_at: "2026-03-25T09:00:00+09:00",
    publish_status: "published",
    is_featured: false,
    thumbnail_url: "https://placehold.co/600x400",
  },
  {
    name: "奈良県男女共同参画推進条例の一部を改正する条例",
    status: "approved",
    status_note: "3月25日 原案可決",
    published_at: "2026-03-25T09:00:00+09:00",
    publish_status: "published",
    is_featured: false,
    thumbnail_url: "https://placehold.co/600x400",
  },
  {
    name: "奈良県企業立地及び宿泊施設誘致を促進するための県税の特例に関する条例の一部を改正する条例",
    status: "approved",
    status_note: "3月25日 原案可決",
    published_at: "2026-03-25T09:00:00+09:00",
    publish_status: "published",
    is_featured: false,
    thumbnail_url: "https://placehold.co/600x400",
  },
  {
    name: "奈良県森林環境税条例の一部を改正する条例",
    status: "approved",
    status_note: "3月25日 原案可決",
    published_at: "2026-03-25T09:00:00+09:00",
    publish_status: "published",
    is_featured: false,
    thumbnail_url: "https://placehold.co/600x400",
  },
  // ===== 令和7年12月定例会（議決日: 12月15日）=====
  {
    name: "奈良県県民くらし相談センター条例",
    status: "approved",
    status_note: "12月15日 原案可決",
    published_at: "2025-12-15T09:00:00+09:00",
    publish_status: "published",
    is_featured: true,
    thumbnail_url: "https://placehold.co/600x400",
  },
  {
    name: "奈良県児童福祉施設の設備及び運営の基準に関する条例の一部を改正する条例",
    status: "approved",
    status_note: "12月15日 原案可決",
    published_at: "2025-12-15T09:00:00+09:00",
    publish_status: "published",
    is_featured: false,
    thumbnail_url: "https://placehold.co/600x400",
  },
  {
    name: "奈良県外国人観光客交流館条例を廃止する条例",
    status: "approved",
    status_note: "12月15日 原案可決",
    published_at: "2025-12-15T09:00:00+09:00",
    publish_status: "published",
    is_featured: false,
    thumbnail_url: "https://placehold.co/600x400",
  },
];

// 議案とタグの関連付け
export function createBillsTags(
  insertedBills: { id: string; name: string }[],
  insertedTags: { id: string; label: string }[]
): Omit<BillsTagsInsert, "id" | "created_at">[] {
  const billTagMap: { [billName: string]: string[] } = {
    "令和8年度奈良県一般会計予算": ["予算・財政"],
    "奈良県認定こども園の認定の要件に関する条例等の一部を改正する条例": ["子育て・教育"],
    "奈良県文化財保存活用基金条例": ["観光・文化"],
    "奈良県防災会議等の組織及び運営に関する条例の一部を改正する条例": ["県土整備・防災"],
    "奈良県男女共同参画推進条例の一部を改正する条例": ["福祉・医療"],
    "奈良県企業立地及び宿泊施設誘致を促進するための県税の特例に関する条例の一部を改正する条例": ["産業・経済", "観光・文化"],
    "奈良県森林環境税条例の一部を改正する条例": ["県土整備・防災"],
    "奈良県県民くらし相談センター条例": ["福祉・医療"],
    "奈良県児童福祉施設の設備及び運営の基準に関する条例の一部を改正する条例": ["子育て・教育", "福祉・医療"],
    "奈良県外国人観光客交流館条例を廃止する条例": ["観光・文化"],
  };

  const billsTags: Omit<BillsTagsInsert, "id" | "created_at">[] = [];

  for (const bill of insertedBills) {
    const tagLabels = billTagMap[bill.name] || [];
    for (const tagLabel of tagLabels) {
      const tag = insertedTags.find((t) => t.label === tagLabel);
      if (tag) {
        billsTags.push({
          bill_id: bill.id,
          tag_id: tag.id,
        });
      }
    }
  }

  return billsTags;
}

// 会派見解データ
const factionStancesData: Omit<
  FactionStanceInsert,
  "bill_id" | "faction_id"
>[] = [
  {
    type: "for",
    comment: `令和8年度の一般会計予算は、奈良県の将来を見据えた重要な予算編成です。

子育て支援、観光振興、防災対策など県民生活に直結する施策に重点配分されており、着実な県政運営が期待できます。`,
  },
  {
    type: "for",
    comment: `認定こども園の基準見直しは、子育て環境の質の向上に直結する重要な改正です。

保育の質を確保しながら、待機児童の解消と多様な保育ニーズへの対応が進むことを期待します。`,
  },
  {
    type: "for",
    comment: `奈良県は世界遺産をはじめ貴重な文化財の宝庫です。

文化財保存活用基金の創設により、安定的な財源を確保し、次世代への継承と観光資源としての活用の両立が期待できます。`,
  },
  {
    type: "for",
    comment: `近年の自然災害の激甚化を踏まえ、防災会議の組織体制強化は喫緊の課題です。

多様な視点を取り入れた防災体制の構築は、県民の安全・安心に直結します。`,
  },
  {
    type: "for",
    comment: `男女共同参画の推進は、多様な人材が活躍できる社会の実現に不可欠です。

時代の変化に対応した条例改正により、奈良県の活力向上につながると考えます。`,
  },
  {
    type: "for",
    comment: `企業誘致と宿泊施設の整備は、奈良県の経済活性化に欠かせない施策です。

県税の特例措置の見直しにより、より効果的な投資誘引が期待できます。`,
  },
  {
    type: "for",
    comment: `森林環境の保全は、奈良県の豊かな自然を守るために重要です。

森林環境税の適切な運用により、県土保全と林業振興の両面で効果が期待できます。`,
  },
  {
    type: "for",
    comment: `県民くらし相談センターの設置は、県民の困りごとにワンストップで対応する重要な施策です。

消費者被害の防止や生活相談の充実により、県民の安心につながります。`,
  },
  {
    type: "for",
    comment: `児童福祉施設の設備・運営基準の見直しは、子どもたちの安全と健やかな成長を守るための重要な改正です。

国の基準改正に合わせた適切な対応と考えます。`,
  },
  {
    type: "for",
    comment: `外国人観光客交流館の廃止は、観光施策の見直しの一環として理解できます。

施設の役割を他の観光拠点に集約し、より効率的な観光振興を進めることが重要です。`,
  },
];

export function createFactionStances(
  insertedBills: { id: string; name: string }[],
  miraiFactionId: string
): FactionStanceInsert[] {
  return factionStancesData.map((stance, index) => ({
    ...stance,
    bill_id: insertedBills[index]?.id || "",
    faction_id: miraiFactionId,
  }));
}

// インタビュー設定を作成（最初の議案用）
export function createInterviewConfig(
  insertedBills: { id: string; name: string }[]
): Omit<InterviewConfigInsert, "id" | "created_at" | "updated_at"> | null {
  const targetBill = insertedBills[0];
  if (!targetBill) return null;

  return {
    bill_id: targetBill.id,
    name: "デフォルト設定",
    status: "public",
    themes: ["賛否", "理由"],
    knowledge_source: `この議案についてあなたの意見を聞かせてください。`,
  };
}

// インタビュー質問を作成
export function createInterviewQuestions(
  interviewConfigId: string
): Omit<InterviewQuestionInsert, "id" | "created_at" | "updated_at">[] {
  return [
    {
      interview_config_id: interviewConfigId,
      question: "この議案に賛成ですか？反対ですか？",
      follow_up_guide: "ユーザーの立場を明確にしてください。",
      quick_replies: ["賛成", "反対", "どちらでもない"],
      question_order: 1,
    },
    {
      interview_config_id: interviewConfigId,
      question: "その理由を教えてください。",
      follow_up_guide: "具体的な理由を引き出してください。",
      quick_replies: null,
      question_order: 2,
    },
  ];
}

// インタビューセッションを作成（5パターン × 20回 = 100件）
export function createInterviewSessions(
  interviewConfigId: string
): Omit<InterviewSessionInsert, "id" | "created_at" | "updated_at">[] {
  const now = new Date();
  const sessions: Omit<
    InterviewSessionInsert,
    "id" | "created_at" | "updated_at"
  >[] = [];

  // 20回ループして100件作成
  for (let i = 0; i < 20; i++) {
    const baseOffset = i * 86400000 * 3; // 3日ずつずらす

    // パターン1: 完了 + レポートあり（賛成）
    sessions.push({
      interview_config_id: interviewConfigId,
      user_id: `00000000-0000-0000-0000-${String(i * 5 + 1).padStart(12, "0")}`,
      started_at: new Date(
        now.getTime() - baseOffset - 3600000
      ).toISOString(),
      completed_at: new Date(
        now.getTime() - baseOffset - 3000000
      ).toISOString(),
    });

    // パターン2: 完了 + レポートあり（反対）
    sessions.push({
      interview_config_id: interviewConfigId,
      user_id: `00000000-0000-0000-0000-${String(i * 5 + 2).padStart(12, "0")}`,
      started_at: new Date(
        now.getTime() - baseOffset - 7200000
      ).toISOString(),
      completed_at: new Date(
        now.getTime() - baseOffset - 6600000
      ).toISOString(),
    });

    // パターン3: 完了 + レポートあり（中立）
    sessions.push({
      interview_config_id: interviewConfigId,
      user_id: `00000000-0000-0000-0000-${String(i * 5 + 3).padStart(12, "0")}`,
      started_at: new Date(
        now.getTime() - baseOffset - 10800000
      ).toISOString(),
      completed_at: new Date(
        now.getTime() - baseOffset - 10200000
      ).toISOString(),
    });

    // パターン4: 完了したけどレポート未作成
    sessions.push({
      interview_config_id: interviewConfigId,
      user_id: `00000000-0000-0000-0000-${String(i * 5 + 4).padStart(12, "0")}`,
      started_at: new Date(
        now.getTime() - baseOffset - 14400000
      ).toISOString(),
      completed_at: new Date(
        now.getTime() - baseOffset - 13800000
      ).toISOString(),
    });

    // パターン5: 進行中（未完了、レポートなし）
    sessions.push({
      interview_config_id: interviewConfigId,
      user_id: `00000000-0000-0000-0000-${String(i * 5 + 5).padStart(12, "0")}`,
      started_at: new Date(
        now.getTime() - baseOffset - 1800000
      ).toISOString(),
      completed_at: null,
    });
  }

  return sessions;
}

// インタビューメッセージを作成（5パターンをループ）
export function createInterviewMessages(
  sessionIds: string[]
): Omit<InterviewMessageInsert, "id" | "created_at">[] {
  const conversations = [
    // パターン1: 賛成（完了 + レポートあり）
    [
      {
        role: "assistant" as const,
        content: "この議案に賛成ですか？反対ですか？",
      },
      { role: "user" as const, content: "賛成です" },
      {
        role: "assistant" as const,
        content: "その理由を教えてください。",
      },
      {
        role: "user" as const,
        content:
          "なぜなら賛成だからです。県民のためになると思います。",
      },
      {
        role: "assistant" as const,
        content:
          "ありがとうございました。ご意見を承りました。",
      },
    ],
    // パターン2: 反対（完了 + レポートあり）
    [
      {
        role: "assistant" as const,
        content: "この議案に賛成ですか？反対ですか？",
      },
      { role: "user" as const, content: "反対です" },
      {
        role: "assistant" as const,
        content: "その理由を教えてください。",
      },
      {
        role: "user" as const,
        content: "財源が不明確だと思います。",
      },
      {
        role: "assistant" as const,
        content:
          "ありがとうございました。ご意見を承りました。",
      },
    ],
    // パターン3: どちらでもない（完了 + レポートあり）
    [
      {
        role: "assistant" as const,
        content: "この議案に賛成ですか？反対ですか？",
      },
      {
        role: "user" as const,
        content: "どちらでもないです",
      },
      {
        role: "assistant" as const,
        content: "その理由を教えてください。",
      },
      {
        role: "user" as const,
        content: "もっと情報が必要だと思います。",
      },
      {
        role: "assistant" as const,
        content:
          "ありがとうございました。ご意見を承りました。",
      },
    ],
    // パターン4: 完了したけどレポート未作成
    [
      {
        role: "assistant" as const,
        content: "この議案に賛成ですか？反対ですか？",
      },
      { role: "user" as const, content: "賛成です" },
      {
        role: "assistant" as const,
        content: "その理由を教えてください。",
      },
      {
        role: "user" as const,
        content: "良い議案だと思います。",
      },
      {
        role: "assistant" as const,
        content:
          "ありがとうございました。ご意見を承りました。",
      },
    ],
    // パターン5: 進行中（途中で離脱）
    [
      {
        role: "assistant" as const,
        content: "この議案に賛成ですか？反対ですか？",
      },
      {
        role: "user" as const,
        content: "うーん、ちょっと考えさせてください",
      },
    ],
  ];

  const messages: Omit<
    InterviewMessageInsert,
    "id" | "created_at"
  >[] = [];

  sessionIds.forEach((sessionId, sessionIndex) => {
    // 5パターンをループ
    const patternIndex = sessionIndex % 5;
    const conversation = conversations[patternIndex];
    conversation.forEach((msg) => {
      messages.push({
        interview_session_id: sessionId,
        role: msg.role,
        content: msg.content,
      });
    });
  });

  return messages;
}

// インタビューレポートを作成（パターン1,2,3のみ = 5の倍数で0,1,2番目）
export function createInterviewReports(
  sessionIds: string[]
): Omit<
  InterviewReportInsert,
  "id" | "created_at" | "updated_at"
>[] {
  const reportTemplates = [
    {
      stance: "for" as const,
      summary:
        "この議案に賛成。県民のためになると考えている。",
      role: "general_citizen" as const,
      role_title: "一般市民",
      role_description: "議案の内容に賛同する市民",
      opinions: [
        { title: "賛成理由", content: "県民のためになる" },
      ],
    },
    {
      stance: "against" as const,
      summary:
        "財源の確保が不透明であり、将来世代への負担増大が懸念されるため反対の立場をとる。歳出削減や他の財源確保策を十分に検討した上で、持続可能な制度設計を行うべきだと考える。",
      role: "work_related" as const,
      role_title: "会社員",
      role_description: "財政面を懸念する市民",
      opinions: [
        { title: "反対理由", content: "財源が不明確" },
      ],
    },
    {
      stance: "neutral" as const,
      summary:
        "判断するにはより多くの情報が必要と考えている。",
      role: "subject_expert" as const,
      role_title: "専門家",
      role_description: "慎重な判断を求める市民",
      opinions: [
        { title: "態度保留理由", content: "情報不足" },
      ],
    },
  ];

  const reports: Omit<
    InterviewReportInsert,
    "id" | "created_at" | "updated_at"
  >[] = [];

  // パターン1,2,3（5の倍数で0,1,2番目）のみレポートを作成
  sessionIds.forEach((sessionId, index) => {
    const patternIndex = index % 5;
    if (patternIndex < 3) {
      const loopIndex = Math.floor(index / 5);
      reports.push({
        interview_session_id: sessionId,
        ...reportTemplates[patternIndex],
        is_public_by_user: loopIndex < 5, // 最初の5件は公開
        is_public_by_admin: loopIndex < 3, // 最初の3ループ分は管理者承認済み
      });
    }
  });

  return reports;
}

// デモ用の固定ID
export const DEMO_SESSION_ID =
  "00000000-0000-0000-0000-000000000001";
export const DEMO_REPORT_ID =
  "00000000-0000-0000-0000-000000000001";

// 4種類のロールを確認するためのデモ用ID
export const DEMO_SESSION_ID_WORK =
  "00000000-0000-0000-0000-000000000002";
export const DEMO_SESSION_ID_DAILY =
  "00000000-0000-0000-0000-000000000003";
export const DEMO_SESSION_ID_CITIZEN =
  "00000000-0000-0000-0000-000000000004";
export const DEMO_REPORT_ID_WORK =
  "00000000-0000-0000-0000-000000000002";
export const DEMO_REPORT_ID_DAILY =
  "00000000-0000-0000-0000-000000000003";
export const DEMO_REPORT_ID_CITIZEN =
  "00000000-0000-0000-0000-000000000004";

// デモ用のインタビューセッション（公開、固定ID）
export function createDemoSession(
  interviewConfigId: string
): InterviewSessionInsert {
  const now = new Date();
  return {
    id: DEMO_SESSION_ID,
    interview_config_id: interviewConfigId,
    user_id: "00000000-0000-0000-0000-000000000000",
    started_at: new Date(now.getTime() - 3600000).toISOString(),
    completed_at: new Date(now.getTime() - 3000000).toISOString(),
  };
}

// デモ用のインタビューメッセージ
export function createDemoMessages(): Omit<
  InterviewMessageInsert,
  "id" | "created_at"
>[] {
  return [
    {
      interview_session_id: DEMO_SESSION_ID,
      role: "assistant",
      content:
        "こんにちは！本日はインタビューにご協力いただきありがとうございます。\n\n奈良県議会で審議されている議案について、県民の皆さまのご意見をお聞かせください。この議案について、どのようにお考えですか？",
    },
    {
      interview_session_id: DEMO_SESSION_ID,
      role: "user",
      content:
        "県政のデジタル化や、ムダの削減を達成して欲しい",
    },
    {
      interview_session_id: DEMO_SESSION_ID,
      role: "assistant",
      content:
        "なるほど。県政のデジタル化を通じて、行政サービスの効率化と県民の利便性向上を期待されているということですね。とても重要な指摘だと思います。\n\n具体的に、奈良県のどのような行政手続きや窓口サービスがデジタル化されると良いとお考えですか？",
    },
    {
      interview_session_id: DEMO_SESSION_ID,
      role: "user",
      content:
        "県庁の窓口手続きのオンライン化や、行政文書のデジタル化が進むと県民にとって便利になると期待しています。",
    },
    {
      interview_session_id: DEMO_SESSION_ID,
      role: "assistant",
      content:
        "ありがとうございました。ご意見を承りました。",
    },
  ];
}

// デモ用のインタビューレポート（固定ID）
export function createDemoReport(): InterviewReportInsert {
  return {
    id: DEMO_REPORT_ID,
    interview_session_id: DEMO_SESSION_ID,
    stance: "neutral",
    summary:
      "デジタル化推進による省庁の業務効率化や官僚の働き方改革には期待するが、システム移行時の混乱や中小フォワーダーへの対応コスト増大について懸念も大きい。慎重な段階的導入を求める。",
    role: "subject_expert",
    role_title: "フォワーダー",
    role_description:
      "奈良県在住の会社員\n行政手続きの煩雑さを日常的に感じている",
    opinions: [
      {
        title:
          "県政のデジタル化や、ムダの削減を達成して欲しい",
        content:
          "県庁の窓口手続きのオンライン化や、行政文書のデジタル化が進むと県民にとって便利になると期待している。",
      },
    ],
    is_public_by_user: true,
    is_public_by_admin: true,
  };
}

// 追加のデモ用セッション（3種類のロール確認用）
export function createAdditionalDemoSessions(
  interviewConfigId: string
): InterviewSessionInsert[] {
  const now = new Date();
  return [
    {
      id: DEMO_SESSION_ID_WORK,
      interview_config_id: interviewConfigId,
      user_id: "00000000-0000-0000-0000-000000000010",
      started_at: new Date(now.getTime() - 7200000).toISOString(),
      completed_at: new Date(now.getTime() - 6600000).toISOString(),
    },
    {
      id: DEMO_SESSION_ID_DAILY,
      interview_config_id: interviewConfigId,
      user_id: "00000000-0000-0000-0000-000000000011",
      started_at: new Date(now.getTime() - 10800000).toISOString(),
      completed_at: new Date(now.getTime() - 10200000).toISOString(),
    },
    {
      id: DEMO_SESSION_ID_CITIZEN,
      interview_config_id: interviewConfigId,
      user_id: "00000000-0000-0000-0000-000000000012",
      started_at: new Date(now.getTime() - 14400000).toISOString(),
      completed_at: new Date(now.getTime() - 10200000).toISOString(),
    },
  ];
}

// 追加のデモ用メッセージ（3種類のロール確認用）
export function createAdditionalDemoMessages(): Omit<
  InterviewMessageInsert,
  "id" | "created_at"
>[] {
  return [
    // work_related セッション用
    {
      interview_session_id: DEMO_SESSION_ID_WORK,
      role: "assistant",
      content:
        "こんにちは！本日はインタビューにご協力いただきありがとうございます。",
    },
    {
      interview_session_id: DEMO_SESSION_ID_WORK,
      role: "user",
      content:
        "子どもの医療費負担が大きいので、この議案には賛成です。",
    },
    {
      interview_session_id: DEMO_SESSION_ID_WORK,
      role: "assistant",
      content:
        "子育て世帯としてのお立場からのご意見ですね。具体的にどのような影響がありますか？",
    },
    {
      interview_session_id: DEMO_SESSION_ID_WORK,
      role: "user",
      content:
        "共働きで子ども2人を育てていますが、医療費の自己負担が家計を圧迫しています。助成拡充で少しでも負担が減れば助かります。",
    },
    {
      interview_session_id: DEMO_SESSION_ID_WORK,
      role: "assistant",
      content:
        "ありがとうございました。ご意見を承りました。",
    },
    // daily_life_affected セッション用
    {
      interview_session_id: DEMO_SESSION_ID_DAILY,
      role: "assistant",
      content:
        "こんにちは！本日はインタビューにご協力いただきありがとうございます。",
    },
    {
      interview_session_id: DEMO_SESSION_ID_DAILY,
      role: "user",
      content:
        "子どもが小さいので、医療費の負担が軽くなるのは嬉しいです。",
    },
    {
      interview_session_id: DEMO_SESSION_ID_DAILY,
      role: "assistant",
      content:
        "生活への影響が大きいとのことですね。どのような場面で医療費の負担を感じますか？",
    },
    {
      interview_session_id: DEMO_SESSION_ID_DAILY,
      role: "user",
      content:
        "風邪や怪我で小児科にかかることが多く、月に何回も通院することがあります。自己負担が積み重なると大変です。",
    },
    {
      interview_session_id: DEMO_SESSION_ID_DAILY,
      role: "assistant",
      content:
        "ありがとうございました。ご意見を承りました。",
    },
    // general_citizen セッション用
    {
      interview_session_id: DEMO_SESSION_ID_CITIZEN,
      role: "assistant",
      content:
        "こんにちは！本日はインタビューにご協力いただきありがとうございます。",
    },
    {
      interview_session_id: DEMO_SESSION_ID_CITIZEN,
      role: "user",
      content:
        "財源が気になりますが、子育て支援として医療費助成は必要だと思います。",
    },
    {
      interview_session_id: DEMO_SESSION_ID_CITIZEN,
      role: "assistant",
      content:
        "財源と子育て支援のバランスを考えていらっしゃるのですね。どのような点が気になりますか？",
    },
    {
      interview_session_id: DEMO_SESSION_ID_CITIZEN,
      role: "user",
      content:
        "他の行政サービスとのバランスも考えつつ、子育て世帯への支援として医療費助成は拡充すべきだと思います。",
    },
    {
      interview_session_id: DEMO_SESSION_ID_CITIZEN,
      role: "assistant",
      content:
        "ありがとうございました。ご意見を承りました。",
    },
  ];
}

// 追加のデモ用レポート（3種類のロール確認用）
export function createAdditionalDemoReports(): InterviewReportInsert[] {
  return [
    {
      id: DEMO_REPORT_ID_WORK,
      interview_session_id: DEMO_SESSION_ID_WORK,
      stance: "for",
      summary:
        "子育て世帯として医療費負担軽減のため賛成",
      role: "work_related",
      role_title: "運送会社経営者",
      role_description:
        "奈良県在住の共働き世帯\n子ども2人\n医療費の負担を日常的に感じている",
      opinions: [
        {
          title: "子どもの医療費負担が大きい",
          content:
            "共働きで子ども2人を育てているが、医療費の自己負担が家計を圧迫している。助成拡充で負担が減れば助かる。",
        },
      ],
      is_public_by_user: true,
      is_public_by_admin: true,
    },
    {
      id: DEMO_REPORT_ID_DAILY,
      interview_session_id: DEMO_SESSION_ID_DAILY,
      stance: "for",
      summary:
        "子育て中の保護者として医療費負担軽減を期待",
      role: "daily_life_affected",
      role_title: "主婦",
      role_description:
        "奈良県在住の主婦\n小さい子ども2人の子育て中\n医療費の自己負担を日常的に感じている",
      opinions: [
        {
          title: "子どもの医療費負担が大きい",
          content:
            "風邪や怪我で小児科にかかることが多く、月に何回も通院する。自己負担が積み重なると家計に影響が大きい。",
        },
      ],
      is_public_by_user: true,
      is_public_by_admin: true,
    },
    {
      id: DEMO_REPORT_ID_CITIZEN,
      interview_session_id: DEMO_SESSION_ID_CITIZEN,
      stance: "neutral",
      summary:
        "財源と子育て支援のバランスを考慮して判断",
      role: "general_citizen",
      role_title: "会社員",
      role_description:
        "奈良県在住の会社員\n子育て支援に関心あり\n県の財政にも関心がある",
      opinions: [
        {
          title: "財源と子育て支援のバランス",
          content:
            "他の行政サービスとのバランスも考えつつ、子育て世帯への支援として医療費助成は拡充すべきと考える。",
        },
      ],
      is_public_by_user: true,
      is_public_by_admin: true,
    },
  ];
}
