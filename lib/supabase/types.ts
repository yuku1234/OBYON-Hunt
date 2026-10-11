// ============================================================
// Supabase Database Type Definitions
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      search_runs: {
        Row: {
          id: string;
          service_category: string;
          problem: string;
          location: string;
          freshness: string;
          min_intent_score: number;
          queries: Json;
          scanned_count: number;
          buyer_count: number;
          seller_count: number;
          general_count: number;
          unknown_count: number;
          rejected_count: number;
          saved_count: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["search_runs"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["search_runs"]["Row"]>;
      };
      opportunities: {
        Row: {
          id: string;
          search_run_id: string | null;
          source_id: string;
          source_name: string;
          source_type: string;
          source_url: string;
          source_title: string;
          source_platform: string;
          author_name: string;
          author_handle: string | null;
          company_name: string | null;
          location: string | null;
          avatar_url: string | null;
          title: string;
          content: string;
          evidence: string;
          published_at: string;
          discovered_at: string;
          detected_need: string;
          detected_problem: string;
          detected_requirement: string;
          buyer_classification: string;
          matched_services: Json;
          primary_service: string;
          intent_score: number;
          urgency_score: number;
          confidence_score: number;
          intent_strength: string;
          urgency: string;
          budget_signal: string;
          reasoning: string;
          suggested_outreach: string;
          tags: Json;
          status: string;
          is_bookmarked: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["opportunities"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["opportunities"]["Row"]>;
      };
      sources: {
        Row: {
          id: string;
          name: string;
          type: string;
          url: string;
          is_active: boolean;
          last_scraped_at: string | null;
          total_opportunities_found: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["sources"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["sources"]["Insert"]>;
      };
    };
  };
}
