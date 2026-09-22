// ============================================================
// Supabase Client
// ============================================================
// Credentials are loaded from environment variables ONLY.
// Never hardcode Supabase keys in source code.
//
// Phase 1: Client is instantiated but not connected (no real DB).
// Phase 2: Enable real queries by setting env vars in .env.local
// ============================================================

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Returns true if Supabase is configured via environment variables.
 * Use this to guard against unconfigured DB calls in Phase 1.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/**
 * Browser-side Supabase client (anon key — safe to expose).
 * Lazy-initialised so Phase 1 won't crash if env vars are missing.
 */
let _client: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file."
    );
  }

  if (!_client) {
    _client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return _client;
}

/**
 * Server-side Supabase client (service role key — never expose to browser).
 * Used in API routes and server components only.
 * TODO Phase 2: Add service role support
 */
export function getSupabaseServiceClient(): SupabaseClient<Database> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      "Server Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY to your .env.local file."
    );
  }

  return createClient<Database>(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
