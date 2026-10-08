import type { RawSignal, SourceConnector } from "../types";

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  created_at: string;
  user: {
    login: string;
  } | null;
  repository_url: string;
}

interface GitHubSearchResponse {
  items: GitHubIssue[];
}

export class GitHubConnector implements SourceConnector {
  sourceType = "github" as const;
  sourceName = "GitHub Issues";

  async fetchSignals(limit = 10): Promise<RawSignal[]> {
    try {
      const query = encodeURIComponent('is:issue is:open label:"help wanted" sort:created-desc');
      const res = await fetch(`https://api.github.com/search/issues?q=${query}&per_page=${limit}`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "OBYONSignal/1.0",
        },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`GitHub API error: ${res.statusText}`);
      }

      const data: GitHubSearchResponse = await res.json();
      const items = data.items ?? [];

      return items.map((issue) => {
        const repoName = issue.repository_url.split("/").slice(-2).join("/");
        return {
          externalId: `github-${issue.id}`,
          sourceType: "github",
          sourceName: `GitHub (${repoName})`,
          sourceUrl: issue.html_url,
          title: issue.title,
          content: issue.body ?? issue.title,
          authorName: issue.user?.login ?? "GitHub User",
          authorHandle: issue.user?.login ?? null,
          companyName: repoName,
          location: null,
          publishedAt: issue.created_at,
        };
      });
    } catch (err) {
      console.error("[GitHubConnector] Error fetching issues:", err);
      return [];
    }
  }
}

export const gitHubConnector = new GitHubConnector();
