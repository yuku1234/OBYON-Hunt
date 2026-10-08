import type { RawSignal, SourceConnector } from "../types";

interface HNItem {
  id: number;
  by?: string;
  title?: string;
  text?: string;
  url?: string;
  time?: number;
  type?: string;
  score?: number;
}

export class HackerNewsConnector implements SourceConnector {
  sourceType = "hackernews" as const;
  sourceName = "Hacker News";

  async fetchSignals(limit = 15): Promise<RawSignal[]> {
    try {
      // Fetch new stories & Ask HN story IDs
      const [newStoriesRes, askStoriesRes] = await Promise.all([
        fetch("https://hacker-news.firebaseio.com/v0/newstories.json", { cache: "no-store" }),
        fetch("https://hacker-news.firebaseio.com/v0/askstories.json", { cache: "no-store" }),
      ]);

      if (!newStoriesRes.ok || !askStoriesRes.ok) {
        throw new Error("Failed to fetch Hacker News story lists");
      }

      const newStoryIds: number[] = await newStoriesRes.json();
      const askStoryIds: number[] = await askStoriesRes.json();

      // Interleave and limit items
      const selectedIds = Array.from(new Set([...askStoryIds.slice(0, 10), ...newStoryIds.slice(0, 10)])).slice(0, limit);

      const items = await Promise.all(
        selectedIds.map(async (id) => {
          try {
            const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { cache: "no-store" });
            if (!res.ok) return null;
            return (await res.json()) as HNItem;
          } catch {
            return null;
          }
        })
      );

      const signals: RawSignal[] = [];

      for (const item of items) {
        if (!item || (!item.title && !item.text)) continue;

        const title = item.title ?? "Hacker News Post";
        const content = item.text ? item.text.replace(/<[^>]*>/g, "") : title; // strip HTML tags
        const publishedAt = item.time ? new Date(item.time * 1000).toISOString() : new Date().toISOString();
        const author = item.by ?? "HN User";

        signals.push({
          externalId: `hn-${item.id}`,
          sourceType: "hackernews",
          sourceName: "Hacker News",
          sourceUrl: item.url ?? `https://news.ycombinator.com/item?id=${item.id}`,
          title,
          content,
          authorName: author,
          authorHandle: author,
          companyName: null,
          location: null,
          publishedAt,
        });
      }

      return signals;
    } catch (err) {
      console.error("[HackerNewsConnector] Error fetching signals:", err);
      return [];
    }
  }
}

export const hackerNewsConnector = new HackerNewsConnector();
