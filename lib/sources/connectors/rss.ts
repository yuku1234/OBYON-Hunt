import type { RawSignal, SourceConnector } from "../types";

export class RSSFeedConnector implements SourceConnector {
  sourceType = "web" as const;
  sourceName = "RSS Feeds";

  private defaultFeeds = [
    { name: "TechCrunch Startups", url: "https://techcrunch.com/category/startups/feed/" },
  ];

  async fetchSignals(limit = 10): Promise<RawSignal[]> {
    const signals: RawSignal[] = [];

    for (const feed of this.defaultFeeds) {
      try {
        const res = await fetch(feed.url, { cache: "no-store" });
        if (!res.ok) continue;

        const xml = await res.text();
        const items = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];

        for (const itemXml of items.slice(0, 5)) {
          const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
          const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
          const descMatch = itemXml.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
          const pubDateMatch = itemXml.match(/<pubDate>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/pubDate>/i);

          if (!titleMatch || !linkMatch) continue;

          const title = titleMatch[1].trim();
          const link = linkMatch[1].trim();
          const desc = descMatch ? descMatch[1].replace(/<[^>]*>/g, "").trim() : title;
          const pubDate = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();

          signals.push({
            externalId: `rss-${Buffer.from(link).toString("base64").slice(0, 16)}`,
            sourceType: "web",
            sourceName: feed.name,
            sourceUrl: link,
            title,
            content: desc,
            authorName: feed.name,
            authorHandle: null,
            companyName: null,
            location: null,
            publishedAt: pubDate,
          });
        }
      } catch (err) {
        console.error(`[RSSFeedConnector] Error fetching feed ${feed.name}:`, err);
      }
    }

    return signals.slice(0, limit);
  }
}

export const rssFeedConnector = new RSSFeedConnector();
