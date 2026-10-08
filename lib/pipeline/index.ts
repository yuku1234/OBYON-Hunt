import type { Opportunity, SourceType } from "@/types";
import { fetchLiveSignals, type RawSignal } from "../sources";
import { createAIProvider } from "../ai";
import { opportunityService } from "../opportunities";

export interface SyncResult {
  scannedCount: number;
  newOpportunitiesCount: number;
  highIntentCount: number;
  opportunities: Opportunity[];
  executionTimeMs: number;
}

export class PipelineEngine {
  async runSync(sourceType?: SourceType): Promise<SyncResult> {
    const startTime = Date.now();
    const rawSignals = await fetchLiveSignals(sourceType);
    const ai = createAIProvider();

    const newOpportunities: Opportunity[] = [];
    let highIntentCount = 0;

    // Process signals (analyze top 5-10 items to remain responsive)
    const itemsToProcess = rawSignals.slice(0, 10);

    for (const signal of itemsToProcess) {
      try {
        const analysis = await ai.analyzeIntent(signal.content, `Title: ${signal.title}`);

        const opp: Opportunity = {
          id: `live-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          sourceId: signal.externalId,
          sourceName: signal.sourceName,
          sourceType: signal.sourceType,
          sourceUrl: signal.sourceUrl,
          authorName: signal.authorName,
          authorHandle: signal.authorHandle,
          companyName: signal.companyName,
          location: signal.location,
          avatarUrl: null,
          title: signal.title,
          content: signal.content,
          publishedAt: signal.publishedAt,
          discoveredAt: new Date().toISOString(),
          detectedNeed: analysis.detectedNeed,
          detectedProblem: analysis.detectedProblem,
          detectedRequirement: analysis.detectedRequirement,
          matchedServices: analysis.matchedServices,
          primaryService: analysis.primaryService,
          intentScore: analysis.intentScore,
          urgencyScore: analysis.urgencyScore,
          confidenceScore: analysis.confidenceScore,
          intentStrength: analysis.intentStrength,
          urgency: analysis.urgency,
          budgetSignal: analysis.budgetSignal,
          reasoning: analysis.reasoning,
          suggestedOutreach: analysis.suggestedOutreach,
          tags: analysis.tags,
          status: "new",
          isBookmarked: false,
          notes: null,
        };

        if (opp.intentScore >= 80) {
          highIntentCount++;
        }

        await opportunityService.addOpportunity(opp);
        newOpportunities.push(opp);
      } catch (err) {
        console.error(`[PipelineEngine] Failed to process signal ${signal.externalId}:`, err);
      }
    }

    return {
      scannedCount: rawSignals.length,
      newOpportunitiesCount: newOpportunities.length,
      highIntentCount,
      opportunities: newOpportunities,
      executionTimeMs: Date.now() - startTime,
    };
  }
}

export const pipelineEngine = new PipelineEngine();
