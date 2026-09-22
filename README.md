# OBYON Signal

> **"Turn online demand into opportunities."**

AI-powered opportunity discovery platform for OBYON — detecting buying intent signals across public platforms and matching them to OBYON's service capabilities.

---

## What is OBYON Signal?

OBYON Signal scans public online platforms (LinkedIn, Twitter, Reddit, Hacker News, etc.) for people and businesses that are publicly expressing a genuine need for services OBYON provides. It analyses these signals with AI, scores them by purchase intent, and surfaces them as actionable leads.

This is **not a generic CRM** or a contact scraper. The core intelligence is **buying-intent detection**.

---

## Phase 1 — Foundation

This repository contains the **Phase 1 foundation**: a clean, scalable application scaffold. No live scraping, authentication, or payments are included in this phase.

### What's included

| Area | Status |
|---|---|
| Next.js 16 App Router | ✅ Done |
| TypeScript (strict) | ✅ Done |
| Tailwind CSS v4 | ✅ Done |
| Dark-first design system | ✅ Done |
| Sidebar + TopNav layout | ✅ Done |
| Overview dashboard | ✅ Done |
| Discover search UI | ✅ Done |
| Opportunities list (card + table) | ✅ Done |
| Opportunity detail view | ✅ Done |
| Services catalogue | ✅ Done |
| Sources management | ✅ Done |
| Saved opportunities | ✅ Done |
| Settings page | ✅ Done |
| Mock data (7 realistic opportunities) | ✅ Done |
| TypeScript interfaces | ✅ Done |
| AI provider abstraction layer | ✅ Done |
| Supabase client stub | ✅ Done |
| Search service stub | ✅ Done |
| Opportunity service stub | ✅ Done |
| `.env.example` | ✅ Done |
| GitHub-ready `.gitignore` | ✅ Done |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| UI Primitives | Radix UI |
| Database (stub) | Supabase / PostgreSQL |
| AI Layer (stub) | Abstract provider — Gemini / Groq ready |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd obyon-signal

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app redirects to `/overview` by default.

### Environment Variables

All configuration is via environment variables. See [`.env.example`](./.env.example) for the full list.

For Phase 1, no env vars are required — the app runs entirely on mock data.

For Phase 2, you will need:
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` for the database
- `GEMINI_API_KEY` or `GROQ_API_KEY` for AI analysis
- Set `AI_PROVIDER=gemini` or `AI_PROVIDER=groq` to switch providers

---

## Project Structure

```
obyon-signal/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (sidebar + topnav)
│   ├── page.tsx                  # Redirects to /overview
│   ├── overview/page.tsx         # Dashboard
│   ├── discover/page.tsx         # Search / discovery UI
│   ├── opportunities/
│   │   ├── page.tsx              # Opportunities list
│   │   └── [id]/page.tsx         # Opportunity detail
│   ├── services/page.tsx         # OBYON service catalogue
│   ├── sources/page.tsx          # Source management
│   ├── saved/page.tsx            # Saved/bookmarked opportunities
│   ├── settings/page.tsx         # Settings
│   └── not-found.tsx             # 404 page
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx          # Layout wrapper
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   └── TopNav.tsx            # Top navigation bar
│   ├── opportunities/
│   │   ├── OpportunityCard.tsx   # Card component
│   │   ├── OpportunityTable.tsx  # Table component
│   │   ├── IntentBadge.tsx       # Score badge + ring
│   │   └── UrgencyBadge.tsx      # Urgency badge
│   └── shared/
│       ├── PageHeader.tsx        # Reusable page title/header
│       ├── EmptyState.tsx        # Empty state component
│       └── LoadingSpinner.tsx    # Loading indicator
│
├── lib/
│   ├── ai/
│   │   └── index.ts              # AI provider abstraction
│   ├── opportunities/
│   │   ├── index.ts              # Opportunity service
│   │   └── mock-data.ts          # Mock data (7 opportunities)
│   ├── search/
│   │   └── index.ts              # Search service
│   ├── supabase/
│   │   ├── client.ts             # Supabase client
│   │   └── types.ts              # DB type definitions
│   └── utils.ts                  # Shared utilities
│
├── types/
│   └── index.ts                  # All TypeScript interfaces
│
├── .env.example                  # Environment variable template
├── .gitignore
└── README.md
```

---

## Data Model

Key TypeScript interfaces (see [`types/index.ts`](./types/index.ts)):

| Interface | Purpose |
|---|---|
| `Opportunity` | Full signal record with all scores and metadata |
| `Source` | Platform being monitored |
| `Service` | OBYON service category |
| `IntentAnalysis` | AI analysis output shape |
| `SearchQuery` | Discovery form state |
| `OutreachDraft` | Generated outreach message |
| `DashboardStats` | Overview page metrics |
| `ActivityEvent` | Activity feed entry |

---

## Architecture

### Service Boundaries

```
/lib/opportunities     — Opportunity CRUD (mock → Supabase in Phase 2)
/lib/search            — Discovery search (mock → vector search in Phase 2)
/lib/ai                — AI provider abstraction (mock → Gemini/Groq in Phase 2)
/lib/supabase          — Database client (env-configured, not connected in Phase 1)
```

### Future Data Flow (Phase 2+)

```
SOURCE (LinkedIn, Reddit, HN, Twitter)
  → DATA COLLECTION (scraping integrations)
  → NORMALIZATION (content cleaning + metadata extraction)
  → AI INTENT ANALYSIS (Gemini / Groq)
  → SERVICE MATCHING (embeddings + keyword matching)
  → OPPORTUNITY SCORE (intent + urgency + confidence)
  → DATABASE (Supabase / PostgreSQL)
  → DASHBOARD (OBYON Signal UI)
```

### AI Provider Abstraction

The `AIProvider` interface in `/lib/ai/index.ts` defines the contract:
- `analyzeIntent(content)` — analyse raw text for buying signals
- `matchServices(content)` — match content against OBYON services
- `generateOutreach(opportunity)` — draft personalised outreach

Switch providers by setting `AI_PROVIDER` in `.env.local`. No code changes required.

---

## Mock Data

7 realistic opportunities demonstrating the intent spectrum:

| # | Signal | Intent Level | Score |
|---|---|---|---|
| 1 | AI Customer Support Agent (LinkedIn) | Explicit | 94 |
| 2 | SaaS MVP Developer (Twitter) | Explicit | 90 |
| 3 | B2B SaaS Dev Team (Hacker News) | Explicit | 88 |
| 4 | Video Editor for Creator (Twitter) | Explicit | 82 |
| 5 | WhatsApp Automation (Reddit) | Implicit | 76 |
| 6 | Manual Data Entry Pain (LinkedIn) | Implicit | 61 |
| 7 | Website Redesign (Reddit) | Weak | 45 |

---

## Development Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build (verifies no TS errors)
npm run start        # Run production build
npm run lint         # ESLint
npx tsc --noEmit    # TypeScript check without building
```

---

## Roadmap

| Phase | Focus |
|---|---|
| **Phase 1** ✅ | Foundation — UI, types, architecture, mock data |
| **Phase 2** | Data collection — scraping integrations per source |
| **Phase 3** | AI analysis — live intent scoring with Gemini/Groq |
| **Phase 4** | Database — Supabase schema + real persistence |
| **Phase 5** | Authentication — team access + multi-user |
| **Phase 6** | Outreach — CRM integration + outreach automation |
| **Phase 7** | Alerts + notifications — real-time signal monitoring |

---

## Contributing

This is a private OBYON internal platform. For questions, reach the engineering team via the internal channel.

---

*Built by OBYON Engineering · Phase 1 Foundation · 2026*
