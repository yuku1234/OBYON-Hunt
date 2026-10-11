// ============================================================
// Source Adapter Architecture — Types & Interfaces
// Defines the unified contract for all lead discovery sources.
// ============================================================

import type { ServiceCategory, FreshnessFilter } from "@/types";

export type SourceConnectionStatus =
  | "connected"
  | "configuration_required"
  | "permission_required"
  | "temporarily_unavailable"
  | "not_supported";

export type IntegrationMethod =
  | "grounding"          // Live Google Search Grounding via @google/genai
  | "official_api"       // Approved platform API with developer credentials
  | "compliant_search"   // Permitted direct deep-search workflow (no unauthorized scraping)
  | "public_index";      // Publicly accessible index/API (e.g. Hacker News Algolia)

export interface SourceSetupGuide {
  title: string;
  description: string;
  consoleUrl?: string;
  requiredEnvVars: Array<{
    key: string;
    description: string;
    required: boolean;
  }>;
  complianceNotes: string;
  steps: string[];
}

export interface SourceCandidateSignals {
  hasExplicitHireRequest?: boolean;
  hasActiveHiring?: boolean;
  hasSpecificProjectScope?: boolean;
  hasClearBusinessProblem?: boolean;
  hasBudgetOrCompensation?: boolean;
  hasUrgencyWords?: boolean;
  isSellerOrAgencySelfPromo?: boolean;
  isGenericArticleOrNews?: boolean;
}

export interface RawCandidate {
  sourceId: string;
  sourceName: string;
  sourceType: string;
  sourceUrl: string;
  sourcePlatform: string;
  sourceTitle: string;
  authorName?: string;
  authorHandle?: string | null;
  companyName?: string | null;
  location?: string | null;
  content: string;
  evidence: string;
  detectedNeed: string;
  detectedProblem: string;
  buyerClassification: "BUYER" | "SELLER" | "GENERAL" | "UNKNOWN";
  publishedAt?: string;
  discoveredAt: string;
  signals: SourceCandidateSignals;
  urgency?: "critical" | "high" | "medium" | "low";
  budgetSignal?: "confirmed_budget" | "implied_budget" | "no_signal" | "budget_concern";
}

export interface SourceDiscoveryInput {
  service: string;
  problem: string;
  location?: string;
  freshness: FreshnessFilter;
  minIntentScore: number;
}

export interface SourceTestResult {
  sourceId: string;
  sourceName: string;
  status: SourceConnectionStatus;
  statusMessage: string;
  latencyMs?: number;
  testedAt: string;
  details?: Record<string, unknown>;
}

export interface SourceAdapter {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly method: IntegrationMethod;
  readonly description: string;
  readonly requiredEnvVars: string[];

  /**
   * Evaluates current configuration and connection status.
   */
  getStatus(): Promise<{
    status: SourceConnectionStatus;
    statusMessage: string;
    lastTestedAt?: string;
  }>;

  /**
   * Performs an actual live connection test to verify credentials and responsiveness.
   */
  testConnection(): Promise<SourceTestResult>;

  /**
   * Executes live buyer-demand discovery for this specific source.
   */
  discover(input: SourceDiscoveryInput): Promise<RawCandidate[]>;

  /**
   * Returns step-by-step setup and compliance instructions.
   */
  getSetupGuide(): SourceSetupGuide;

  /**
   * Optional generator for permitted, compliant direct search deep-links.
   */
  generateCompliantSearchUrl?(input: {
    service: string;
    problem: string;
    location?: string;
  }): string;
}
