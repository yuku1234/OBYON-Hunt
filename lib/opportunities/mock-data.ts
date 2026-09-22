import type { Opportunity, ActivityEvent, DashboardStats, Source } from "@/types";

// ============================================================
// Mock Opportunities — 7 realistic signals across intent levels
// ============================================================

export const mockOpportunities: Opportunity[] = [
  // 1. EXPLICIT BUYING INTENT — AI Customer Support Agent
  {
    id: "opp-001",
    sourceId: "src-001",
    sourceName: "LinkedIn",
    sourceType: "linkedin",
    sourceUrl:
      "https://linkedin.com/posts/techstartupfounder_ai-customersupport-automation-activity-123456",
    authorName: "Marcus Chen",
    authorHandle: "marcuschen_cto",
    companyName: "NexaRetail",
    location: "Singapore",
    avatarUrl: null,
    title: "We're actively searching for an AI customer support agent",
    content:
      "Our support team is drowning in 4,000+ tickets/month. I've been evaluating AI solutions for 3 months. We need a custom AI agent that integrates with our Zendesk + Shopify stack, handles returns/refunds autonomously, escalates edge cases, and responds in English and Mandarin. Budget is confirmed and we want to move by end of Q4. DM me if your team has done this before.",
    publishedAt: "2026-09-19T08:30:00Z",
    discoveredAt: "2026-09-19T09:15:00Z",
    detectedNeed: "Custom AI customer support agent with Zendesk & Shopify integration",
    detectedProblem:
      "Support team overwhelmed by 4,000+ monthly tickets, unable to scale manually",
    detectedRequirement:
      "Multilingual AI agent (EN + Mandarin), autonomous returns/refunds handling, escalation logic",
    matchedServices: ["ai_agents", "ai_chatbots", "ai_integrations"],
    primaryService: "ai_agents",
    intentScore: 94,
    urgencyScore: 88,
    confidenceScore: 97,
    intentStrength: "explicit",
    urgency: "high",
    budgetSignal: "confirmed_budget",
    reasoning:
      "Author explicitly states confirmed budget, defined technical requirements (Zendesk + Shopify), multilingual spec, and a clear Q4 deadline. This is a procurement-ready signal. CTO-level poster increases decision-making authority.",
    suggestedOutreach:
      "Hi Marcus, I saw your post about the AI support agent for NexaRetail — the Zendesk + Shopify integration challenge is exactly what our team has solved for e-commerce brands at scale. We've built multilingual AI agents that handle 70–80% of tickets autonomously. Would a 20-min call this week make sense?",
    tags: ["ai-agent", "zendesk", "shopify", "multilingual", "ecommerce", "q4-budget"],
    status: "new",
    isBookmarked: false,
    notes: null,
  },

  // 2. EXPLICIT BUYING INTENT — SaaS Development
  {
    id: "opp-002",
    sourceId: "src-002",
    sourceName: "Twitter / X",
    sourceType: "twitter",
    sourceUrl: "https://x.com/sarahjones_founder/status/1234567890",
    authorName: "Sarah Jones",
    authorHandle: "@sarahjones_founder",
    companyName: "FitTrackr",
    location: "Austin, TX",
    avatarUrl: null,
    title: "Looking for a dev team to build our SaaS MVP",
    content:
      "We've raised a pre-seed round and need to build our fitness tracking SaaS MVP fast. We have Figma designs ready. Looking for a team that has done SaaS before — preferably with Next.js + Supabase. Timeline: 8 weeks. Budget: ~$25k. Responding to serious devs only. DMs open.",
    publishedAt: "2026-09-18T14:20:00Z",
    discoveredAt: "2026-09-18T15:00:00Z",
    detectedNeed: "SaaS MVP development team with Next.js and Supabase experience",
    detectedProblem: "Pre-seed startup needs rapid MVP build to demonstrate product to investors",
    detectedRequirement:
      "Full-stack SaaS development, Next.js + Supabase stack, 8-week delivery, Figma-to-code",
    matchedServices: ["saas_development", "web_development", "ui_ux"],
    primaryService: "saas_development",
    intentScore: 90,
    urgencyScore: 92,
    confidenceScore: 93,
    intentStrength: "explicit",
    urgency: "critical",
    budgetSignal: "confirmed_budget",
    reasoning:
      "Post-funding founder with Figma designs ready, exact budget stated ($25k), specific tech stack, and hard timeline. High purchase intent with all decision signals present. Responds to DMs which means active outreach expected.",
    suggestedOutreach:
      "Hi Sarah, your FitTrackr MVP search caught my eye — Next.js + Supabase is our primary stack, and we've delivered SaaS products in 6–10 weeks for pre-seed founders. We can start immediately. Would you be open to a quick call to see if we're a fit?",
    tags: ["saas", "mvp", "nextjs", "supabase", "funded-startup", "8-weeks"],
    status: "new",
    isBookmarked: true,
    notes: null,
  },

  // 3. EXPLICIT BUYING INTENT — Video Editor
  {
    id: "opp-003",
    sourceId: "src-003",
    sourceName: "Twitter / X",
    sourceType: "twitter",
    sourceUrl: "https://x.com/alexcreates_/status/9876543210",
    authorName: "Alex Okonkwo",
    authorHandle: "@alexcreates_",
    companyName: null,
    location: "London, UK",
    avatarUrl: null,
    title: "Need a reliable video editor for long-term collaboration",
    content:
      "I post 3 YouTube videos/week and I'm finally at a point where editing is bottlenecking my growth. Looking for an editor who understands storytelling, can match my existing style, and deliver within 48 hrs. 100k+ subs. Budget: $500–800/video. Long-term partnership preferred. Portfolio required.",
    publishedAt: "2026-09-17T11:00:00Z",
    discoveredAt: "2026-09-17T12:30:00Z",
    detectedNeed: "Professional YouTube video editor for high-volume content production",
    detectedProblem: "Editing bottleneck preventing content creator from scaling output",
    detectedRequirement:
      "Style-matched editing, 48-hour turnaround, 3 videos/week, storytelling-focused",
    matchedServices: ["video_editing"],
    primaryService: "video_editing",
    intentScore: 82,
    urgencyScore: 75,
    confidenceScore: 88,
    intentStrength: "explicit",
    urgency: "high",
    budgetSignal: "confirmed_budget",
    reasoning:
      "Creator explicitly states budget range ($500–800/video), turnaround requirement (48hrs), volume (3/week), and is seeking long-term collaboration. Growth bottleneck creates urgency. 100k subs signals revenue capacity to pay.",
    suggestedOutreach:
      "Hey Alex, your video editor search stood out — we work with YouTube creators at your growth stage and specialise in style-matched editing that feels native to the creator's voice. We can meet the 48hr turnaround. Open to sending a quick test edit from one of your recent videos?",
    tags: ["youtube", "video-editing", "content-creator", "long-term", "48hr-turnaround"],
    status: "reviewing",
    isBookmarked: false,
    notes: "Check portfolio alignment before reaching out",
  },

  // 4. EXPLICIT / IMPLICIT MIX — WhatsApp Automation
  {
    id: "opp-004",
    sourceId: "src-004",
    sourceName: "Reddit",
    sourceType: "reddit",
    sourceUrl: "https://reddit.com/r/smallbusiness/comments/abc123",
    authorName: "u/retail_boss_india",
    authorHandle: "retail_boss_india",
    companyName: null,
    location: "Mumbai, India",
    avatarUrl: null,
    title: "WhatsApp is killing us — need to automate order confirmations",
    content:
      "We run a clothing retail business and get 200+ WhatsApp messages a day for order confirmations, stock checks, and delivery updates. My staff spends 5–6 hours daily just on WhatsApp replies. I've seen businesses use bots for this. Is there a service that can set this up? We use Shopify. Happy to pay monthly if it saves us time.",
    publishedAt: "2026-09-16T07:45:00Z",
    discoveredAt: "2026-09-16T09:00:00Z",
    detectedNeed: "WhatsApp Business API automation for order management",
    detectedProblem:
      "Staff spending 5–6 hours/day manually responding to 200+ WhatsApp messages",
    detectedRequirement:
      "Automated order confirmations, stock checks, delivery updates via WhatsApp + Shopify integration",
    matchedServices: ["whatsapp_automation", "ai_chatbots", "ai_integrations"],
    primaryService: "whatsapp_automation",
    intentScore: 76,
    urgencyScore: 80,
    confidenceScore: 79,
    intentStrength: "implicit",
    urgency: "high",
    budgetSignal: "implied_budget",
    reasoning:
      "Clear operational pain (5–6 hrs/day) and volume (200+ msgs). Says 'happy to pay monthly' which signals readiness to purchase. Shopify integration is a known stack. Lower score because budget is informal and no clear timeline.",
    suggestedOutreach:
      "Hey, saw your post about WhatsApp automation for your clothing store — this is exactly what we build. We've connected WhatsApp Business API to Shopify for retail businesses and can automate order confirmations, stock replies, and delivery updates. Would a quick demo be helpful?",
    tags: ["whatsapp", "shopify", "retail", "automation", "india", "sme"],
    status: "new",
    isBookmarked: false,
    notes: null,
  },

  // 5. IMPLICIT PROBLEM SIGNAL — Data Automation
  {
    id: "opp-005",
    sourceId: "src-005",
    sourceName: "LinkedIn",
    sourceType: "linkedin",
    sourceUrl: "https://linkedin.com/posts/ops-director-sanjay_spreadsheets-data-activity-789",
    authorName: "Sanjay Mehta",
    authorHandle: "sanjaymehta_ops",
    companyName: "LogiFlow Systems",
    location: "Bangalore, India",
    avatarUrl: null,
    title: "We manually copy 3,000 rows of data between systems every Monday",
    content:
      "Every Monday morning my team spends 3 hours copying data from our logistics provider's CSV exports into our internal ERP. We've been doing this for 2 years. I know there has to be a better way but we don't have an IT team in-house. Is this something software can solve? Genuinely asking — not sure where to start.",
    publishedAt: "2026-09-15T06:00:00Z",
    discoveredAt: "2026-09-15T08:45:00Z",
    detectedNeed: "Automated data pipeline between logistics CSV exports and internal ERP",
    detectedProblem:
      "Manual weekly data entry consuming 3 hours of team time for 2+ years — no in-house IT",
    detectedRequirement:
      "Automated CSV-to-ERP integration, recurring data sync, possibly API or ETL solution",
    matchedServices: ["data_automation", "api_integrations", "ai_integrations"],
    primaryService: "data_automation",
    intentScore: 61,
    urgencyScore: 55,
    confidenceScore: 72,
    intentStrength: "implicit",
    urgency: "medium",
    budgetSignal: "no_signal",
    reasoning:
      "Clear operational problem but no purchase intent expressed — asking if software can solve it suggests early awareness stage. No budget mentioned. However, 2-year duration of pain and ops director level suggests latent urgency. Education-first outreach recommended.",
    suggestedOutreach:
      "Hi Sanjay, your post about the Monday CSV-to-ERP copy caught my eye — yes, this is 100% solvable with automation. We've built similar pipelines that eliminate this kind of manual work entirely. Would it help if I shared how other logistics ops teams have tackled this? Happy to do a free 15-min consult.",
    tags: ["data-automation", "erp", "csv", "logistics", "manual-process", "no-it-team"],
    status: "new",
    isBookmarked: false,
    notes: null,
  },

  // 6. EXPLICIT BUYING INTENT — SaaS Development Team
  {
    id: "opp-006",
    sourceId: "src-006",
    sourceName: "Hacker News",
    sourceType: "hackernews",
    sourceUrl: "https://news.ycombinator.com/item?id=99887766",
    authorName: "pvelasquez_founder",
    authorHandle: "pvelasquez_founder",
    companyName: "Recur.io",
    location: "Remote / Barcelona",
    avatarUrl: null,
    title: "Hiring dev team for B2B SaaS — subscription analytics platform",
    content:
      "We're building a subscription analytics and revenue intelligence platform (think Baremetrics but for mid-market). Looking for a product-focused dev team who can co-own the architecture. We have $180k reserved for development phase. Tech: Node.js backend, React frontend, PostgreSQL. We've already done customer discovery with 40 companies. Ready to start next month.",
    publishedAt: "2026-09-14T19:00:00Z",
    discoveredAt: "2026-09-14T20:00:00Z",
    detectedNeed: "Full product development team for B2B subscription analytics SaaS",
    detectedProblem:
      "Validated B2B concept needs technical execution — founders lack internal engineering capacity",
    detectedRequirement:
      "Co-owning architecture, Node.js + React + PostgreSQL stack, revenue analytics domain",
    matchedServices: ["saas_development", "web_development", "api_integrations"],
    primaryService: "saas_development",
    intentScore: 88,
    urgencyScore: 85,
    confidenceScore: 91,
    intentStrength: "explicit",
    urgency: "high",
    budgetSignal: "confirmed_budget",
    reasoning:
      "High-quality signal: $180k reserved budget, defined tech stack, validated market (40 customer discovery interviews), clear start date (next month). Hacker News audience suggests technical sophistication — proposal quality matters more than pitch volume.",
    suggestedOutreach:
      "Hi Pablo, the Recur.io build caught my attention — we've shipped B2B SaaS products in the analytics space and are comfortable owning architecture decisions, not just executing tickets. Our stack aligns exactly (Node.js/React/PostgreSQL). Could we set up a technical call to explore fit?",
    tags: ["saas", "b2b", "subscription-analytics", "nodejs", "react", "funded", "barcelona"],
    status: "new",
    isBookmarked: true,
    notes: null,
  },

  // 7. WEAK / GENERAL INTEREST — Website Redesign
  {
    id: "opp-007",
    sourceId: "src-007",
    sourceName: "Reddit",
    sourceType: "reddit",
    sourceUrl: "https://reddit.com/r/web_design/comments/xyz789",
    authorName: "u/bakery_owner_toronto",
    authorHandle: "bakery_owner_toronto",
    companyName: "Sweet Crumbs Bakery",
    location: "Toronto, Canada",
    avatarUrl: null,
    title: "Our website looks outdated — thinking about a redesign",
    content:
      "My bakery website was made in 2018 and honestly it's embarrassing. We've been meaning to update it. Wondering if anyone has tips on how to approach this. We're a small family business so cost matters. Looking for ideas.",
    publishedAt: "2026-09-13T15:30:00Z",
    discoveredAt: "2026-09-13T17:00:00Z",
    detectedNeed: "Website redesign for small local bakery",
    detectedProblem: "Outdated 2018 website creating poor first impressions",
    detectedRequirement: "Modern redesign, cost-sensitive, small business context",
    matchedServices: ["web_development", "ui_ux"],
    primaryService: "web_development",
    intentScore: 45,
    urgencyScore: 30,
    confidenceScore: 55,
    intentStrength: "weak",
    urgency: "low",
    budgetSignal: "budget_concern",
    reasoning:
      "Vague interest with no timeline, no budget (explicitly mentions cost concerns), and asking for 'tips' rather than vendors. Small family business reduces deal size. Signal is early awareness — engagement may still be worthwhile as a low-cost nurture play.",
    suggestedOutreach:
      "Hey, saw your post about updating the Sweet Crumbs website! A modern redesign can make a big difference for a local bakery. We work with small businesses and have affordable packages specifically for this. Happy to share some examples — no pressure at all.",
    tags: ["website", "redesign", "small-business", "bakery", "toronto", "budget-conscious"],
    status: "new",
    isBookmarked: false,
    notes: null,
  },
];

// ============================================================
// Mock Dashboard Stats
// ============================================================

export const mockDashboardStats: DashboardStats = {
  totalOpportunities: 7,
  highIntentOpportunities: 4,
  newThisWeek: 6,
  averageIntentScore: 77,
  byService: [
    { service: "ai_agents", name: "AI Agents", count: 1, color: "#6366f1" },
    { service: "saas_development", name: "SaaS Development", count: 2, color: "#8b5cf6" },
    { service: "whatsapp_automation", name: "WhatsApp Automation", count: 1, color: "#10b981" },
    { service: "video_editing", name: "Video Editing", count: 1, color: "#f59e0b" },
    { service: "data_automation", name: "Data Automation", count: 1, color: "#3b82f6" },
    { service: "web_development", name: "Web Development", count: 1, color: "#ec4899" },
  ],
  byStatus: [
    { status: "new", count: 5 },
    { status: "reviewing", count: 1 },
    { status: "contacted", count: 1 },
    { status: "qualified", count: 0 },
    { status: "converted", count: 0 },
  ],
};

// ============================================================
// Mock Activity Feed
// ============================================================

export const mockActivityFeed: ActivityEvent[] = [
  {
    id: "act-001",
    type: "opportunity_discovered",
    opportunityId: "opp-001",
    opportunityTitle: "We're actively searching for an AI customer support agent",
    description: "New high-intent opportunity discovered on LinkedIn",
    timestamp: "2026-09-19T09:15:00Z",
  },
  {
    id: "act-002",
    type: "opportunity_discovered",
    opportunityId: "opp-002",
    opportunityTitle: "Looking for a dev team to build our SaaS MVP",
    description: "New opportunity discovered on Twitter / X",
    timestamp: "2026-09-18T15:00:00Z",
  },
  {
    id: "act-003",
    type: "analysis_completed",
    opportunityId: "opp-003",
    opportunityTitle: "Need a reliable video editor for long-term collaboration",
    description: "AI analysis completed — Intent Score: 82",
    timestamp: "2026-09-17T12:30:00Z",
  },
  {
    id: "act-004",
    type: "source_synced",
    opportunityId: null,
    opportunityTitle: null,
    description: "Reddit source synced — 3 new signals detected",
    timestamp: "2026-09-16T09:00:00Z",
  },
  {
    id: "act-005",
    type: "opportunity_discovered",
    opportunityId: "opp-005",
    opportunityTitle: "We manually copy 3,000 rows of data every Monday",
    description: "Implicit problem signal detected on LinkedIn",
    timestamp: "2026-09-15T08:45:00Z",
  },
  {
    id: "act-006",
    type: "opportunity_discovered",
    opportunityId: "opp-006",
    opportunityTitle: "Hiring dev team for B2B SaaS — subscription analytics platform",
    description: "New high-intent opportunity discovered on Hacker News",
    timestamp: "2026-09-14T20:00:00Z",
  },
];

// ============================================================
// Mock Sources
// ============================================================

export const mockSources: Source[] = [
  {
    id: "src-001",
    name: "LinkedIn",
    type: "linkedin",
    url: "https://linkedin.com",
    isActive: true,
    lastScrapedAt: "2026-09-19T09:00:00Z",
    totalOpportunitiesFound: 2,
    createdAt: "2026-09-01T00:00:00Z",
  },
  {
    id: "src-002",
    name: "Twitter / X",
    type: "twitter",
    url: "https://x.com",
    isActive: true,
    lastScrapedAt: "2026-09-18T15:00:00Z",
    totalOpportunitiesFound: 1,
    createdAt: "2026-09-01T00:00:00Z",
  },
  {
    id: "src-003",
    name: "Reddit",
    type: "reddit",
    url: "https://reddit.com",
    isActive: true,
    lastScrapedAt: "2026-09-16T09:00:00Z",
    totalOpportunitiesFound: 2,
    createdAt: "2026-09-01T00:00:00Z",
  },
  {
    id: "src-004",
    name: "Hacker News",
    type: "hackernews",
    url: "https://news.ycombinator.com",
    isActive: true,
    lastScrapedAt: "2026-09-14T20:00:00Z",
    totalOpportunitiesFound: 1,
    createdAt: "2026-09-01T00:00:00Z",
  },
  {
    id: "src-005",
    name: "Upwork",
    type: "upwork",
    url: "https://upwork.com",
    isActive: false,
    lastScrapedAt: null,
    totalOpportunitiesFound: 0,
    createdAt: "2026-09-01T00:00:00Z",
  },
];
