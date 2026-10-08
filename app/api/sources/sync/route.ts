// ============================================================
// POST /api/sources/sync
// Live ingestion & AI scoring endpoint for background or manual sync.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { pipelineEngine } from "@/lib/pipeline";
import type { SourceType } from "@/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    let sourceType: SourceType | undefined;

    try {
      const body = await req.json();
      if (body && body.sourceType && body.sourceType !== "all") {
        sourceType = body.sourceType as SourceType;
      }
    } catch {
      // Body empty or invalid JSON — default to sync all sources
    }

    const result = await pipelineEngine.runSync(sourceType);

    return NextResponse.json({
      success: true,
      message: `Scanned ${result.scannedCount} signals, discovered ${result.newOpportunitiesCount} new opportunities (${result.highIntentCount} high intent).`,
      result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Sync error";
    console.error("[/api/sources/sync] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
