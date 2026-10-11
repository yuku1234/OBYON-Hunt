// ============================================================
// X (Twitter) Adapter
// Official X API v2 integration with live search & compliant search link generator.
// ============================================================

import type {
  SourceAdapter,
  SourceConnectionStatus,
  SourceTestResult,
  SourceDiscoveryInput,
  RawCandidate,
  SourceSetupGuide,
} from "./types";

export class XAdapter implements SourceAdapter {
  readonly id = "x_twitter";
  readonly name = "X (Twitter)";
  readonly type = "twitter";
  readonly method = "official_api" as const;
  readonly description = "Discovers real-time buyer tweets, requests for recommendations, and founder project announcements via X API v2 or compliant live search.";
  readonly requiredEnvVars = ["TWITTER_BEARER_TOKEN"];

  private lastTestedAt?: string;

  private getBearerToken(): string | null {
    const token = process.env.TWITTER_BEARER_TOKEN;
    return token && token.trim().length > 0 ? token.trim() : null;
  }

  async getStatus(): Promise<{
    status: SourceConnectionStatus;
    statusMessage: string;
    lastTestedAt?: string;
  }> {
    const token = this.getBearerToken();
    if (!token) {
      return {
        status: "configuration_required",
        statusMessage: "TWITTER_BEARER_TOKEN is not configured in .env.local",
        lastTestedAt: this.lastTestedAt,
      };
    }

    return {
      status: this.lastTestedAt ? "connected" : "configuration_required",
      statusMessage: this.lastTestedAt ? "Connected via X API v2" : "Bearer token configured; test connection required",
      lastTestedAt: this.lastTestedAt,
    };
  }

  async testConnection(): Promise<SourceTestResult> {
    const start = Date.now();
    const token = this.getBearerToken();

    if (!token) {
      return {
        sourceId: this.id,
        sourceName: this.name,
        status: "configuration_required",
        statusMessage: "TWITTER_BEARER_TOKEN is missing from .env.local. Add your X Developer Bearer Token.",
        testedAt: new Date().toISOString(),
      };
    }

    try {
      // Test basic endpoint
      const res = await fetch("https://api.twitter.com/2/users/by/username/twitter", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (res.status === 401) {
        return {
          sourceId: this.id,
          sourceName: this.name,
          status: "configuration_required",
          statusMessage: "X API authentication failed: Invalid Bearer Token.",
          latencyMs: Date.now() - start,
          testedAt: new Date().toISOString(),
        };
      }

      if (res.status === 403) {
        return {
          sourceId: this.id,
          sourceName: this.name,
          status: "permission_required",
          statusMessage: "X API access forbidden: Insufficient project permissions or endpoint access tier.",
          latencyMs: Date.now() - start,
          testedAt: new Date().toISOString(),
        };
      }

      if (!res.ok) {
        throw new Error(`X API returned HTTP ${res.status}: ${res.statusText}`);
      }

      this.lastTestedAt = new Date().toISOString();
      return {
        sourceId: this.id,
        sourceName: this.name,
        status: "connected",
        statusMessage: "Successfully authenticated with official X API v2.",
        latencyMs: Date.now() - start,
        testedAt: this.lastTestedAt,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        sourceId: this.id,
        sourceName: this.name,
        status: "temporarily_unavailable",
        statusMessage: `X test failed: ${msg}`,
        latencyMs: Date.now() - start,
        testedAt: new Date().toISOString(),
      };
    }
  }

  async discover(input: SourceDiscoveryInput): Promise<RawCandidate[]> {
    const token = this.getBearerToken();
    if (!token) return [];

    try {
      const query = encodeURIComponent(`("looking for" OR "need someone" OR "hiring") "${input.service}" -is:retweet lang:en`);
      const res = await fetch(
        `https://api.twitter.com/2/tweets/search/recent?query=${query}&max_results=10&tweet.fields=created_at,author_id`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!res.ok) {
        console.warn(`[XAdapter] Search recent returned HTTP ${res.status}`);
        return [];
      }

      const data = await res.json();
      const tweets = data.data || [];

      return tweets.map((tweet: { id: string; text: string; created_at: string; author_id?: string }) => ({
        sourceId: `x-${tweet.id}`,
        sourceName: "X (Twitter)",
        sourceType: "twitter",
        sourceUrl: `https://twitter.com/i/web/status/${tweet.id}`,
        sourcePlatform: "X (Twitter)",
        sourceTitle: tweet.text.slice(0, 80) + "...",
        authorName: tweet.author_id ? `User ${tweet.author_id}` : "X User",
        authorHandle: null,
        companyName: null,
        location: input.location || null,
        content: tweet.text,
        evidence: tweet.text,
        detectedNeed: `Demand for ${input.service}`,
        detectedProblem: input.problem,
        buyerClassification: "BUYER",
        publishedAt: tweet.created_at,
        discoveredAt: new Date().toISOString(),
        signals: {
          hasExplicitHireRequest: true,
          hasClearBusinessProblem: true,
        },
        urgency: "high",
        budgetSignal: "implied_budget",
      }));
    } catch (err) {
      console.error("[XAdapter] Error during discovery:", err);
      return [];
    }
  }

  getSetupGuide(): SourceSetupGuide {
    return {
      title: "X (Twitter) API v2 Integration",
      description: "Connect your official X Developer App to query live tweets and founder requests.",
      consoleUrl: "https://developer.x.com/en/portal/dashboard",
      requiredEnvVars: [
        {
          key: "TWITTER_BEARER_TOKEN",
          description: "App-only Bearer Token generated in the X Developer Portal Keys and Tokens tab.",
          required: true,
        },
      ],
      complianceNotes: "Complies with X Developer Agreement. Note: X API v2 'search recent' endpoint requires the Basic ($100/mo) or Pro access tier. Direct compliant search links are always available as fallback.",
      steps: [
        "1. Open the X Developer Portal (https://developer.x.com/en/portal/dashboard).",
        "2. Create a Project and App in the developer dashboard.",
        "3. Navigate to the 'Keys and Tokens' tab.",
        "4. Generate and copy the 'Bearer Token'.",
        "5. Add TWITTER_BEARER_TOKEN=your_token to .env.local.",
        "6. Click 'Test Connection' on the Sources page to verify.",
      ],
    };
  }

  generateCompliantSearchUrl(input: { service: string; problem: string; location?: string }): string {
    const q = `"looking for" OR "need" "${input.service}" ${input.problem} ${input.location || ""}`.trim();
    return `https://twitter.com/search?q=${encodeURIComponent(q)}&f=live`;
  }
}

export const xAdapter = new XAdapter();
