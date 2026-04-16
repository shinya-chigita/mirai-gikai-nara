import "server-only";

import { createAdminClient } from "@mirai-gikai/supabase";
import type { PublicTopicInterviewConfig } from "./get-public-topic-config";

export async function getPublicTopicConfigs(): Promise<
  PublicTopicInterviewConfig[]
> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("interview_configs")
    .select("*")
    .eq("scope_type", "topic")
    .eq("status", "public")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch public topic configs:", error);
    return [];
  }
  return data;
}
