import "server-only";

import { createAdminClient } from "@mirai-gikai/supabase";
import type { TopicInterviewConfigRow } from "../../shared/types";

/**
 * 公開・非公開問わず全てのトピック型インタビュー設定を取得する。
 * scope_type='topic' でフィルタ。作成日降順。
 */
export async function getAllTopicInterviewConfigs(): Promise<
  TopicInterviewConfigRow[]
> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("interview_configs")
    .select("*")
    .eq("scope_type", "topic")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      `Failed to fetch topic interview configs: ${error.message}`
    );
  }

  return data;
}

/**
 * 指定 ID のトピック型インタビュー設定を取得する。
 * topic 以外の scope の場合は null を返す。
 */
export async function getTopicInterviewConfigById(
  configId: string
): Promise<TopicInterviewConfigRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("interview_configs")
    .select("*")
    .eq("id", configId)
    .eq("scope_type", "topic")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch topic interview config: ${error.message}`);
  }

  return data;
}
