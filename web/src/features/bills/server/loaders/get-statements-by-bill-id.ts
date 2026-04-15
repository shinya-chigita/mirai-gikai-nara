import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";

export type BillStatement = {
  id: string;
  speaker_name: string;
  role: string | null;
  text: string;
  meeting_date: string | null;
  meeting_title: string;
  source_url: string | null;
};

export const getStatementsByBillId = unstable_cache(
  async (billId: string): Promise<BillStatement[]> => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("proceeding_statements")
      .select(
        `
        id,
        speaker_name,
        role,
        text,
        order_num,
        council_proceedings!inner (
          title,
          meeting_date,
          source_url
        )
      `
      )
      .eq("bill_id", billId)
      .order("order_num", { ascending: true });

    if (error || !data) return [];

    return data.map((row) => ({
      id: row.id,
      speaker_name: row.speaker_name,
      role: row.role,
      text: row.text,
      meeting_date: row.council_proceedings?.meeting_date ?? null,
      meeting_title: row.council_proceedings?.title ?? "",
      source_url: row.council_proceedings?.source_url ?? null,
    }));
  },
  ["statements-by-bill-id"],
  { tags: [CACHE_TAGS.BILLS] }
);
