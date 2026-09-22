import type { SearchQuery, SearchResult } from "@/types";
import { mockOpportunities } from "@/lib/opportunities/mock-data";

// ============================================================
// Search Service
// Stub implementation using in-memory mock data.
// TODO Phase 2: Replace with vector search / full-text search
// ============================================================

export class SearchService {
  /**
   * Execute a discovery search query.
   * Currently filters mock data — Phase 2 will query live sources.
   */
  async search(query: SearchQuery): Promise<SearchResult> {
    const startTime = Date.now();

    let results = [...mockOpportunities];

    // Filter by text query
    if (query.query.trim()) {
      const q = query.query.toLowerCase();
      results = results.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.content.toLowerCase().includes(q) ||
          o.detectedNeed.toLowerCase().includes(q) ||
          o.tags.some((t) => t.includes(q))
      );
    }

    // Filter by service category
    if (query.serviceCategory !== "all") {
      results = results.filter(
        (o) =>
          o.primaryService === query.serviceCategory ||
          o.matchedServices.includes(query.serviceCategory as never)
      );
    }

    // Filter by location
    if (query.location.trim()) {
      const loc = query.location.toLowerCase();
      results = results.filter((o) => o.location?.toLowerCase().includes(loc));
    }

    // Filter by source type
    if (query.sourceType !== "all") {
      results = results.filter((o) => o.sourceType === query.sourceType);
    }

    // Filter by date range
    if (query.dateFrom) {
      const from = new Date(query.dateFrom).getTime();
      results = results.filter(
        (o) => new Date(o.publishedAt).getTime() >= from
      );
    }
    if (query.dateTo) {
      const to = new Date(query.dateTo).getTime();
      results = results.filter(
        (o) => new Date(o.publishedAt).getTime() <= to
      );
    }

    // Filter by minimum intent score
    if (query.minIntentScore > 0) {
      results = results.filter((o) => o.intentScore >= query.minIntentScore);
    }

    // Sort by intent score desc
    results.sort((a, b) => b.intentScore - a.intentScore);

    // Limit results
    const limited = results.slice(0, query.maxResults || 50);

    return {
      query,
      opportunities: limited,
      totalFound: results.length,
      searchedAt: new Date().toISOString(),
      executionTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Get search suggestions based on partial query.
   * TODO Phase 2: Connect to real search index
   */
  async getSuggestions(partialQuery: string): Promise<string[]> {
    if (partialQuery.length < 2) return [];

    const q = partialQuery.toLowerCase();
    const suggestions = new Set<string>();

    mockOpportunities.forEach((o) => {
      o.tags.forEach((tag) => {
        if (tag.includes(q)) suggestions.add(tag);
      });
      if (o.detectedNeed.toLowerCase().includes(q)) {
        suggestions.add(o.detectedNeed);
      }
    });

    return Array.from(suggestions).slice(0, 5);
  }
}

export const searchService = new SearchService();
