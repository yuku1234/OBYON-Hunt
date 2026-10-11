// ============================================================
// GET /api/sources
// Returns all registered lead sources with live connection statuses.
// ============================================================

import { NextResponse } from "next/server";
import { sourceRegistry } from "@/lib/sources/adapters/registry";
import { dbService } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const adapters = sourceRegistry.getAllAdapters();
    const allOpps = await dbService.getOpportunities();

    const sources = await Promise.all(
      adapters.map(async (adapter) => {
        const { status, statusMessage, lastTestedAt } = await adapter.getStatus();
        const guide = adapter.getSetupGuide();

        // Calculate actual opportunities found from this source
        const matchingOpps = allOpps.filter(
          (o) =>
            o.sourceType === adapter.type ||
            o.sourceName.toLowerCase().includes(adapter.name.toLowerCase()) ||
            o.sourcePlatform?.toLowerCase().includes(adapter.name.toLowerCase())
        );

        return {
          id: adapter.id,
          name: adapter.name,
          type: adapter.type,
          method: adapter.method,
          description: adapter.description,
          status,
          statusMessage,
          lastTestedAt: lastTestedAt || null,
          requiredEnvVars: adapter.requiredEnvVars,
          setupGuide: guide,
          totalOpportunitiesFound: matchingOpps.length,
        };
      })
    );

    return NextResponse.json({ sources });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
