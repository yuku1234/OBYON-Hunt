import type { SourceType } from "@/types";
import type { RawSignal, SourceConnector } from "./types";
import { hackerNewsConnector } from "./connectors/hackernews";
import { redditConnector } from "./connectors/reddit";
import { gitHubConnector } from "./connectors/github";
import { rssFeedConnector } from "./connectors/rss";

export * from "./types";

export const CONNECTORS: Record<string, SourceConnector> = {
  hackernews: hackerNewsConnector,
  reddit: redditConnector,
  github: gitHubConnector,
  web: rssFeedConnector,
};

export async function fetchLiveSignals(sourceType?: SourceType): Promise<RawSignal[]> {
  if (sourceType && sourceType in CONNECTORS) {
    return CONNECTORS[sourceType].fetchSignals();
  }

  // Fetch all enabled sources concurrently
  const results = await Promise.allSettled(
    Object.values(CONNECTORS).map((connector) => connector.fetchSignals(8))
  );

  const signals: RawSignal[] = [];
  for (const res of results) {
    if (res.status === "fulfilled") {
      signals.push(...res.value);
    }
  }

  return signals;
}
