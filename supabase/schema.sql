-- ============================================================
-- OBYON Hunt — Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor:
-- https://app.supabase.com/project/_/sql
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- 1. Search Runs Table
-- ------------------------------------------------------------
create table if not exists public.search_runs (
  id uuid primary key default uuid_generate_v4(),
  service_category text not null,
  problem text not null,
  location text not null default '',
  freshness text not null default '7d',
  min_intent_score integer not null default 50,
  queries jsonb not null default '[]'::jsonb,
  scanned_count integer not null default 0,
  buyer_count integer not null default 0,
  seller_count integer not null default 0,
  general_count integer not null default 0,
  unknown_count integer not null default 0,
  rejected_count integer not null default 0,
  saved_count integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index on search run creation date
create index if not exists idx_search_runs_created_at on public.search_runs (created_at desc);

-- ------------------------------------------------------------
-- 2. Opportunities Table
-- ------------------------------------------------------------
create table if not exists public.opportunities (
  id text primary key,
  search_run_id uuid references public.search_runs(id) on delete set null,
  source_id text not null default '',
  source_name text not null,
  source_type text not null default 'web',
  source_url text not null unique,
  source_title text not null default '',
  source_platform text not null default '',
  author_name text not null default '',
  author_handle text,
  company_name text,
  location text,
  avatar_url text,
  title text not null,
  content text not null,
  evidence text not null default '',
  published_at timestamp with time zone default timezone('utc'::text, now()) not null,
  discovered_at timestamp with time zone default timezone('utc'::text, now()) not null,
  detected_need text not null,
  detected_problem text not null,
  detected_requirement text not null default '',
  buyer_classification text not null default 'BUYER',
  matched_services jsonb not null default '[]'::jsonb,
  primary_service text not null,
  intent_score integer not null check (intent_score between 0 and 100),
  urgency_score integer not null check (urgency_score between 0 and 100),
  confidence_score integer not null check (confidence_score between 0 and 100),
  intent_strength text not null default 'explicit',
  urgency text not null default 'medium',
  budget_signal text not null default 'no_signal',
  reasoning text not null default '',
  suggested_outreach text not null default '',
  tags jsonb not null default '[]'::jsonb,
  status text not null default 'NEW',
  is_bookmarked boolean not null default false,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance & pipeline queries
create index if not exists idx_opportunities_source_url on public.opportunities (source_url);
create index if not exists idx_opportunities_intent_score on public.opportunities (intent_score desc);
create index if not exists idx_opportunities_status on public.opportunities (status);
create index if not exists idx_opportunities_primary_service on public.opportunities (primary_service);
create index if not exists idx_opportunities_discovered_at on public.opportunities (discovered_at desc);

-- ------------------------------------------------------------
-- Row Level Security (RLS) policies
-- ------------------------------------------------------------
alter table public.search_runs enable row level security;
alter table public.opportunities enable row level security;

-- Allow public anon read/write (for single-tenant / prototype mode)
create policy "Allow all read access to search_runs" on public.search_runs for select using (true);
create policy "Allow all insert access to search_runs" on public.search_runs for insert with check (true);
create policy "Allow all update access to search_runs" on public.search_runs for update using (true);

create policy "Allow all read access to opportunities" on public.opportunities for select using (true);
create policy "Allow all insert access to opportunities" on public.opportunities for insert with check (true);
create policy "Allow all update access to opportunities" on public.opportunities for update using (true);
create policy "Allow all delete access to opportunities" on public.opportunities for delete using (true);
