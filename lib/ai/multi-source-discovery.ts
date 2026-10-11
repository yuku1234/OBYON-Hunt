// ============================================================
// Multi-Source Lead Discovery Engine
// Orchestrates discovery across all enabled source adapters,
// classifies demand, scores buying intent, and deduplicates.
// ============================================================

import type { Opportunity, FreshnessFilter, ServiceCategory } from "@/types";
import { sourceRegistry } from "@/lib/sources/adapters/registry";
import type { RawCandidate, SourceDiscoveryInput } from "@/lib/sources/adapters/types";
import { calculateIntentScore } from "./discovery";

export interface MultiSourceDiscoveryOptions extends SourceDiscoveryInput {
  selectedSourceIds?: string[];
}

export interface SourceExecutionOutcome {
  sourceId: string;
  sourceName: string;
  scannedCount: number;
  buyerCount: number;
  rejectedCount: number;
  error?: string;
}

export interface MultiSourceDiscoveryResult {
  searchRunId: string;
  queriesGenerated: string[];
  scannedCount: number;
  buyerCount: number;
  sellerCount: number;
  generalCount: number;
  unknownCount: number;
  rejectedCount: number;
  savedCount: number;
  opportunities: Opportunity[];
  sourceOutcomes: SourceExecutionOutcome[];
  compliantLinks: Record<string, string>;
}

export async function runMultiSourceDiscovery(
  options: MultiSourceDiscoveryOptions
): Promise<MultiSourceDiscoveryResult> {
  const allAdapters = sourceRegistry.getAllAdapters();
  const selectedIds = options.selectedSourceIds && options.selectedSourceIds.length > 0
    ? options.selectedSourceIds
    : ["google_grounding", "hackernews", "github"];

  const activeAdapters = allAdapters.filter((a) => selectedIds.includes(a.id));

  const sourceOutcomes: SourceExecutionOutcome[] = [];
  const compliantLinks: Record<string, string> = {};
  const rawCandidates: RawCandidate[] = [];

  // Generate compliant deep links for every adapter that supports it
  for (const adapter of allAdapters) {
    if (adapter.generateCompliantSearchUrl) {
      compliantLinks[adapter.id] = adapter.generateCompliantSearchUrl({
        service: options.service,
        problem: options.problem,
        location: options.location,
      });
    }
  }

  // Execute discovery concurrently across all active adapters with fault isolation
  const results = await Promise.allSettled(
    activeAdapters.map(async (adapter) => {
      try {
        const candidates = await adapter.discover(options);
        return { adapter, candidates, error: undefined };
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        return { adapter, candidates: [], error: errorMsg };
      }
    })
  );

  let totalScanned = 0;
  let totalBuyer = 0;
  let totalSeller = 0;
  let totalGeneral = 0;
  let totalUnknown = 0;
  let totalRejected = 0;

  for (const res of results) {
    if (res.status === "fulfilled") {
      const { adapter, candidates, error } = res.value;
      const scanned = candidates.length;
      let buyerInSource = 0;
      let rejectedInSource = 0;

      for (const c of candidates) {
        if (c.buyerClassification === "BUYER") {
          buyerInSource++;
        } else {
          rejectedInSource++;
        }
      }

      sourceOutcomes.push({
        sourceId: adapter.id,
        sourceName: adapter.name,
        scannedCount: scanned,
        buyerCount: buyerInSource,
        rejectedCount: rejectedInSource,
        error,
      });

      rawCandidates.push(...candidates);
    }
  }

  // Process and qualify candidates
  const seenUrls = new Set<string>();
  const verifiedOpportunities: Opportunity[] = [];
  const searchRunId = `run-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  for (const c of rawCandidates) {
    totalScanned++;

    // Track classification totals
    if (c.buyerClassification === "BUYER") totalBuyer++;
    else if (c.buyerClassification === "SELLER") totalSeller++;
    else if (c.buyerClassification === "GENERAL") totalGeneral++;
    else totalUnknown++;

    // RULE 1: Only BUYER results enter pipeline
    if (c.buyerClassification !== "BUYER") {
      totalRejected++;
      continue;
    }

    // RULE 2: Must have a verifiable valid HTTP/HTTPS URL
    if (!c.sourceUrl || !c.sourceUrl.startsWith("http")) {
      totalRejected++;
      continue;
    }

    // RULE 3: Deduplication across all sources by normalized URL
    const normalizedUrl = c.sourceUrl.split("?")[0].toLowerCase().trim();
    if (seenUrls.has(normalizedUrl)) {
      totalRejected++;
      continue;
    }
    seenUrls.add(normalizedUrl);

    // RULE 4: Intent scoring & explanation
    const scoreResult = calculateIntentScore("BUYER", c.signals);

    // RULE 5: Minimum intent filter
    if (scoreResult.score < options.minIntentScore) {
      totalRejected++;
      continue;
    }

    const urgency = c.urgency || "medium";
    const urgencyScore =
      urgency === "critical" ? 95 : urgency === "high" ? 80 : urgency === "medium" ? 60 : 35;

    const opp: Opportunity = {
      id: `opp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      searchRunId,
      sourceId: c.sourceId,
      sourceName: c.sourceName,
      sourceType: c.sourceType as any,
      sourceUrl: c.sourceUrl,
      sourceTitle: c.sourceTitle,
      sourcePlatform: c.sourcePlatform,
      authorName: c.authorName || "Prospective Client",
      authorHandle: c.authorHandle || null,
      companyName: c.companyName || null,
      location: c.location || options.location || null,
      avatarUrl: null,
      title: c.sourceTitle,
      content: c.content,
      evidence: c.evidence,
      publishedAt: c.publishedAt || new Date().toISOString(),
      discoveredAt: new Date().toISOString(),
      detectedNeed: c.detectedNeed,
      detectedProblem: c.detectedProblem,
      detectedRequirement: c.detectedNeed,
      buyerClassification: "BUYER",
      matchedServices: [options.service.toLowerCase().replace(/\s+/g, "_") as ServiceCategory],
      primaryService: options.service.toLowerCase().replace(/\s+/g, "_") as ServiceCategory,
      intentScore: scoreResult.score,
      urgencyScore,
      confidenceScore: Math.min(95, Math.max(70, scoreResult.score - 5)),
      intentStrength: scoreResult.score >= 80 ? "explicit" : "implicit",
      urgency,
      budgetSignal: c.budgetSignal || "no_signal",
      reasoning: scoreResult.reasoning,
      suggestedOutreach: `Hi, saw your requirement regarding ${c.detectedNeed}. OBYON specializes in ${options.service} for ${c.detectedProblem}. Would love to share how we can deliver this for you.`,
      tags: [options.service.toLowerCase(), c.sourceType, "buyer"],
      status: "NEW",
      isBookmarked: false,
      notes: null,
    };

    verifiedOpportunities.push(opp);
  }

  return {
    searchRunId,
    queriesGenerated: [
      `looking for ${options.service} ${options.problem}`,
      `need ${options.service} developer`,
      `hiring ${options.service}`,
    ],
    scannedCount: totalScanned,
    buyerCount: totalBuyer,
    sellerCount: totalSeller,
    generalCount: totalGeneral,
    unknownCount: totalUnknown,
    rejectedCount: totalRejected,
    savedCount: verifiedOpportunities.length,
    opportunities: verifiedOpportunities,
    sourceOutcomes,
    compliantLinks,
  };
}
