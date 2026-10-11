// ============================================================
// Google Search Grounding Adapter
// Powered by @google/genai Interactions API with live Google Search.
// Server-side only — never leaks GEMINI_API_KEY.
// ============================================================

import { GoogleGenAI } from "@google/genai";
import type {
  SourceAdapter,
  SourceConnectionStatus,
  SourceTestResult,
  SourceDiscoveryInput,
  RawCandidate,
  SourceSetupGuide,
} from "./types";
import { generateDemandQueries } from "@/lib/ai/discovery";

export class GoogleGroundingAdapter implements SourceAdapter {
  readonly id = "google_grounding";
  readonly name = "Google Web Grounding";
  readonly type = "web";
  readonly method = "grounding" as const;
  readonly description = "Real-time Google Search grounding powered by Gemini 2.5 Flash to discover public buyer demand across the indexed web.";
  readonly requiredEnvVars = ["GEMINI_API_KEY"];

  private lastTestedAt?: string;

  private getApiKey(): string | null {
    const key = process.env.GEMINI_API_KEY;
    return key && key.trim().length > 0 ? key.trim() : null;
  }

  async getStatus(): Promise<{
    status: SourceConnectionStatus;
    statusMessage: string;
    lastTestedAt?: string;
  }> {
    const key = this.getApiKey();
    if (!key) {
      return {
        status: "configuration_required",
        statusMessage: "GEMINI_API_KEY is not configured in .env.local",
        lastTestedAt: this.lastTestedAt,
      };
    }

    return {
      status: this.lastTestedAt ? "connected" : "connected",
      statusMessage: "Configured with Gemini 2.5 Flash Search Grounding",
      lastTestedAt: this.lastTestedAt,
    };
  }

  async testConnection(): Promise<SourceTestResult> {
    const start = Date.now();
    const key = this.getApiKey();

    if (!key) {
      return {
        sourceId: this.id,
        sourceName: this.name,
        status: "configuration_required",
        statusMessage: "GEMINI_API_KEY is missing from .env.local. Add your Google Gemini API key.",
        testedAt: new Date().toISOString(),
      };
    }

    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const res = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Respond with 'PONG' only.",
        config: { maxOutputTokens: 5, temperature: 0 },
      });

      const text = res.text?.trim() || "";
      this.lastTestedAt = new Date().toISOString();

      return {
        sourceId: this.id,
        sourceName: this.name,
        status: "connected",
        statusMessage: `Successfully connected to Gemini API (${text ? text : "OK"}). Grounding ready.`,
        latencyMs: Date.now() - start,
        testedAt: this.lastTestedAt,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        sourceId: this.id,
        sourceName: this.name,
        status: "temporarily_unavailable",
        statusMessage: `Connection test failed: ${msg}`,
        latencyMs: Date.now() - start,
        testedAt: new Date().toISOString(),
      };
    }
  }

  async discover(input: SourceDiscoveryInput): Promise<RawCandidate[]> {
    const key = this.getApiKey();
    if (!key) {
      throw new Error("GEMINI_API_KEY is missing from .env.local");
    }

    const ai = new GoogleGenAI({ apiKey: key });

    // 1. Generate demand queries
    const queries = await generateDemandQueries(ai, input.service, input.problem, input.location);

    const freshnessDays =
      input.freshness === "24h" ? 1 : input.freshness === "3d" ? 3 : input.freshness === "7d" ? 7 : 30;

    const searchPrompt = `
You are the lead discovery agent for OBYON.
Search the LIVE PUBLIC WEB to find current, verifiable BUYER LEADS who need "${input.service}".

Problem / Requirement: "${input.problem}"
Target location: "${input.location || "Global / Remote"}"
Freshness: Within the last ${freshnessDays} days (${input.freshness}).

Recommended search phrases:
${queries.map((q, i) => `${i + 1}. ${q}`).join("\n")}

SEARCH RULES:
1. Search public forums, RFPs, job boards, contractor requests, Reddit, LinkedIn, Twitter/X, and freelance postings.
2. Find 5 to 8 real candidates. Extract each candidate's real public source URL found via search grounding. NEVER invent URLs.
3. Classify each candidate accurately:
   - BUYER: Looking to hire, contract, or find someone to build or provide this solution.
   - SELLER: Agency or freelancer selling services.
   - GENERAL: Educational, editorial, or generic articles.
   - UNKNOWN: Ambiguous intent.

Respond ONLY with valid JSON:
{
  "candidates": [
    {
      "sourceUrl": "https://...",
      "sourceTitle": "...",
      "sourcePlatform": "...",
      "authorName": "...",
      "evidence": "verbatim quote showing demand",
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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: searchPrompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
      },
    });

    const responseText = (response.text || "").trim();
    let candidatesJson: Array<Record<string, unknown>> = [];

    try {
      candidatesJson = JSON.parse(responseText).candidates || [];
    } catch {
      const match = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (match && match[1]) {
        try {
          candidatesJson = JSON.parse(match[1]).candidates || [];
        } catch {}
      } else {
        const fb = responseText.indexOf("{");
        const lb = responseText.lastIndexOf("}");
        if (fb !== -1 && lb > fb) {
          try {
            candidatesJson = JSON.parse(responseText.slice(fb, lb + 1)).candidates || [];
          } catch {}
        }
      }
    }

    const results: RawCandidate[] = [];

    for (const item of candidatesJson) {
      const url = String(item.sourceUrl || "").trim();
      if (!url.startsWith("http")) continue;

      const rawClassification = String(item.buyerClassification || "UNKNOWN").toUpperCase();
      const buyerClassification = (
        ["BUYER", "SELLER", "GENERAL", "UNKNOWN"].includes(rawClassification)
          ? rawClassification
          : "UNKNOWN"
      ) as "BUYER" | "SELLER" | "GENERAL" | "UNKNOWN";

      results.push({
        sourceId: url,
        sourceName: String(item.sourcePlatform || "Google Web Grounding"),
        sourceType: "web",
        sourceUrl: url,
        sourcePlatform: String(item.sourcePlatform || "Public Web"),
        sourceTitle: String(item.sourceTitle || `${input.service} Requirement`),
        authorName: String(item.authorName || "Prospective Client"),
        authorHandle: null,
        companyName: null,
        location: input.location || null,
        content: String(item.evidence || item.detectedNeed || item.sourceTitle),
        evidence: String(item.evidence || item.detectedNeed || ""),
        detectedNeed: String(item.detectedNeed || `Looking for ${input.service}`),
        detectedProblem: String(item.detectedProblem || input.problem),
        buyerClassification,
        publishedAt: item.publishedAt ? String(item.publishedAt) : undefined,
        discoveredAt: new Date().toISOString(),
        signals: {
          hasExplicitHireRequest: Boolean(item.hasExplicitHireRequest),
          hasActiveHiring: Boolean(item.hasActiveHiring),
          hasSpecificProjectScope: Boolean(item.hasSpecificProjectScope),
          hasClearBusinessProblem: Boolean(item.hasClearBusinessProblem),
          hasBudgetOrCompensation: Boolean(item.hasBudgetOrCompensation),
          hasUrgencyWords: Boolean(item.hasUrgencyWords),
        },
        urgency: (item.urgency as "critical" | "high" | "medium" | "low") || "medium",
        budgetSignal:
          (item.budgetSignal as "confirmed_budget" | "implied_budget" | "no_signal" | "budget_concern") ||
          "no_signal",
      });
    }

    return results;
  }

  getSetupGuide(): SourceSetupGuide {
    return {
      title: "Google Search Grounding (Gemini 2.5 Flash)",
      description: "Uses Google's official GenAI SDK to search the live web and ground responses with real public citations and URLs.",
      consoleUrl: "https://aistudio.google.com/app/apikey",
      requiredEnvVars: [
        {
          key: "GEMINI_API_KEY",
          description: "Google Gemini API key with access to gemini-2.5-flash and search grounding tools.",
          required: true,
        },
      ],
      complianceNotes: "Operates 100% compliantly through Google's official GenAI Interactions API. No web scraping or TOS violations.",
      steps: [
        "1. Open Google AI Studio (https://aistudio.google.com/app/apikey).",
        "2. Create a new API key.",
        "3. Add GEMINI_API_KEY=your_key_here to your .env.local file.",
        "4. Click 'Test Connection' on the Sources page to verify.",
      ],
    };
  }
}

export const googleGroundingAdapter = new GoogleGroundingAdapter();
