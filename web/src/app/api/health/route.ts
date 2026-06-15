import { createAdminClient } from "@mirai-gikai/supabase";
import { NextResponse } from "next/server";

/**
 * ヘルスチェック（チェックポイント）API
 *
 * UptimeRobot などの外部監視サービスから定期的に GET される想定。
 * - アプリが応答できること
 * - Supabase（DB）に疎通できること
 * を確認し、健全なら 200、異常なら 503 を返す。
 *
 * 監視サービス側では HTTP ステータス、または本文中の `"status":"ok"` を
 * キーワード監視に利用できる。
 */

// 常に最新状態を確認するためキャッシュを無効化
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CheckStatus = "ok" | "error";

export async function GET() {
  const startedAt = Date.now();

  // DB 疎通確認: 行を返さない HEAD count クエリで最小コストに抑える
  let database: CheckStatus = "ok";
  let databaseError: string | undefined;
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("ai_settings")
      .select("*", { count: "exact", head: true });

    if (error) {
      database = "error";
      databaseError = error.message;
    }
  } catch (error) {
    database = "error";
    databaseError = error instanceof Error ? error.message : "unknown error";
  }

  const healthy = database === "ok";

  return NextResponse.json(
    {
      status: healthy ? "ok" : "error",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      responseTimeMs: Date.now() - startedAt,
      checks: {
        database,
        ...(databaseError ? { databaseError } : {}),
      },
    },
    {
      status: healthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
