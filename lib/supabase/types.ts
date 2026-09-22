// ============================================================
// Supabase Database Type Definitions
// ============================================================
// TODO Phase 2: Auto-generate this file from Supabase schema
// using: npx supabase gen types typescript --local
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
      opportunities: {
        Row: {
          id: string;
          source_id: string;
          source_name: string;
          source_type: string;
          source_url: string;
          author_name: string;
          author_handle: string | null;
          company_name: string | null;
          location: string | null;
          avatar_url: string | null;
          title: string;
          content: string;
          published_at: string;
          discovered_at: string;
          detected_need: string;
          detected_problem: string;
          detected_requirement: string;
          matched_services: string[];
          primary_service: string;
          intent_score: number;
          urgency_score: number;
          confidence_score: number;
          intent_strength: string;
          urgency: string;
          budget_signal: string;
          reasoning: string;
          suggested_outreach: string;
          tags: string[];
          status: string;
          is_bookmarked: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["opportunities"]["Row"],
          "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["opportunities"]["Insert"]>;
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
        Insert: Omit<
          Database["public"]["Tables"]["sources"]["Row"],
          "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["sources"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
