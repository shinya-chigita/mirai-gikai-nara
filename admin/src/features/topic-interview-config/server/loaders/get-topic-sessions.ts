import "server-only";

import { createAdminClient } from "@mirai-gikai/supabase";

const PAGE_SIZE = 20;

export async function getTopicSessions(configId: string, page: number) {
  const supabase = createAdminClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from("interview_sessions")
    .select(
      "id, user_id, started_at, completed_at, rating, interview_messages(count)"
    )
    .eq("interview_config_id", configId)
    .order("started_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Failed to fetch topic sessions:", error);
    return [];
  }

  return data.map((s) => ({
    ...s,
    message_count: Array.isArray(s.interview_messages)
      ? (s.interview_messages[0]?.count ?? 0)
      : 0,
  }));
}

export async function getTopicSessionsCount(configId: string) {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("interview_sessions")
    .select("id", { count: "exact", head: true })
    .eq("interview_config_id", configId);

  if (error) {
    console.error("Failed to count topic sessions:", error);
    return 0;
  }
  return count ?? 0;
}
