// ============================================================
// POST /api/discover
// Live Production Web Discovery Endpoint
// Powered by @google/genai with Google Search Grounding.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { runRealWebDiscovery } from "@/lib/ai/discovery";
import { dbService } from "@/lib/db";
import type { FreshnessFilter, SearchRun } from "@/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      service = "AI Automation",
      problem = "",
      location = "",
      freshness = "7d",
      minIntentScore = 50,
    } = body as {
      service: string;
      problem: string;
      location?: string;
      freshness?: FreshnessFilter;
      minIntentScore?: number;
    };

    if (!problem || problem.trim().length < 3) {
      return NextResponse.json(
        { error: "Please enter a specific problem or requirement to search for." },
        { status: 400 }
      );
    }

    // 1. Run Real Web Discovery (Google Search Grounding)
    const metrics = await runRealWebDiscovery({
      service: service.trim(),
      problem: problem.trim(),
      location: location.trim(),
      freshness: (freshness as FreshnessFilter) || "7d",
      minIntentScore: Number(minIntentScore) || 50,
    });

    const searchRunId = `run-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Attach searchRunId to each opportunity
    const opportunitiesWithRunId = metrics.opportunities.map((opp) => ({
      ...opp,
      searchRunId,
    }));

    // 2. Persist to Database (Supabase + resilient local store)
    const dbResult = await dbService.saveOpportunities(opportunitiesWithRunId);

    const searchRunRecord: SearchRun = {
      id: searchRunId,
      serviceCategory: service,
      problem,
      location,
      freshness: (freshness as FreshnessFilter) || "7d",
      minIntentScore: Number(minIntentScore) || 50,
      queries: metrics.queriesGenerated,
      scannedCount: metrics.scannedCount,
      buyerCount: metrics.buyerCount,
      sellerCount: metrics.sellerCount,
      generalCount: metrics.generalCount,
      unknownCount: metrics.unknownCount,
      rejectedCount: metrics.rejectedCount,
      savedCount: opportunitiesWithRunId.length,
      createdAt: new Date().toISOString(),
    };

    const runResult = await dbService.saveSearchRun(searchRunRecord);

    return NextResponse.json(
      {
        success: true,
        searchRunId,
        queriesGenerated: metrics.queriesGenerated,
        scannedCount: metrics.scannedCount,
        buyerCount: metrics.buyerCount,
        sellerCount: metrics.sellerCount,
        generalCount: metrics.generalCount,
        unknownCount: metrics.unknownCount,
        rejectedCount: metrics.rejectedCount,
        savedCount: opportunitiesWithRunId.length,
        opportunities: opportunitiesWithRunId,
        supabaseSaved: dbResult.supabaseSaved && runResult.supabaseSaved,
        dbError: dbResult.error || runResult.error,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/discover] Error executing live web discovery:", message);

    return NextResponse.json(
      {
        error: message || "Failed to execute live web discovery.",
        failedAt: "Google Search Grounding / Gemini Engine",
      },
      { status: 500 }
    );
  }
}
