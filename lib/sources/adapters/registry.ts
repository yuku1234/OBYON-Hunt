// ============================================================
// Source Adapter Registry
// Central registry for all multi-source discovery providers.
// ============================================================

import type { SourceAdapter, SourceTestResult } from "./types";
import { googleGroundingAdapter } from "./google-grounding";
import { redditAdapter } from "./reddit";
import { xAdapter } from "./x";
import { linkedInAdapter } from "./linkedin";
import { metaAdapter } from "./meta";
import { hackerNewsAdapter } from "./hackernews";
import { gitHubAdapter } from "./github";

export class SourceRegistry {
  private adapters: Map<string, SourceAdapter> = new Map();

  constructor() {
    this.register(googleGroundingAdapter);
    this.register(redditAdapter);
    this.register(xAdapter);
    this.register(linkedInAdapter);
    this.register(metaAdapter);
    this.register(hackerNewsAdapter);
    this.register(gitHubAdapter);
  }

  register(adapter: SourceAdapter): void {
    this.adapters.set(adapter.id, adapter);
  }

  getAdapter(id: string): SourceAdapter | undefined {
    return this.adapters.get(id);
  }

  getAllAdapters(): SourceAdapter[] {
    return Array.from(this.adapters.values());
  }

  async testAdapter(id: string): Promise<SourceTestResult> {
    const adapter = this.adapters.get(id);
    if (!adapter) {
      return {
        sourceId: id,
        sourceName: "Unknown Source",
        status: "not_supported",
        statusMessage: `No adapter registered with ID: ${id}`,
        testedAt: new Date().toISOString(),
      };
    }

    return await adapter.testConnection();
  }

  async testAllAdapters(): Promise<SourceTestResult[]> {
    const results = await Promise.all(
      Array.from(this.adapters.values()).map((adapter) => adapter.testConnection())
    );
    return results;
  }
}

export const sourceRegistry = new SourceRegistry();
