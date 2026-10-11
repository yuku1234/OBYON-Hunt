// ============================================================
// Database & Persistence Layer
// Supports Supabase PostgreSQL with resilient local storage.
// ============================================================

import fs from "fs";
import path from "path";
import { isSupabaseConfigured, getSupabaseClient } from "../supabase/client";
import type { Opportunity, SearchRun, LeadStatus } from "@/types";

const DATA_DIR = path.resolve(process.cwd(), ".data");
const STORAGE_FILE = path.join(DATA_DIR, "storage.json");

interface LocalStore {
  searchRuns: SearchRun[];
  opportunities: Opportunity[];
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readLocalStore(): LocalStore {
  ensureDataDir();
  if (!fs.existsSync(STORAGE_FILE)) {
    return { searchRuns: [], opportunities: [] };
  }
  try {
    const raw = fs.readFileSync(STORAGE_FILE, "utf-8");
    return JSON.parse(raw) as LocalStore;
  } catch (err) {
    console.error("[Database] Failed to read local storage file:", err);
    return { searchRuns: [], opportunities: [] };
  }
}

function writeLocalStore(store: LocalStore): void {
  ensureDataDir();
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("[Database] Failed to write local storage file:", err);
  }
}

export class DatabaseService {
  /**
   * Save a completed search run audit record.
   */
  async saveSearchRun(run: SearchRun): Promise<{ success: boolean; supabaseSaved: boolean; error?: string }> {
    // 1. Always save to local store
    const store = readLocalStore();
    store.searchRuns.unshift(run);
    writeLocalStore(store);

    let supabaseSaved = false;
    let error: string | undefined;

    // 2. If Supabase configured, save to Supabase
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        const { error: sbError } = await client.from("search_runs").insert({
          id: run.id,
          service_category: run.serviceCategory,
          problem: run.problem,
          location: run.location,
          freshness: run.freshness,
          min_intent_score: run.minIntentScore,
          queries: run.queries,
          scanned_count: run.scannedCount,
          buyer_count: run.buyerCount,
          seller_count: run.sellerCount,
          general_count: run.generalCount,
          unknown_count: run.unknownCount,
          rejected_count: run.rejectedCount,
          saved_count: run.savedCount,
          created_at: run.createdAt,
        } as never);

        if (sbError) {
          error = sbError.message;
          console.error("[Database] Supabase insert search_runs error:", sbError);
        } else {
          supabaseSaved = true;
        }
      } catch (err) {
        error = err instanceof Error ? err.message : String(err);
        console.error("[Database] Supabase search_runs exception:", error);
      }
    }

    return { success: true, supabaseSaved, error };
  }

  /**
   * Save verified opportunities. Deduplicates by source_url.
   */
  async saveOpportunities(
    opps: Opportunity[]
  ): Promise<{ savedCount: number; supabaseSaved: boolean; error?: string }> {
    if (!opps || opps.length === 0) {
      return { savedCount: 0, supabaseSaved: false };
    }

    // 1. Save to local store with URL deduplication
    const store = readLocalStore();
    let localSaved = 0;

    for (const opp of opps) {
      // Must have valid verifiable sourceUrl
      if (!opp.sourceUrl || !opp.sourceUrl.startsWith("http")) {
        continue;
      }

      const existingIndex = store.opportunities.findIndex(
        (o) => o.sourceUrl.toLowerCase().trim() === opp.sourceUrl.toLowerCase().trim()
      );

      if (existingIndex >= 0) {
        // Update existing record
        store.opportunities[existingIndex] = {
          ...store.opportunities[existingIndex],
          ...opp,
          id: store.opportunities[existingIndex].id, // preserve ID
        };
      } else {
        store.opportunities.unshift(opp);
        localSaved++;
      }
    }

    writeLocalStore(store);

    let supabaseSaved = false;
    let error: string | undefined;

    // 2. Save to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        const records = opps.map((opp) => ({
          id: opp.id,
          search_run_id: opp.searchRunId || null,
          source_id: opp.sourceId || "",
          source_name: opp.sourceName || "Web",
          source_type: opp.sourceType || "web",
          source_url: opp.sourceUrl,
          source_title: opp.sourceTitle || opp.title,
          source_platform: opp.sourcePlatform || "Web",
          author_name: opp.authorName || "Prospect",
          author_handle: opp.authorHandle,
          company_name: opp.companyName,
          location: opp.location,
          avatar_url: opp.avatarUrl,
          title: opp.title,
          content: opp.content,
          evidence: opp.evidence || opp.content,
          published_at: opp.publishedAt || new Date().toISOString(),
          discovered_at: opp.discoveredAt || new Date().toISOString(),
          detected_need: opp.detectedNeed,
          detected_problem: opp.detectedProblem,
          detected_requirement: opp.detectedRequirement || "",
          buyer_classification: opp.buyerClassification || "BUYER",
          matched_services: opp.matchedServices || [],
          primary_service: opp.primaryService,
          intent_score: opp.intentScore,
          urgency_score: opp.urgencyScore,
          confidence_score: opp.confidenceScore,
          intent_strength: opp.intentStrength || "explicit",
          urgency: opp.urgency || "medium",
          budget_signal: opp.budgetSignal || "no_signal",
          reasoning: opp.reasoning,
          suggested_outreach: opp.suggestedOutreach || "",
          tags: opp.tags || [],
          status: opp.status || "NEW",
          is_bookmarked: opp.isBookmarked || false,
          notes: opp.notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        const { error: sbError } = await client
          .from("opportunities")
          .upsert(records as never, { onConflict: "source_url" });

        if (sbError) {
          error = sbError.message;
          console.error("[Database] Supabase upsert opportunities error:", sbError);
        } else {
          supabaseSaved = true;
        }
      } catch (err) {
        error = err instanceof Error ? err.message : String(err);
        console.error("[Database] Supabase opportunities exception:", error);
      }
    }

    return { savedCount: localSaved, supabaseSaved, error };
  }

  /**
   * Get all verified opportunities.
   */
  async getOpportunities(): Promise<Opportunity[]> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        const { data, error } = await client
          .from("opportunities")
          .select("*")
          .order("discovered_at", { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((d: Record<string, unknown>) => ({
            id: String(d.id),
            sourceId: String(d.source_id || ""),
            sourceName: String(d.source_name || "Web"),
            sourceType: (d.source_type || "web") as Opportunity["sourceType"],
            sourceUrl: String(d.source_url),
            sourceTitle: String(d.source_title || d.title || ""),
            sourcePlatform: String(d.source_platform || "Web"),
            authorName: String(d.author_name || ""),
            authorHandle: (d.author_handle as string) || null,
            companyName: (d.company_name as string) || null,
            location: (d.location as string) || null,
            avatarUrl: (d.avatar_url as string) || null,
            title: String(d.title || ""),
            content: String(d.content || ""),
            evidence: String(d.evidence || d.content || ""),
            publishedAt: String(d.published_at || new Date().toISOString()),
            discoveredAt: String(d.discovered_at || new Date().toISOString()),
            detectedNeed: String(d.detected_need || ""),
            detectedProblem: String(d.detected_problem || ""),
            detectedRequirement: String(d.detected_requirement || ""),
            buyerClassification: (d.buyer_classification as Opportunity["buyerClassification"]) || "BUYER",
            matchedServices: (d.matched_services as Opportunity["matchedServices"]) || [],
            primaryService: String(d.primary_service || "") as Opportunity["primaryService"],
            intentScore: Number(d.intent_score || 50),
            urgencyScore: Number(d.urgency_score || 50),
            confidenceScore: Number(d.confidence_score || 50),
            intentStrength: (d.intent_strength as Opportunity["intentStrength"]) || "explicit",
            urgency: (d.urgency as Opportunity["urgency"]) || "medium",
            budgetSignal: (d.budget_signal as Opportunity["budgetSignal"]) || "no_signal",
            reasoning: String(d.reasoning || ""),
            suggestedOutreach: String(d.suggested_outreach || ""),
            tags: (d.tags as string[]) || [],
            status: (d.status as Opportunity["status"]) || "NEW",
            isBookmarked: Boolean(d.is_bookmarked),
            notes: (d.notes as string) || null,
            searchRunId: (d.search_run_id as string) || undefined,
          }));
        }
      } catch (err) {
        console.error("[Database] Failed to read from Supabase, reading local:", err);
      }
    }

    const store = readLocalStore();
    return store.opportunities;
  }

  /**
   * Get opportunity by ID.
   */
  async getOpportunityById(id: string): Promise<Opportunity | null> {
    const opps = await this.getOpportunities();
    return opps.find((o) => o.id === id) ?? null;
  }

  /**
   * Update lead status (e.g. NEW, QUALIFIED, CONTACTED, REPLIED, MEETING, WON, LOST).
   */
  async updateStatus(id: string, status: LeadStatus | string): Promise<boolean> {
    const store = readLocalStore();
    const index = store.opportunities.findIndex((o) => o.id === id);
    if (index >= 0) {
      store.opportunities[index].status = status as Opportunity["status"];
      writeLocalStore(store);
    }

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        await client
          .from("opportunities")
          .update({ status, updated_at: new Date().toISOString() } as never)
          .eq("id", id);
      } catch (err) {
        console.error("[Database] Failed to update status in Supabase:", err);
      }
    }

    return true;
  }

  /**
   * Update notes for an opportunity.
   */
  async updateNotes(id: string, notes: string): Promise<boolean> {
    const store = readLocalStore();
    const index = store.opportunities.findIndex((o) => o.id === id);
    if (index >= 0) {
      store.opportunities[index].notes = notes;
      writeLocalStore(store);
    }

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        await client
          .from("opportunities")
          .update({ notes, updated_at: new Date().toISOString() } as never)
          .eq("id", id);
      } catch (err) {
        console.error("[Database] Failed to update notes in Supabase:", err);
      }
    }

    return true;
  }

  /**
   * Get search runs.
   */
  async getSearchRuns(): Promise<SearchRun[]> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        const { data, error } = await client
          .from("search_runs")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          return data as unknown as SearchRun[];
        }
      } catch (err) {
        console.error("[Database] Failed to fetch search_runs from Supabase:", err);
      }
    }

    return readLocalStore().searchRuns;
  }
}

export const dbService = new DatabaseService();
