// ============================================================
// Opportunity Service — Real DB Persistence Layer
// Zero mock data in production. Connects directly to dbService.
// ============================================================

import type {
  Opportunity,
  OpportunityStatus,
  ServiceCategory,
  SourceType,
} from "@/types";
import { dbService } from "@/lib/db";

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
   * Get all opportunities from database, optionally filtered.
   */
  async getAll(filters?: OpportunityFilters): Promise<Opportunity[]> {
    const opps = await dbService.getOpportunities();
    let results = [...opps];

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

    return results.sort((a, b) => b.intentScore - a.intentScore);
  }

  /**
   * Get a single opportunity by ID.
   */
  async getById(id: string): Promise<Opportunity | null> {
    return await dbService.getOpportunityById(id);
  }

  /**
   * Update opportunity status.
   */
  async updateStatus(id: string, status: OpportunityStatus): Promise<boolean> {
    return await dbService.updateStatus(id, status as any);
  }

  /**
   * Add a newly discovered opportunity.
   */
  async addOpportunity(opp: Opportunity): Promise<void> {
    await dbService.saveOpportunities([opp]);
  }

  /**
   * Get bookmarked opportunities.
   */
  async getBookmarked(): Promise<Opportunity[]> {
    const all = await dbService.getOpportunities();
    return all
      .filter((o) => o.isBookmarked)
      .sort((a, b) => b.intentScore - a.intentScore);
  }
}

export const opportunityService = new OpportunityService();
