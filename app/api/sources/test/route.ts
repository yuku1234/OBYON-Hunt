// ============================================================
// POST /api/sources/test
// Tests connection to one or all source adapters live.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { sourceRegistry } from "@/lib/sources/adapters/registry";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    let sourceId: string | undefined;

    try {
      const body = await req.json();
      if (body && typeof body.sourceId === "string") {
        sourceId = body.sourceId;
      }
    } catch {
      // Body empty: test all
    }

    if (sourceId) {
      const result = await sourceRegistry.testAdapter(sourceId);
      return NextResponse.json({ success: result.status === "connected", result });
    }

    const results = await sourceRegistry.testAllAdapters();
    return NextResponse.json({
      success: results.some((r) => r.status === "connected"),
      results,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
