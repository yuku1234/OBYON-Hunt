// ============================================================
// Reddit Adapter
// Compliant OAuth 2.0 integration for Reddit public subreddit search.
// Falls back to transparent configuration guidance & search links.
// ============================================================

import type {
  SourceAdapter,
  SourceConnectionStatus,
  SourceTestResult,
  SourceDiscoveryInput,
  RawCandidate,
  SourceSetupGuide,
} from "./types";

export class RedditAdapter implements SourceAdapter {
  readonly id = "reddit";
  readonly name = "Reddit";
  readonly type = "reddit";
  readonly method = "official_api" as const;
  readonly description = "Queries business, startup, and freelance subreddits via official Reddit OAuth API to identify real hiring posts and software requests.";
  readonly requiredEnvVars = ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET"];

  private lastTestedAt?: string;

  private getCredentials() {
    return {
      clientId: process.env.REDDIT_CLIENT_ID?.trim() || null,
      clientSecret: process.env.REDDIT_CLIENT_SECRET?.trim() || null,
      userAgent: process.env.REDDIT_USER_AGENT?.trim() || "OBYONHunt/2.0 (lead qualification engine)",
    };
  }

  async getStatus(): Promise<{
    status: SourceConnectionStatus;
    statusMessage: string;
    lastTestedAt?: string;
  }> {
    const { clientId, clientSecret } = this.getCredentials();
    if (!clientId || !clientSecret) {
      return {
        status: "configuration_required",
        statusMessage: "REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET are required in .env.local",
        lastTestedAt: this.lastTestedAt,
      };
    }

    return {
      status: this.lastTestedAt ? "connected" : "configuration_required",
      statusMessage: this.lastTestedAt ? "Connected via Reddit OAuth" : "Credentials provided; connection test required",
      lastTestedAt: this.lastTestedAt,
    };
  }

  private async getOAuthToken(): Promise<string> {
    const { clientId, clientSecret, userAgent } = this.getCredentials();
    if (!clientId || !clientSecret) {
      throw new Error("Missing Reddit credentials in .env.local");
    }

    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const res = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": userAgent,
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Reddit OAuth authentication failed: HTTP ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    if (!data.access_token) {
      throw new Error("Reddit did not return an access_token");
    }

    return data.access_token;
  }

  async testConnection(): Promise<SourceTestResult> {
    const start = Date.now();
    const { clientId, clientSecret } = this.getCredentials();

    if (!clientId || !clientSecret) {
      return {
        sourceId: this.id,
        sourceName: this.name,
        status: "configuration_required",
        statusMessage: "REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET are missing from .env.local.",
        testedAt: new Date().toISOString(),
      };
    }

    try {
      const token = await this.getOAuthToken();
      const res = await fetch("https://oauth.reddit.com/r/forhire/about.json", {
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": this.getCredentials().userAgent,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Reddit API check returned HTTP ${res.status}`);
      }

      this.lastTestedAt = new Date().toISOString();
      return {
        sourceId: this.id,
        sourceName: this.name,
        status: "connected",
        statusMessage: "Successfully authenticated with Reddit OAuth 2.0 API.",
        latencyMs: Date.now() - start,
        testedAt: this.lastTestedAt,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        sourceId: this.id,
        sourceName: this.name,
        status: "temporarily_unavailable",
        statusMessage: `Reddit test failed: ${msg}`,
        latencyMs: Date.now() - start,
        testedAt: new Date().toISOString(),
      };
    }
  }

  async discover(input: SourceDiscoveryInput): Promise<RawCandidate[]> {
    const { clientId, clientSecret, userAgent } = this.getCredentials();
    if (!clientId || !clientSecret) {
      // Return empty if credentials are not configured — do not fabricate or crash
      return [];
    }

    const token = await this.getOAuthToken();
    const subreddits = ["forhire", "smallbusiness", "entrepreneur", "startups", "SaaS"];
    const query = encodeURIComponent(`"hiring" OR "looking for" OR "need" "${input.service}"`);
    const results: RawCandidate[] = [];

    for (const sub of subreddits.slice(0, 2)) {
      try {
        const res = await fetch(
          `https://oauth.reddit.com/r/${sub}/search.json?q=${query}&restrict_sr=1&sort=new&limit=5`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "User-Agent": userAgent,
            },
            cache: "no-store",
          }
        );

        if (!res.ok) continue;

        const data = await res.json();
        const posts = data.data?.children || [];

        for (const post of posts) {
          const p = post.data;
          if (!p || !p.title) continue;

          const title = p.title;
          const text = p.selftext || title;
          const isHiring = title.toLowerCase().includes("[hiring]") || title.toLowerCase().includes("hiring");
          const isForHire = title.toLowerCase().includes("[for hire]") || title.toLowerCase().includes("for hire");

          // Reject sellers/freelancers immediately
          if (isForHire) continue;

          results.push({
            sourceId: `reddit-${p.id}`,
            sourceName: `Reddit (r/${p.subreddit})`,
            sourceType: "reddit",
            sourceUrl: `https://reddit.com${p.permalink}`,
            sourcePlatform: "Reddit",
            sourceTitle: title,
            authorName: `u/${p.author}`,
            authorHandle: p.author,
            companyName: null,
            location: input.location || null,
            content: text,
            evidence: text.slice(0, 300),
            detectedNeed: `Seeking ${input.service} in r/${p.subreddit}`,
            detectedProblem: input.problem,
            buyerClassification: isHiring ? "BUYER" : "UNKNOWN",
            publishedAt: new Date(p.created_utc * 1000).toISOString(),
            discoveredAt: new Date().toISOString(),
            signals: {
              hasExplicitHireRequest: isHiring,
              hasActiveHiring: isHiring,
              hasClearBusinessProblem: true,
              isSellerOrAgencySelfPromo: isForHire,
            },
            urgency: "medium",
            budgetSignal: "implied_budget",
          });
        }
      } catch (err) {
        console.error(`[RedditAdapter] Error searching r/${sub}:`, err);
      }
    }

    return results;
  }

  getSetupGuide(): SourceSetupGuide {
    return {
      title: "Reddit Official API (OAuth 2.0)",
      description: "Uses Reddit's official developer API to monitor business & hiring subreddits compliantly.",
      consoleUrl: "https://www.reddit.com/prefs/apps",
      requiredEnvVars: [
        {
          key: "REDDIT_CLIENT_ID",
          description: "Reddit App Client ID (listed under the app name).",
          required: true,
        },
        {
          key: "REDDIT_CLIENT_SECRET",
          description: "Reddit App Secret key.",
          required: true,
        },
        {
          key: "REDDIT_USER_AGENT",
          description: "Custom user agent string (e.g. OBYONHunt/1.0 by your_username).",
          required: false,
        },
      ],
      complianceNotes: "Adheres to Reddit's Developer Terms. Requires OAuth client_credentials authentication. Never scrapes HTML or violates rate limits.",
      steps: [
        "1. Go to Reddit App Preferences (https://www.reddit.com/prefs/apps).",
        "2. Click 'are you a developer? create an app...' at the bottom.",
        "3. Choose 'script' as the application type.",
        "4. Set name to 'OBYON Hunt' and redirect URI to 'http://localhost:3000'.",
        "5. Copy the Client ID (under the app title) and Secret.",
        "6. Add REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET to your .env.local file.",
      ],
    };
  }

  generateCompliantSearchUrl(input: { service: string; problem: string; location?: string }): string {
    const q = `${input.service} ${input.problem} ${input.location || ""}`.trim();
    return `https://www.reddit.com/search/?q=${encodeURIComponent(q)}&sort=new`;
  }
}

export const redditAdapter = new RedditAdapter();
