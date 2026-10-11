// ============================================================
// POST /api/discover
// Live Multi-Source Lead Discovery Endpoint
// Integrates Google Search Grounding, Reddit, X, HN, GitHub, and compliant workflows.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { runMultiSourceDiscovery } from "@/lib/ai/multi-source-discovery";
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
      selectedSources = ["google_grounding", "hackernews", "github"],
    } = body as {
      service: string;
      problem: string;
      location?: string;
      freshness?: FreshnessFilter;
      minIntentScore?: number;
      selectedSources?: string[];
    };

    if (!problem || problem.trim().length < 3) {
      return NextResponse.json(
        { error: "Please enter a specific problem or requirement to search for." },
        { status: 400 }
      );
    }

    // 1. Run Multi-Source Discovery
    const discoveryResult = await runMultiSourceDiscovery({
      service: service.trim(),
      problem: problem.trim(),
      location: location.trim(),
      freshness: (freshness as FreshnessFilter) || "7d",
      minIntentScore: Number(minIntentScore) || 50,
      selectedSourceIds: selectedSources,
    });

    const searchRunId = discoveryResult.searchRunId;

    // 2. Persist Verified Opportunities (Deduplicated by URL)
    let dbResult: { savedCount: number; supabaseSaved: boolean; error?: string } = {
      savedCount: 0,
      supabaseSaved: false,
    };
    if (discoveryResult.opportunities.length > 0) {
      dbResult = await dbService.saveOpportunities(discoveryResult.opportunities);
    }

    // 3. Persist Search Run Audit Record
    const searchRunRecord: SearchRun = {
      id: searchRunId,
      serviceCategory: service,
      problem,
      location,
      freshness: (freshness as FreshnessFilter) || "7d",
      minIntentScore: Number(minIntentScore) || 50,
      queries: discoveryResult.queriesGenerated,
      scannedCount: discoveryResult.scannedCount,
      buyerCount: discoveryResult.buyerCount,
      sellerCount: discoveryResult.sellerCount,
      generalCount: discoveryResult.generalCount,
      unknownCount: discoveryResult.unknownCount,
      rejectedCount: discoveryResult.rejectedCount,
      savedCount: discoveryResult.opportunities.length,
      createdAt: new Date().toISOString(),
    };

    const runResult = await dbService.saveSearchRun(searchRunRecord);

    return NextResponse.json(
      {
        success: true,
        searchRunId,
        queriesGenerated: discoveryResult.queriesGenerated,
        scannedCount: discoveryResult.scannedCount,
        buyerCount: discoveryResult.buyerCount,
        sellerCount: discoveryResult.sellerCount,
        generalCount: discoveryResult.generalCount,
        unknownCount: discoveryResult.unknownCount,
        rejectedCount: discoveryResult.rejectedCount,
        savedCount: discoveryResult.opportunities.length,
        opportunities: discoveryResult.opportunities,
        sourceOutcomes: discoveryResult.sourceOutcomes,
        compliantLinks: discoveryResult.compliantLinks,
        supabaseSaved: dbResult.supabaseSaved && runResult.supabaseSaved,
        dbError: dbResult.error || runResult.error,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/discover] Error executing multi-source discovery:", message);

    return NextResponse.json(
      {
        error: message || "Failed to execute multi-source discovery.",
        failedAt: "Multi-Source Engine",
      },
      { status: 500 }
    );
  }
}
