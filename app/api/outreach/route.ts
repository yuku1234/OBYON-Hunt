// ============================================================
// POST /api/outreach
// Server-side only — generates a personalized outreach message
// using Gemini. API key never reaches the browser.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { createAIProvider } from "@/lib/ai";
import type { Opportunity } from "@/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { opportunity } = body as { opportunity: Opportunity };

    if (!opportunity || typeof opportunity !== "object") {
      return NextResponse.json(
        { error: "opportunity object is required" },
        { status: 400 }
      );
    }

    if (!opportunity.id || !opportunity.content) {
      return NextResponse.json(
        { error: "opportunity must have id and content fields" },
        { status: 400 }
      );
    }

    const provider = createAIProvider();

    if (!provider.isAvailable()) {
      return NextResponse.json(
        {
          error:
            "AI provider not configured. Set GEMINI_API_KEY and AI_PROVIDER=gemini in .env.local",
        },
        { status: 503 }
      );
    }

    const draft = await provider.generateOutreach(opportunity);

    return NextResponse.json(draft, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";

    if (message.includes("API_KEY_INVALID") || message.includes("API key")) {
      return NextResponse.json(
        {
          error:
            "Gemini API key is invalid or expired. Please update GEMINI_API_KEY in .env.local",
        },
        { status: 401 }
      );
    }

    if (message.includes("429") || message.includes("quota")) {
      return NextResponse.json(
        { error: "Gemini API rate limit reached. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    console.error("[/api/outreach] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
