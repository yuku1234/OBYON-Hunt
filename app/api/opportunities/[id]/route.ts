// ============================================================
// PATCH & GET /api/opportunities/[id]
// Update lead status (NEW, QUALIFIED, CONTACTED, etc.) and notes.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db";
import type { LeadStatus } from "@/types";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const opp = await dbService.getOpportunityById(id);
    if (!opp) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }
    return NextResponse.json(opp);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, notes } = body as { status?: LeadStatus | string; notes?: string };

    if (status) {
      await dbService.updateStatus(id, status);
    }

    if (notes !== undefined) {
      await dbService.updateNotes(id, notes);
    }

    const updated = await dbService.getOpportunityById(id);
    return NextResponse.json({ success: true, opportunity: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
