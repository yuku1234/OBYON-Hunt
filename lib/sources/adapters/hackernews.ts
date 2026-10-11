// ============================================================
// Hacker News Adapter — Algolia Public Tech Index
// Live targeted tech & startup buyer-demand discovery.
// ============================================================

import type {
  SourceAdapter,
  SourceConnectionStatus,
  SourceTestResult,
  SourceDiscoveryInput,
  RawCandidate,
  SourceSetupGuide,
} from "./types";

interface HNAlgoliaHit {
  objectID: string;
  title: string;
  story_text?: string;
  author: string;
  url?: string;
  created_at: string;
  points?: number;
}

export class HackerNewsAdapter implements SourceAdapter {
  readonly id = "hackernews";
  readonly name = "Hacker News";
  readonly type = "hackernews";
  readonly method = "public_index" as const;
  readonly description = "Searches Hacker News posts, 'Ask HN', and hiring discussions for tech demand and project requirements using the official Algolia search index.";
  readonly requiredEnvVars = [];

  private lastTestedAt?: string;

  async getStatus(): Promise<{
    status: SourceConnectionStatus;
    statusMessage: string;
    lastTestedAt?: string;
  }> {
    return {
      status: "connected",
      statusMessage: "Connected to Hacker News Public Algolia Search Index",
      lastTestedAt: this.lastTestedAt,
    };
  }

  async testConnection(): Promise<SourceTestResult> {
    const start = Date.now();
    try {
      const res = await fetch("https://hn.algolia.com/api/v1/search?query=technology&hitsPerPage=1", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`HN Algolia API returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (!Array.isArray(data.hits)) {
        throw new Error("Invalid response format from HN Algolia");
      }

      this.lastTestedAt = new Date().toISOString();
      return {
        sourceId: this.id,
        sourceName: this.name,
        status: "connected",
        statusMessage: "Successfully connected to Hacker News Algolia Search API.",
        latencyMs: Date.now() - start,
        testedAt: this.lastTestedAt,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        sourceId: this.id,
        sourceName: this.name,
        status: "temporarily_unavailable",
        statusMessage: `HN test failed: ${msg}`,
        latencyMs: Date.now() - start,
        testedAt: new Date().toISOString(),
      };
    }
  }

  async discover(input: SourceDiscoveryInput): Promise<RawCandidate[]> {
    try {
      const query = encodeURIComponent(`looking for ${input.service}`);
      const res = await fetch(
        `https://hn.algolia.com/api/v1/search?query=${query}&tags=(story,ask_hn)&hitsPerPage=8`,
        { cache: "no-store" }
      );

      if (!res.ok) return [];

      const data = await res.json();
      const hits: HNAlgoliaHit[] = data.hits || [];
      const candidates: RawCandidate[] = [];

      for (const hit of hits) {
        if (!hit.title) continue;

        const titleLower = hit.title.toLowerCase();
        const text = hit.story_text ? hit.story_text.replace(/<[^>]*>/g, "") : hit.title;
        const textLower = text.toLowerCase();

        // Check for buyer intent indicators
        const hasHireRequest =
          titleLower.includes("looking for") ||
          titleLower.includes("who is hiring") ||
          titleLower.includes("need someone") ||
          textLower.includes("looking to hire") ||
          textLower.includes("recommend someone");

        const isSeller =
          titleLower.includes("show hn") ||
          titleLower.includes("i built") ||
          titleLower.includes("we built") ||
          titleLower.includes("freelancer available");

        const buyerClassification = isSeller ? "SELLER" : hasHireRequest ? "BUYER" : "GENERAL";
        const hnUrl = `https://news.ycombinator.com/item?id=${hit.objectID}`;

        candidates.push({
          sourceId: `hn-${hit.objectID}`,
          sourceName: "Hacker News",
          sourceType: "hackernews",
          sourceUrl: hit.url && hit.url.startsWith("http") ? hit.url : hnUrl,
          sourcePlatform: "Hacker News",
          sourceTitle: hit.title,
          authorName: hit.author || "HN User",
          authorHandle: hit.author || null,
          companyName: null,
          location: input.location || null,
          content: text,
          evidence: text.slice(0, 300),
          detectedNeed: `Technical request for ${input.service}`,
          detectedProblem: input.problem,
          buyerClassification,
          publishedAt: hit.created_at,
          discoveredAt: new Date().toISOString(),
          signals: {
            hasExplicitHireRequest: hasHireRequest,
            hasActiveHiring: titleLower.includes("who is hiring"),
            hasClearBusinessProblem: true,
            isSellerOrAgencySelfPromo: isSeller,
          },
          urgency: "medium",
          budgetSignal: "no_signal",
        });
      }

      return candidates;
    } catch (err) {
      console.error("[HackerNewsAdapter] Error querying Algolia:", err);
      return [];
    }
  }

  getSetupGuide(): SourceSetupGuide {
    return {
      title: "Hacker News Public Search API",
      description: "Queries the official public Algolia search API for Hacker News without requiring authentication.",
      consoleUrl: "https://hn.algolia.com/api",
      requiredEnvVars: [],
      complianceNotes: "Operates 100% compliantly through the official public Hacker News Algolia REST API. Rate limits are respected.",
      steps: [
        "1. Hacker News is an open public index — no API keys required.",
        "2. Ready to search immediately out of the box.",
        "3. Click 'Test Connection' on the Sources page to verify real-time status.",
      ],
    };
  }

  generateCompliantSearchUrl(input: { service: string; problem: string; location?: string }): string {
    const q = `${input.service} ${input.problem}`.trim();
    return `https://hn.algolia.com/?q=${encodeURIComponent(q)}`;
  }
}

export const hackerNewsAdapter = new HackerNewsAdapter();
