import { NextResponse } from "next/server";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { getTopicConversationsForCsv } from "@/features/topic-conversations/server/loaders/get-topic-conversations";
import {
  buildConversationsCsv,
  type ConversationCsvRow,
} from "@/features/topic-conversations/shared/utils/build-conversations-csv";
import { parseConversationsSearchParams } from "@/features/topic-conversations/shared/utils/parse-conversations-search-params";

/**
 * トピック会話ログを CSV で返す。
 * 認可: 管理者のみ（`requireAdmin`）。
 * 既存のフィルタ・検索条件はクエリ文字列で受け取り、表示と同じ並び順で出力する。
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ configId: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { configId } = await params;
  if (!configId) {
    return NextResponse.json(
      { error: "configId is required" },
      { status: 400 }
    );
  }

  const url = new URL(request.url);
  const rawSearch: Record<string, string> = {};
  for (const [k, v] of url.searchParams.entries()) {
    rawSearch[k] = v;
  }
  const filter = parseConversationsSearchParams(rawSearch);

  const details = await getTopicConversationsForCsv(configId, filter);

  const rows: ConversationCsvRow[] = details.map((d) => ({
    session_id: d.session_id,
    interview_config_id: configId,
    started_at: d.started_at,
    completed_at: d.completed_at,
    user_id: d.user_id,
    rating: d.rating,
    messages: d.messages,
  }));

  const csv = buildConversationsCsv(rows);
  const date = new Date().toISOString().slice(0, 10);
  const filename = `topic-conversations-${configId}-${date}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
