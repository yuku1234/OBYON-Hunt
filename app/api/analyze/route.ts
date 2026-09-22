// ============================================================
// POST /api/analyze
// Server-side only — Gemini API key never reaches the browser.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { createAIProvider } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, context } = body as {
      content: string;
      context?: string;
    };

    if (!content || typeof content !== "string" || content.trim().length < 10) {
      return NextResponse.json(
        { error: "content must be a string of at least 10 characters" },
        { status: 400 }
      );
    }

    if (content.length > 8000) {
      return NextResponse.json(
        { error: "content exceeds maximum length of 8000 characters" },
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

    const analysis = await provider.analyzeIntent(content.trim(), context);

    // Strip rawResponse from the API response (internal only)
    const { rawResponse: _raw, ...safeAnalysis } = analysis;

    return NextResponse.json(safeAnalysis, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";

    // Auth error — key invalid
    if (message.includes("API_KEY_INVALID") || message.includes("API key")) {
      return NextResponse.json(
        {
          error:
            "Gemini API key is invalid or expired. Please update GEMINI_API_KEY in .env.local",
        },
        { status: 401 }
      );
    }

    // Rate limit
    if (message.includes("429") || message.includes("quota")) {
      return NextResponse.json(
        { error: "Gemini API rate limit reached. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    console.error("[/api/analyze] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
