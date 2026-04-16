import "server-only";

import { createAdminClient, type Database } from "@mirai-gikai/supabase";

export type PublicTopicInterviewConfig =
  Database["public"]["Tables"]["interview_configs"]["Row"];

/**
 * 公開状態のトピック型インタビュー設定を取得する。
 * scope_type='topic' かつ status='public' のレコードのみが対象。
 * 該当しなければ null（公開されていない、または bill scope の設定IDが渡された）。
 */
export async function getPublicTopicConfigById(
  configId: string
): Promise<PublicTopicInterviewConfig | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("interview_configs")
    .select("*")
    .eq("id", configId)
    .eq("scope_type", "topic")
    .eq("status", "public")
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch public topic config:", error);
    return null;
  }
  return data;
}
