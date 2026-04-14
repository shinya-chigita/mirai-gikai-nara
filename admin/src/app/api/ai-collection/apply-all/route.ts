import { NextResponse } from "next/server";
import { applyDrafts } from "@/features/ai-collection/server/actions/apply-drafts";
import { loadAllRuns } from "@/features/ai-collection/server/utils/storage";

export async function POST() {
  try {
    const runs = await loadAllRuns();
    // Keep only completed runs, dedupe by date range (latest wins), skip test data.
    const latestByRange = new Map<string, (typeof runs)[number]>();
    for (const r of runs) {
      if (r.status !== "completed") continue;
      if (r.startDate.startsWith("2099")) continue;
      if (r.bills.length === 0) continue;
      const key = `${r.startDate}|${r.endDate}`;
      const existing = latestByRange.get(key);
      if (!existing || new Date(r.createdAt) > new Date(existing.createdAt)) {
        latestByRange.set(key, r);
      }
    }
    const completed = Array.from(latestByRange.values()).sort((a, b) =>
      a.startDate.localeCompare(b.startDate)
    );

    const results: Array<{
      runId: string;
      range: string;
      appliedCount: number;
      warnings: string[];
      error?: string;
    }> = [];

    for (const run of completed) {
      const newBillIds = run.bills.map((b) => b.id);
      const result = await applyDrafts({
        runId: run.id,
        newBillIds,
        existingBillOverrides: [],
      });
      results.push({
        runId: run.id,
        range: `${run.startDate}~${run.endDate}`,
        appliedCount: result.appliedCount,
        warnings: result.warnings,
        error: result.error,
      });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("apply-all error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "unknown" },
      { status: 500 }
    );
  }
}
