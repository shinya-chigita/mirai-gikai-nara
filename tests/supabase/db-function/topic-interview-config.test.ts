import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "../../../packages/supabase/types/supabase.types";
import {
  adminClient,
  cleanupTestInterviewConfig,
  cleanupTestUser,
  createTestTopicInterviewConfig,
  createTestUser,
  getAuthenticatedClient,
  type TestUser,
} from "../utils";

type InterviewConfigRow =
  Database["public"]["Tables"]["interview_configs"]["Row"];

describe("topic interview config の公開フィルタリング", () => {
  let publicConfig: InterviewConfigRow;
  let closedConfig: InterviewConfigRow;

  beforeAll(async () => {
    publicConfig = await createTestTopicInterviewConfig({
      status: "public",
      topic_title: "公開トピック",
      topic_description: "テスト説明",
      themes: ["教育", "子育て"],
      estimated_duration: 10,
    });
    closedConfig = await createTestTopicInterviewConfig({
      status: "closed",
      topic_title: "クローズドトピック",
    });
  });

  afterAll(async () => {
    await cleanupTestInterviewConfig(publicConfig.id);
    await cleanupTestInterviewConfig(closedConfig.id);
  });

  it("scope_type='topic' AND status='public' のみが一覧取得される", async () => {
    const { data, error } = await adminClient
      .from("interview_configs")
      .select("*")
      .eq("scope_type", "topic")
      .eq("status", "public")
      .order("created_at", { ascending: false });

    expect(error).toBeNull();
    const ids = data!.map((c) => c.id);
    expect(ids).toContain(publicConfig.id);
    expect(ids).not.toContain(closedConfig.id);
  });

  it("ID指定で public config が取得できる", async () => {
    const { data, error } = await adminClient
      .from("interview_configs")
      .select("*")
      .eq("id", publicConfig.id)
      .eq("scope_type", "topic")
      .eq("status", "public")
      .maybeSingle();

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.topic_title).toBe("公開トピック");
    expect(data!.topic_description).toBe("テスト説明");
    expect(data!.themes).toEqual(["教育", "子育て"]);
    expect(data!.estimated_duration).toBe(10);
    expect(data!.scope_type).toBe("topic");
    expect(data!.mode).toBe("discover");
    expect(data!.bill_id).toBeNull();
  });

  it("closed の configId を public フィルタで取得すると null", async () => {
    const { data, error } = await adminClient
      .from("interview_configs")
      .select("*")
      .eq("id", closedConfig.id)
      .eq("scope_type", "topic")
      .eq("status", "public")
      .maybeSingle();

    expect(error).toBeNull();
    expect(data).toBeNull();
  });

  it("bill scope の config は scope_type='topic' フィルタに含まれない", async () => {
    const { data: billConfig } = await adminClient
      .from("interview_configs")
      .select("*")
      .eq("scope_type", "bill")
      .limit(1)
      .maybeSingle();

    if (!billConfig) return;

    const { data } = await adminClient
      .from("interview_configs")
      .select("*")
      .eq("id", billConfig.id)
      .eq("scope_type", "topic")
      .maybeSingle();

    expect(data).toBeNull();
  });
});

describe("topic interview session の作成", () => {
  let testUser: TestUser;
  let topicConfig: InterviewConfigRow;
  let sessionId: string | null = null;

  beforeAll(async () => {
    testUser = await createTestUser();
    topicConfig = await createTestTopicInterviewConfig({
      status: "public",
      topic_title: "セッションテスト用トピック",
    });
  });

  afterAll(async () => {
    if (sessionId) {
      await adminClient.from("interview_sessions").delete().eq("id", sessionId);
    }
    await cleanupTestInterviewConfig(topicConfig.id);
    await cleanupTestUser(testUser.id);
  });

  it("topic config に紐づくセッションを作成できる", async () => {
    const { data, error } = await adminClient
      .from("interview_sessions")
      .insert({
        interview_config_id: topicConfig.id,
        user_id: testUser.id,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.interview_config_id).toBe(topicConfig.id);
    expect(data!.user_id).toBe(testUser.id);
    sessionId = data!.id;
  });

  it("セッションにメッセージを保存・取得できる", async () => {
    expect(sessionId).not.toBeNull();

    const { error: insertError } = await adminClient
      .from("interview_messages")
      .insert([
        {
          interview_session_id: sessionId!,
          role: "user" as const,
          content: "奈良の教育政策について知りたい",
        },
        {
          interview_session_id: sessionId!,
          role: "assistant" as const,
          content: "奈良県議会では教育に関する議案がいくつかあります。",
        },
      ]);

    expect(insertError).toBeNull();

    const { data: messages, error: fetchError } = await adminClient
      .from("interview_messages")
      .select("*")
      .eq("interview_session_id", sessionId!)
      .order("created_at", { ascending: true });

    expect(fetchError).toBeNull();
    expect(messages).toHaveLength(2);
    expect(messages![0].role).toBe("user");
    expect(messages![1].role).toBe("assistant");
  });

  it("RLS が有効でも service_role でアクセスできる", async () => {
    const { data, error } = await adminClient
      .from("interview_configs")
      .select("id")
      .eq("id", topicConfig.id)
      .single();

    expect(error).toBeNull();
    expect(data).not.toBeNull();
  });

  it("anon クライアントでは RLS により interview_configs にアクセスできない", async () => {
    const anonClient = await getAuthenticatedClient(
      testUser.email,
      testUser.password
    );
    const { data } = await anonClient
      .from("interview_configs")
      .select("id")
      .eq("id", topicConfig.id)
      .maybeSingle();

    expect(data).toBeNull();
  });
});
