import type { RawSignal, SourceConnector } from "../types";

interface RedditPost {
  kind: string;
  data: {
    id: string;
    title: string;
    selftext: string;
    author: string;
    permalink: string;
    url: string;
    created_utc: number;
    subreddit: string;
  };
}

interface RedditListingResponse {
  data: {
    children: RedditPost[];
  };
}

export class RedditConnector implements SourceConnector {
  sourceType = "reddit" as const;
  sourceName = "Reddit";

  private subreddits = ["smallbusiness", "SaaS", "entrepreneur", "web_design", "forhire"];

  async fetchSignals(limit = 15): Promise<RawSignal[]> {
    const signals: RawSignal[] = [];

    // Select 2-3 subreddits per run
    const selectedSubs = this.subreddits.slice(0, 3);

    for (const sub of selectedSubs) {
      try {
        const res = await fetch(`https://www.reddit.com/r/${sub}/new.json?limit=5`, {
          headers: {
            "User-Agent": "OBYONSignal/1.0 (Opportunity Discovery Agent)",
          },
          cache: "no-store",
        });

        if (!res.ok) continue;

        const data: RedditListingResponse = await res.json();
        const posts = data.data?.children ?? [];

        for (const post of posts) {
          const p = post.data;
          if (!p || !p.title) continue;

          const content = p.selftext && p.selftext.trim().length > 0 ? p.selftext : p.title;

          signals.push({
            externalId: `reddit-${p.id}`,
            sourceType: "reddit",
            sourceName: `Reddit (r/${p.subreddit})`,
            sourceUrl: `https://reddit.com${p.permalink}`,
            title: p.title,
            content,
            authorName: `u/${p.author}`,
            authorHandle: p.author,
            companyName: null,
            location: null,
            publishedAt: new Date(p.created_utc * 1000).toISOString(),
          });
        }
      } catch (err) {
        console.error(`[RedditConnector] Error fetching r/${sub}:`, err);
      }
    }

    return signals.slice(0, limit);
  }
}

export const redditConnector = new RedditConnector();
