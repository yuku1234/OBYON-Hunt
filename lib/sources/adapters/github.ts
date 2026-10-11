// ============================================================
// GitHub Adapter — Official GitHub REST API
// Discovers open technical requirements & 'help wanted' issues.
// ============================================================

import type {
  SourceAdapter,
  SourceConnectionStatus,
  SourceTestResult,
  SourceDiscoveryInput,
  RawCandidate,
  SourceSetupGuide,
} from "./types";

interface GitHubIssueItem {
  id: number;
  title: string;
  body: string | null;
  html_url: string;
  created_at: string;
  user: { login: string } | null;
  repository_url: string;
}

export class GitHubAdapter implements SourceAdapter {
  readonly id = "github";
  readonly name = "GitHub Issues";
  readonly type = "github";
  readonly method = "official_api" as const;
  readonly description = "Monitors open repositories for project requirements, bounties, and issues tagged with 'help wanted' or developer requests.";
  readonly requiredEnvVars = ["GITHUB_TOKEN"];

  private lastTestedAt?: string;

  private getToken(): string | null {
    const token = process.env.GITHUB_TOKEN;
    return token && token.trim().length > 0 ? token.trim() : null;
  }

  async getStatus(): Promise<{
    status: SourceConnectionStatus;
    statusMessage: string;
    lastTestedAt?: string;
  }> {
    const token = this.getToken();
    return {
      status: "connected",
      statusMessage: token ? "Connected via GitHub Personal Access Token" : "Connected (Public unauthenticated tier, 10 req/min)",
      lastTestedAt: this.lastTestedAt,
    };
  }

  async testConnection(): Promise<SourceTestResult> {
    const start = Date.now();
    const token = this.getToken();

    try {
      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "OBYONHunt/2.0",
      };
      if (token) {
        headers.Authorization = `token ${token}`;
      }

      const res = await fetch("https://api.github.com/zen", { headers, cache: "no-store" });
      if (!res.ok) {
        throw new Error(`GitHub API returned HTTP ${res.status}`);
      }

      const zen = await res.text();
      this.lastTestedAt = new Date().toISOString();

      return {
        sourceId: this.id,
        sourceName: this.name,
        status: "connected",
        statusMessage: `Successfully connected to GitHub API (${zen.trim()}).`,
        latencyMs: Date.now() - start,
        testedAt: this.lastTestedAt,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        sourceId: this.id,
        sourceName: this.name,
        status: "temporarily_unavailable",
        statusMessage: `GitHub test failed: ${msg}`,
        latencyMs: Date.now() - start,
        testedAt: new Date().toISOString(),
      };
    }
  }

  async discover(input: SourceDiscoveryInput): Promise<RawCandidate[]> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "OBYONHunt/2.0",
    };
    if (token) {
      headers.Authorization = `token ${token}`;
    }

    try {
      const q = encodeURIComponent(`is:issue is:open label:"help wanted" "${input.service}"`);
      const res = await fetch(`https://api.github.com/search/issues?q=${q}&per_page=6`, {
        headers,
        cache: "no-store",
      });

      if (!res.ok) return [];

      const data = await res.json();
      const items: GitHubIssueItem[] = data.items || [];

      return items.map((issue) => {
        const repoName = issue.repository_url.split("/").slice(-2).join("/");
        const bodyText = issue.body || issue.title;

        return {
          sourceId: `gh-${issue.id}`,
          sourceName: `GitHub (${repoName})`,
          sourceType: "github",
          sourceUrl: issue.html_url,
          sourcePlatform: "GitHub",
          sourceTitle: issue.title,
          authorName: issue.user?.login || "GitHub Contributor",
          authorHandle: issue.user?.login || null,
          companyName: repoName,
          location: input.location || null,
          content: bodyText,
          evidence: bodyText.slice(0, 300),
          detectedNeed: `Technical request for ${input.service}`,
          detectedProblem: input.problem,
          buyerClassification: "BUYER",
          publishedAt: issue.created_at,
          discoveredAt: new Date().toISOString(),
          signals: {
            hasExplicitHireRequest: true,
            hasSpecificProjectScope: true,
            hasClearBusinessProblem: true,
          },
          urgency: "medium",
          budgetSignal: "no_signal",
        };
      });
    } catch (err) {
      console.error("[GitHubAdapter] Error searching issues:", err);
      return [];
    }
  }

  getSetupGuide(): SourceSetupGuide {
    return {
      title: "GitHub API Integration",
      description: "Connect to GitHub Search API to discover developer issues and open project requests.",
      consoleUrl: "https://github.com/settings/tokens",
      requiredEnvVars: [
        {
          key: "GITHUB_TOKEN",
          description: "Optional Personal Access Token to increase rate limits from 10/min to 30/min.",
          required: false,
        },
      ],
      complianceNotes: "Operates 100% compliantly via official GitHub v3 REST API. Does not scrape or violate GitHub terms.",
      steps: [
        "1. Works out of the box with public unauthenticated rate limits (10 req/min).",
        "2. To increase limits, create a Personal Access Token at https://github.com/settings/tokens (no special scopes needed).",
        "3. Add GITHUB_TOKEN=your_token to .env.local.",
        "4. Click 'Test Connection' on the Sources page to verify.",
      ],
    };
  }

  generateCompliantSearchUrl(input: { service: string; problem: string; location?: string }): string {
    const q = `is:issue is:open label:"help wanted" "${input.service}" ${input.problem}`.trim();
    return `https://github.com/search?q=${encodeURIComponent(q)}&type=issues`;
  }
}

export const gitHubAdapter = new GitHubAdapter();
