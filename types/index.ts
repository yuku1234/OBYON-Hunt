// ============================================================
// OBYON Signal — Core TypeScript Interfaces
// ============================================================

// ----------------------------------------------------------
// Enums / Literal Unions
// ----------------------------------------------------------

export type BuyerClassification = "BUYER" | "SELLER" | "GENERAL" | "UNKNOWN";

export type LeadStatus =
  | "NEW"
  | "QUALIFIED"
  | "CONTACTED"
  | "REPLIED"
  | "MEETING"
  | "WON"
  | "LOST";

export type OpportunityStatus =
  | LeadStatus
  | "new"
  | "reviewing"
  | "contacted"
  | "qualified"
  | "disqualified"
  | "converted";

export type FreshnessFilter = "24h" | "3d" | "7d" | "30d";

export type UrgencyLevel = "critical" | "high" | "medium" | "low";

export type BudgetSignal =
  | "confirmed_budget"
  | "implied_budget"
  | "no_signal"
  | "budget_concern";

export type IntentStrength = "explicit" | "implicit" | "weak";

export type SourceType =
  | "twitter"
  | "linkedin"
  | "reddit"
  | "facebook"
  | "upwork"
  | "fiverr"
  | "producthunt"
  | "hackernews"
  | "github"
  | "quora"
  | "youtube"
  | "web"
  | "other";

export type ServiceCategory =
  | "ai_automation"
  | "ai_agents"
  | "ai_chatbots"
  | "ai_integrations"
  | "saas_development"
  | "web_development"
  | "mobile_development"
  | "custom_software"
  | "video_editing"
  | "ai_video"
  | "marketing_automation"
  | "whatsapp_automation"
  | "crm_automation"
  | "data_automation"
  | "ui_ux"
  | "cloud_devops"
  | "api_integrations"
  | "other";

// ----------------------------------------------------------
// Source
// ----------------------------------------------------------

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  url: string;
  isActive: boolean;
  lastScrapedAt: string | null;
  totalOpportunitiesFound: number;
  createdAt: string;
}

// ----------------------------------------------------------
// Service
// ----------------------------------------------------------

export interface Service {
  id: string;
  category: ServiceCategory;
  name: string;
  description: string;
  icon: string;
  keywords: string[];
  opportunityCount: number;
}

// ----------------------------------------------------------
// Opportunity
// ----------------------------------------------------------

export interface Opportunity {
  id: string;

  // Source information
  sourceId: string;
  sourceName: string;
  sourceType: SourceType;
  sourceUrl: string;
  sourceTitle?: string;
  sourcePlatform?: string;

  // Author / Company
  authorName: string;
  authorHandle: string | null;
  companyName: string | null;
  location: string | null;
  avatarUrl: string | null;

  // Content
  title: string;
  content: string;
  evidence?: string;
  publishedAt: string;
  discoveredAt: string;

  // AI-detected signals & Classification
  detectedNeed: string;
  detectedProblem: string;
  detectedRequirement: string;
  buyerClassification?: BuyerClassification;

  // OBYON matching
  matchedServices: ServiceCategory[];
  primaryService: ServiceCategory;

  // Scoring
  intentScore: number; // 0–100
  urgencyScore: number; // 0–100
  confidenceScore: number; // 0–100
  intentStrength: IntentStrength;
  urgency: UrgencyLevel;
  budgetSignal: BudgetSignal;

  // AI Analysis
  reasoning: string;
  suggestedOutreach: string;
  tags: string[];

  // Workflow & Pipeline
  status: OpportunityStatus;
  isBookmarked: boolean;
  notes: string | null;
  searchRunId?: string;
}

// ----------------------------------------------------------
// Search Run (Discovery audit trace)
// ----------------------------------------------------------

export interface SearchRun {
  id: string;
  serviceCategory: string;
  problem: string;
  location: string;
  freshness: FreshnessFilter;
  minIntentScore: number;
  queries: string[];
  scannedCount: number;
  buyerCount: number;
  sellerCount: number;
  generalCount: number;
  unknownCount: number;
  rejectedCount: number;
  savedCount: number;
  createdAt: string;
}

// ----------------------------------------------------------
// Intent Analysis (AI output shape)
// ----------------------------------------------------------

export interface IntentAnalysis {
  opportunityId: string;
  provider: "gemini" | "groq" | "openai" | "mock";
  analyzedAt: string;

  detectedNeed: string;
  detectedProblem: string;
  detectedRequirement: string;
  matchedServices: ServiceCategory[];
  primaryService: ServiceCategory;

  intentScore: number;
  urgencyScore: number;
  confidenceScore: number;
  intentStrength: IntentStrength;
  urgency: UrgencyLevel;
  budgetSignal: BudgetSignal;

  reasoning: string;
  suggestedOutreach: string;
  tags: string[];

  rawResponse: Record<string, unknown> | null;
}

// ----------------------------------------------------------
// Search / Discovery Input & Output
// ----------------------------------------------------------

export interface SearchQuery {
  query: string;
  serviceCategory: ServiceCategory | "all";
  problemDescription?: string;
  location: string;
  sourceType: SourceType | "all";
  freshness?: FreshnessFilter;
  dateFrom: string | null;
  dateTo: string | null;
  minIntentScore: number;
  maxResults: number;
}

export interface SearchResult {
  query: SearchQuery;
  opportunities: Opportunity[];
  totalFound: number;
  searchedAt: string;
  executionTimeMs: number;
  searchRunId?: string;
  queriesUsed?: string[];
  scannedCount?: number;
  buyerCount?: number;
  rejectedCount?: number;
  savedCount?: number;
}

// ----------------------------------------------------------
// Outreach
// ----------------------------------------------------------

export interface OutreachDraft {
  id: string;
  opportunityId: string;
  platform: string;
  subject: string | null;
  body: string;
  tone: "professional" | "casual" | "direct";
  generatedAt: string;
  isApproved: boolean;
}

// ----------------------------------------------------------
// Dashboard / Overview
// ----------------------------------------------------------

export interface DashboardStats {
  totalOpportunities: number;
  highIntentOpportunities: number;
  newThisWeek: number;
  averageIntentScore: number;
  byService: Array<{
    service: ServiceCategory;
    name: string;
    count: number;
    color: string;
  }>;
  byStatus: Array<{
    status: OpportunityStatus;
    count: number;
  }>;
}

export interface ActivityEvent {
  id: string;
  type:
    | "opportunity_discovered"
    | "opportunity_contacted"
    | "opportunity_qualified"
    | "source_synced"
    | "analysis_completed";
  opportunityId: string | null;
  opportunityTitle: string | null;
  description: string;
  timestamp: string;
}
