import type { SourceType } from "@/types";

export interface RawSignal {
  externalId: string;
  sourceType: SourceType;
  sourceName: string;
  sourceUrl: string;
  title: string;
  content: string;
  authorName: string;
  authorHandle: string | null;
  companyName: string | null;
  location: string | null;
  publishedAt: string;
}

export interface SourceConnector {
  sourceType: SourceType;
  sourceName: string;
  fetchSignals(limit?: number): Promise<RawSignal[]>;
}
