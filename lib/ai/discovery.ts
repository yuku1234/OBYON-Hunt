// ============================================================
// Live Web Discovery Engine — Powered by @google/genai
// Uses Google Search Grounding for real public demand signals.
// Server-side only — GEMINI_API_KEY is never exposed to the client.
// ============================================================

import { GoogleGenAI } from "@google/genai";
import type {
  Opportunity,
  ServiceCategory,
  BuyerClassification,
  FreshnessFilter,
  UrgencyLevel,
  BudgetSignal,
} from "@/types";

export interface DiscoveryInput {
  service: string;
  problem: string;
  location?: string;
  freshness: FreshnessFilter;
  minIntentScore: number;
}

export interface DiscoveryMetrics {
  queriesGenerated: string[];
  scannedCount: number;
  buyerCount: number;
  sellerCount: number;
  generalCount: number;
  unknownCount: number;
  rejectedCount: number;
  savedCount: number;
  opportunities: Opportunity[];
}

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim().length === 0) {
    throw new Error(
      "GEMINI_API_KEY is not configured in .env.local. Please provide your Google Gemini API key."
    );
  }
  return key.trim();
}

async function generateWithRetry(
  ai: GoogleGenAI,
  params: {
    model: string;
    contents: string;
    config?: Record<string, unknown>;
  },
  retries = 3
) {
  let lastErr: unknown;
  for (let i = 1; i <= retries; i++) {
    try {
      return await ai.models.generateContent(params as never);
    } catch (err: unknown) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      if ((msg.includes("503") || msg.includes("demand") || msg.includes("UNAVAILABLE")) && i < retries) {
        await new Promise((r) => setTimeout(r, 2500));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

/**
 * Generate multiple targeted natural-language demand queries.
 * Emphasizes BUYING DEMAND over supply/agency advertisements.
 */
export async function generateDemandQueries(
  ai: GoogleGenAI,
  service: string,
  problem: string,
  location?: string
): Promise<string[]> {
  const prompt = `
You are a senior B2B sales intelligence specialist.
Generate 6 highly targeted Google Search queries to find REAL, ACTIVE BUYERS who are currently asking to hire, buy, or get help with a specific digital service.

Service required: "${service}"
Problem / need: "${problem}"
${location ? `Target location / context: "${location}"` : ""}

Rules for queries:
- Focus strictly on BUYER DEMAND, NOT sellers or agencies.
- Keep queries natural, open, and conversational (3-7 words).
- Do NOT put quotation marks around entire long phrases.
- Examples of good queries:
  looking for someone to build AI customer support agent
  need AI customer support automation
  looking for AI agent developer
  need someone to build an AI support chatbot
  seeking AI automation developer
  customer support automation project
  looking for agency to automate customer support
- Return ONLY a clean JSON array of strings, with no markdown code blocks and no explanation.
Example format:
["query 1", "query 2", "query 3", "query 4", "query 5", "query 6"]
`.trim();

  try {
    const res = await generateWithRetry(ai, {
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.2,
      },
    });

    const text = (res.text || "").trim();
    const cleanJson = text.replace(/^```json/i, "").replace(/^```/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleanJson);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Strip any accidental enclosing quotes from queries
      return parsed.slice(0, 6).map((q) => String(q).replace(/^["']|["']$/g, "").trim());
    }
  } catch (err) {
    console.warn("[Discovery] Fallback query generation due to:", err);
  }

  // Deterministic fallback demand queries if generation parsing fails
  const locSuffix = location ? ` ${location}` : "";
  return [
    `looking for someone to build ${service} ${problem}${locSuffix}`,
    `need ${service} for ${problem}${locSuffix}`,
    `seeking developer OR agency for ${problem}${locSuffix}`,
    `hiring ${service} ${problem}${locSuffix}`,
    `looking for recommendations ${service} ${problem}`,
    `looking for someone to build ${problem}`,
  ];
}

/**
 * Calculate deterministic intent score based on positive & negative signals.
 */
export function calculateIntentScore(
  classification: BuyerClassification,
  signals: {
    hasExplicitHireRequest?: boolean;
    hasActiveHiring?: boolean;
    hasSpecificProjectScope?: boolean;
    hasClearBusinessProblem?: boolean;
    hasTimeline?: boolean;
    hasBudgetOrCompensation?: boolean;
    hasUrgencyWords?: boolean;
    hasTechnologySpecified?: boolean;
    isSellerOrAgencySelfPromo?: boolean;
    isGenericArticleOrNews?: boolean;
    isJobSeekerOfferingServices?: boolean;
  }
): { score: number; reasoning: string } {
  if (classification !== "BUYER") {
    return {
      score: 15,
      reasoning: `Classified as ${classification}. Non-buyer content (seller advertisement, generic article, or educational post).`,
    };
  }

  let score = 40; // Base score for verified buyer
  const reasons: string[] = ["Verified buyer demand signal."];

  if (signals.hasExplicitHireRequest) {
    score += 15;
    reasons.push("+15 Explicit request to hire/build.");
  }
  if (signals.hasActiveHiring) {
    score += 10;
    reasons.push("+10 Active project hiring.");
  }
  if (signals.hasSpecificProjectScope) {
    score += 10;
    reasons.push("+10 Clear technical project requirements outlined.");
  }
  if (signals.hasClearBusinessProblem) {
    score += 10;
    reasons.push("+10 Concrete operational bottleneck described.");
  }
  if (signals.hasBudgetOrCompensation) {
    score += 10;
    reasons.push("+10 Budget or paid engagement signal present.");
  }
  if (signals.hasTimeline || signals.hasUrgencyWords) {
    score += 5;
    reasons.push("+5 Time-sensitive delivery needed.");
  }

  // Deductions
  if (signals.isSellerOrAgencySelfPromo) {
    score -= 40;
    reasons.push("-40 Seller promotion detected.");
  }
  if (signals.isGenericArticleOrNews) {
    score -= 30;
    reasons.push("-30 Editorial or generic news content.");
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  return { score: finalScore, reasoning: reasons.join(" ") };
}

/**
 * Run real web discovery using Google GenAI with Search Grounding.
 */
export async function runRealWebDiscovery(input: DiscoveryInput): Promise<DiscoveryMetrics> {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  // 1. Generate search queries
  const queries = await generateDemandQueries(
    ai,
    input.service,
    input.problem,
    input.location
  );

  const freshnessDays =
    input.freshness === "24h" ? 1 : input.freshness === "3d" ? 3 : input.freshness === "7d" ? 7 : 30;

  // 2. Build search grounding prompt
  const searchPrompt = `
You are the primary opportunity discovery agent for OBYON.
Your job is to search the LIVE PUBLIC WEB to find current, verifiable BUYER LEADS who need "${input.service}".

Problem / Requirement: "${input.problem}"
Target location/context: "${input.location || "Global / Remote"}" (also consider remote & cross-border demand)
Target freshness: Within the last ${freshnessDays} days (${input.freshness}).

Recommended search phrases:
${queries.map((q, i) => `${i + 1}. ${q}`).join("\n")}

SEARCH INSTRUCTIONS:
1. Search the live web thoroughly using the recommended search queries across public forums, job postings, freelancer requests, Reddit, LinkedIn, Twitter/X, RFPs, and developer boards.
2. Find 5 to 10 distinct web results / candidates and classify each one accurately:
   - BUYER: An actual PERSON, CLIENT, or BUSINESS seeking to hire, contract, or find someone to build or provide this solution, or hiring for a specific project.
   - SELLER: An agency, freelancer, consultant, or software company promoting or selling their own services.
   - GENERAL: Educational content, blog articles, news, or general discussions with no hiring intent.
   - UNKNOWN: Ambiguous posts with unclear intent.
3. Extract every discovered candidate with its real, verifiable public source URL found via search grounding. NEVER invent or fabricate URLs.

For each candidate discovered, evaluate and output:
- "sourceUrl": The real, public URL found via Google Search. Must be an exact web link (https://...).
- "sourceTitle": The real page or post title.
- "sourcePlatform": The platform name (e.g., Reddit, LinkedIn, Twitter/X, Hacker News, Job Board, Web).
- "authorName": The author/poster username or business name if available.
- "evidence": The exact verbatim sentence or quote demonstrating their demand.
- "detectedNeed": Summary of what they are looking for.
- "detectedProblem": The problem they want solved.
- "buyerClassification": Exactly one of: "BUYER", "SELLER", "GENERAL", "UNKNOWN".
  - BUYER: Looking to hire, buy, contract, or find a solution provider.
  - SELLER: Agency or freelancer advertising their own services.
  - GENERAL: Informational, tutorial, educational, or news.
  - UNKNOWN: Ambiguous or insufficient evidence.
- "hasExplicitHireRequest": boolean
- "hasActiveHiring": boolean
- "hasSpecificProjectScope": boolean
- "hasClearBusinessProblem": boolean
- "hasBudgetOrCompensation": boolean
- "hasUrgencyWords": boolean
- "urgency": "critical" | "high" | "medium" | "low"
- "budgetSignal": "confirmed_budget" | "implied_budget" | "no_signal" | "budget_concern"
- "publishedAt": ISO date string or best estimated recent date.

OUTPUT FORMAT:
Respond with ONLY a valid JSON object matching this structure:
{
  "candidates": [
    {
      "sourceUrl": "https://...",
      "sourceTitle": "...",
      "sourcePlatform": "...",
      "authorName": "...",
      "evidence": "...",
      "detectedNeed": "...",
      "detectedProblem": "...",
      "buyerClassification": "BUYER",
      "hasExplicitHireRequest": true,
      "hasActiveHiring": true,
      "hasSpecificProjectScope": true,
      "hasClearBusinessProblem": true,
      "hasBudgetOrCompensation": false,
      "hasUrgencyWords": false,
      "urgency": "medium",
      "budgetSignal": "implied_budget",
      "publishedAt": "2026-10-01T00:00:00.000Z"
    }
  ]
}
`.trim();

  // 3. Execute Google Search Grounding with Gemini 2.5 Flash (with resilient retries)
  const response = await generateWithRetry(ai, {
    model: "gemini-2.5-flash",
    contents: searchPrompt,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.1,
    },
  });

  const responseText = (response.text || "").trim();

  function extractJsonFromResponse(text: string): { candidates?: Array<Record<string, unknown>> } {
    try {
      return JSON.parse(text);
    } catch {}

    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced && fenced[1]) {
      try {
        return JSON.parse(fenced[1]);
      } catch {}
    }

    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(text.slice(firstBrace, lastBrace + 1));
      } catch {}
    }

    return { candidates: [] };
  }

  const parsedData = extractJsonFromResponse(responseText);

  // Also collect grounding metadata URLs to verify authenticity
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const groundingUrls: string[] = [];
  for (const chunk of groundingChunks) {
    const uri = chunk.web?.uri;
    if (uri && typeof uri === "string") {
      groundingUrls.push(uri);
    }
  }

  const rawCandidates = parsedData.candidates || [];

  let scannedCount = rawCandidates.length;
  let buyerCount = 0;
  let sellerCount = 0;
  let generalCount = 0;
  let unknownCount = 0;
  let rejectedCount = 0;

  const seenUrls = new Set<string>();
  const verifiedOpportunities: Opportunity[] = [];

  for (const item of rawCandidates) {
    const rawUrl = String(item.sourceUrl || "").trim();
    const classification = String(item.buyerClassification || "UNKNOWN").toUpperCase() as BuyerClassification;

    // Track classification counts
    if (classification === "BUYER") buyerCount++;
    else if (classification === "SELLER") sellerCount++;
    else if (classification === "GENERAL") generalCount++;
    else unknownCount++;

    // RULE 1: Only BUYER results enter pipeline
    if (classification !== "BUYER") {
      rejectedCount++;
      continue;
    }

    // RULE 2: Must have a verifiable, valid HTTP/HTTPS URL
    if (!rawUrl || !rawUrl.startsWith("http")) {
      rejectedCount++;
      continue;
    }

    // RULE 3: Deduplication by URL
    const normalizedUrl = rawUrl.split("?")[0].toLowerCase();
    if (seenUrls.has(normalizedUrl)) {
      rejectedCount++;
      continue;
    }
    seenUrls.add(normalizedUrl);

    // Calculate deterministic 0-100 score
    const scoreResult = calculateIntentScore("BUYER", {
      hasExplicitHireRequest: Boolean(item.hasExplicitHireRequest),
      hasActiveHiring: Boolean(item.hasActiveHiring),
      hasSpecificProjectScope: Boolean(item.hasSpecificProjectScope),
      hasClearBusinessProblem: Boolean(item.hasClearBusinessProblem),
      hasBudgetOrCompensation: Boolean(item.hasBudgetOrCompensation),
      hasUrgencyWords: Boolean(item.hasUrgencyWords),
    });

    // RULE 4: Minimum intent score filter
    if (scoreResult.score < input.minIntentScore) {
      rejectedCount++;
      continue;
    }

    const urgency: UrgencyLevel =
      item.urgency === "critical" || item.urgency === "high" || item.urgency === "low"
        ? (item.urgency as UrgencyLevel)
        : "medium";

    const urgencyScore =
      urgency === "critical" ? 95 : urgency === "high" ? 80 : urgency === "medium" ? 60 : 35;

    const rawBudget = String(item.budgetSignal || "").toLowerCase();
    const budgetSignal: BudgetSignal =
      rawBudget.includes("confirmed") || rawBudget.includes("explicit")
        ? "confirmed_budget"
        : rawBudget.includes("implied")
        ? "implied_budget"
        : rawBudget.includes("concern")
        ? "budget_concern"
        : "no_signal";

    const title = String(item.sourceTitle || `${input.service} Client Requirement`).trim();
    const evidence = String(item.evidence || item.detectedNeed || title).trim();
    const detectedNeed = String(item.detectedNeed || `Looking for ${input.service}`).trim();
    const detectedProblem = String(item.detectedProblem || input.problem).trim();

    const opp: Opportunity = {
      id: `opp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      sourceId: rawUrl,
      sourceName: String(item.sourcePlatform || "Public Web"),
      sourceType: "web",
      sourceUrl: rawUrl,
      sourceTitle: title,
      sourcePlatform: String(item.sourcePlatform || "Public Web"),
      authorName: String(item.authorName || "Prospective Buyer"),
      authorHandle: null,
      companyName: null,
      location: input.location || null,
      avatarUrl: null,
      title,
      content: evidence,
      evidence,
      publishedAt: String(item.publishedAt || new Date().toISOString()),
      discoveredAt: new Date().toISOString(),
      detectedNeed,
      detectedProblem,
      detectedRequirement: detectedNeed,
      buyerClassification: "BUYER",
      matchedServices: [input.service.toLowerCase().replace(/\s+/g, "_") as ServiceCategory],
      primaryService: input.service.toLowerCase().replace(/\s+/g, "_") as ServiceCategory,
      intentScore: scoreResult.score,
      urgencyScore,
      confidenceScore: Math.min(95, Math.max(70, scoreResult.score - 5)),
      intentStrength: scoreResult.score >= 80 ? "explicit" : "implicit",
      urgency,
      budgetSignal,
      reasoning: scoreResult.reasoning,
      suggestedOutreach: `Hi, saw your requirement regarding ${detectedNeed}. OBYON specializes in ${input.service} for ${detectedProblem}. Would love to share how we can deliver this for you.`,
      tags: [input.service.toLowerCase(), "live_web", "buyer"],
      status: "NEW",
      isBookmarked: false,
      notes: null,
    };

    verifiedOpportunities.push(opp);
  }

  // If candidate count is 0 but we have groundingChunks, treat scanned count as grounding chunk count
  if (scannedCount === 0 && groundingChunks.length > 0) {
    scannedCount = groundingChunks.length;
  }

  return {
    queriesGenerated: queries,
    scannedCount,
    buyerCount,
    sellerCount,
    generalCount,
    unknownCount,
    rejectedCount,
    savedCount: verifiedOpportunities.length,
    opportunities: verifiedOpportunities,
  };
}
