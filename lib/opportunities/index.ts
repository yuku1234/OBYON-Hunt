import type {
  Opportunity,
  OpportunityStatus,
  ServiceCategory,
  SourceType,
} from "@/types";
import { mockOpportunities } from "./mock-data";

// ============================================================
// Opportunity Service
// Stub implementation using mock data.
// Replace method bodies with real Supabase queries in Phase 2.
// ============================================================

export interface OpportunityFilters {
  status?: OpportunityStatus;
  primaryService?: ServiceCategory;
  sourceType?: SourceType;
  minIntentScore?: number;
  intentStrength?: "explicit" | "implicit" | "weak";
  isBookmarked?: boolean;
  searchQuery?: string;
}

export class OpportunityService {
  /**
   * Get all opportunities, optionally filtered.
   * TODO Phase 2: Replace with Supabase query
   */
  async getAll(filters?: OpportunityFilters): Promise<Opportunity[]> {
    let results = [...mockOpportunities];

    if (filters) {
      if (filters.status) {
        results = results.filter((o) => o.status === filters.status);
      }
      if (filters.primaryService) {
        results = results.filter((o) => o.primaryService === filters.primaryService);
      }
      if (filters.sourceType) {
        results = results.filter((o) => o.sourceType === filters.sourceType);
      }
      if (filters.minIntentScore !== undefined) {
        results = results.filter((o) => o.intentScore >= filters.minIntentScore!);
      }
      if (filters.intentStrength) {
        results = results.filter((o) => o.intentStrength === filters.intentStrength);
      }
      if (filters.isBookmarked !== undefined) {
        results = results.filter((o) => o.isBookmarked === filters.isBookmarked);
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        results = results.filter(
          (o) =>
            o.title.toLowerCase().includes(q) ||
            o.content.toLowerCase().includes(q) ||
            o.detectedNeed.toLowerCase().includes(q) ||
            o.authorName.toLowerCase().includes(q) ||
            (o.companyName?.toLowerCase().includes(q) ?? false)
        );
      }
    }

    // Sort by intent score descending by default
    return results.sort((a, b) => b.intentScore - a.intentScore);
  }

  /**
   * Get a single opportunity by ID.
   * TODO Phase 2: Replace with Supabase query
   */
  async getById(id: string): Promise<Opportunity | null> {
    return mockOpportunities.find((o) => o.id === id) ?? null;
  }

  /**
   * Update opportunity status.
   * TODO Phase 2: Replace with Supabase update
   */
  async updateStatus(id: string, status: OpportunityStatus): Promise<boolean> {
    const opp = mockOpportunities.find((o) => o.id === id);
    if (!opp) return false;
    // In mock: mutate in-memory (for demo only)
    opp.status = status;
    return true;
  }

  /**
   * Toggle bookmark.
   * TODO Phase 2: Replace with Supabase update
   */
  async toggleBookmark(id: string): Promise<boolean> {
    const opp = mockOpportunities.find((o) => o.id === id);
    if (!opp) return false;
    opp.isBookmarked = !opp.isBookmarked;
    return true;
  }

  /**
   * Get bookmarked opportunities.
   */
  async getBookmarked(): Promise<Opportunity[]> {
    return mockOpportunities
      .filter((o) => o.isBookmarked)
      .sort((a, b) => b.intentScore - a.intentScore);
  }
}

export const opportunityService = new OpportunityService();
