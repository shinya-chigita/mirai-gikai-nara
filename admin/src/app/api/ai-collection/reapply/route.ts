import { NextResponse } from "next/server";
import { createAdminClient } from "@mirai-gikai/supabase";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { applyDrafts } from "@/features/ai-collection/server/actions/apply-drafts";
import { loadRun } from "@/features/ai-collection/server/utils/storage";

// Re-apply a collection run: delete existing bills matching (bill_number, published_at)
// then apply as new. Use this when re-collecting a date range with an improved prompt.
export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = (await request.json()) as { runId?: string };
    if (!body.runId) {
      return NextResponse.json({ error: "runId is required" }, { status: 400 });
    }

    const run = await loadRun(body.runId);
    if (!run) {
      return NextResponse.json({ error: "run not found" }, { status: 404 });
    }
    if (run.status !== "completed") {
      return NextResponse.json(
        { error: "run is not completed" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Delete existing bills matching the run's date (published_at = run.startDate)
    const { error: delError, count: deletedCount } = await supabase
      .from("bills")
      .delete({ count: "exact" })
      .eq("published_at", run.startDate);

    if (delError) {
      return NextResponse.json(
        { error: `delete failed: ${delError.message}` },
        { status: 500 }
      );
    }

    // Apply all bills of the run as new
    const newBillIds = run.bills.map((b) => b.id);
    const result = await applyDrafts({
      runId: run.id,
      newBillIds,
      existingBillOverrides: [],
    });

    return NextResponse.json({
      deletedCount,
      appliedCount: result.appliedCount,
      warnings: result.warnings,
      error: result.error,
    });
  } catch (error) {
    console.error("reapply error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "unknown" },
      { status: 500 }
    );
  }
}
