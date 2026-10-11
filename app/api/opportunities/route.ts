// ============================================================
// GET /api/opportunities
// Fetch all persisted opportunities.
// ============================================================

import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const opportunities = await dbService.getOpportunities();
    return NextResponse.json({ opportunities });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
