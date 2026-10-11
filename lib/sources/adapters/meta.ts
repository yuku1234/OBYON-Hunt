// ============================================================
// Meta (Facebook & Instagram) Adapter — Compliant Search Workflow
// Complies with Meta Platform Terms & Graph API security policies.
// ============================================================

import type {
  SourceAdapter,
  SourceConnectionStatus,
  SourceTestResult,
  SourceDiscoveryInput,
  RawCandidate,
  SourceSetupGuide,
} from "./types";

export class MetaAdapter implements SourceAdapter {
  readonly id = "meta_facebook";
  readonly name = "Meta (Facebook & Instagram)";
  readonly type = "web";
  readonly method = "compliant_search" as const;
  readonly description = "Permitted Meta public group & post search workflow. Generates targeted query URLs without violating Meta platform policies.";
  readonly requiredEnvVars = ["META_APP_ID", "META_APP_SECRET"];

  private lastTestedAt?: string;

  private getCredentials() {
    return {
      appId: process.env.META_APP_ID?.trim() || null,
      appSecret: process.env.META_APP_SECRET?.trim() || null,
    };
  }

  async getStatus(): Promise<{
    status: SourceConnectionStatus;
    statusMessage: string;
    lastTestedAt?: string;
  }> {
    const { appId } = this.getCredentials();
    if (!appId) {
      return {
        status: "permission_required",
        statusMessage: "Meta Graph API public search requires Business Verification and Page Public Content Access. Compliant search link workflow is active.",
        lastTestedAt: this.lastTestedAt,
      };
    }

    return {
      status: this.lastTestedAt ? "connected" : "configuration_required",
      statusMessage: "Meta App credentials detected; permission verification required.",
      lastTestedAt: this.lastTestedAt,
    };
  }

  async testConnection(): Promise<SourceTestResult> {
    const start = Date.now();
    const { appId, appSecret } = this.getCredentials();

    if (!appId || !appSecret) {
      this.lastTestedAt = new Date().toISOString();
      return {
        sourceId: this.id,
        sourceName: this.name,
        status: "permission_required",
        statusMessage: "Compliant Search Link Workflow active. Meta Graph API requires Meta App Review and Business Verification permissions.",
        latencyMs: Date.now() - start,
        testedAt: this.lastTestedAt,
      };
    }

    try {
      const res = await fetch(
        `https://graph.facebook.com/oauth/access_token?client_id=${encodeURIComponent(appId)}&client_secret=${encodeURIComponent(appSecret)}&grant_type=client_credentials`,
        { cache: "no-store" }
      );

      if (!res.ok) {
        return {
          sourceId: this.id,
          sourceName: this.name,
          status: "permission_required",
          statusMessage: "Meta App authentication failed or permissions not granted.",
          latencyMs: Date.now() - start,
          testedAt: new Date().toISOString(),
        };
      }

      this.lastTestedAt = new Date().toISOString();
      return {
        sourceId: this.id,
        sourceName: this.name,
        status: "connected",
        statusMessage: "Successfully authenticated with Meta Graph API client.",
        latencyMs: Date.now() - start,
        testedAt: this.lastTestedAt,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        sourceId: this.id,
        sourceName: this.name,
        status: "temporarily_unavailable",
        statusMessage: `Meta test failed: ${msg}`,
        latencyMs: Date.now() - start,
        testedAt: new Date().toISOString(),
      };
    }
  }

  async discover(_input: SourceDiscoveryInput): Promise<RawCandidate[]> {
    // Automated scraping of Facebook/Instagram is prohibited by Meta terms.
    // Compliant link generator provides one-click exploration for authorized users.
    return [];
  }

  getSetupGuide(): SourceSetupGuide {
    return {
      title: "Meta (Facebook / Instagram) Lead Discovery Workflow",
      description: "Direct compliant search workflow and Meta Graph API setup.",
      consoleUrl: "https://developers.facebook.com/apps",
      requiredEnvVars: [
        {
          key: "META_APP_ID",
          description: "Meta Developer App ID.",
          required: false,
        },
        {
          key: "META_APP_SECRET",
          description: "Meta Developer App Secret.",
          required: false,
        },
      ],
      complianceNotes: "Adheres strictly to Meta Platform Terms. Scraping without authorization violates Meta policy. We provide compliant direct search workflows to open genuine group discussions and business posts.",
      steps: [
        "1. Direct compliant search links are automatically generated in Discover runs.",
        "2. To integrate official Meta Page Webhooks or Lead Ads, visit Meta for Developers (https://developers.facebook.com/apps).",
        "3. Complete Business Verification and request Page Public Content Access or Leadgen webhook permissions.",
        "4. Configure META_APP_ID and META_APP_SECRET in .env.local.",
      ],
    };
  }

  generateCompliantSearchUrl(input: { service: string; problem: string; location?: string }): string {
    const q = `"looking for" OR "need" "${input.service}" ${input.problem} ${input.location || ""}`.trim();
    return `https://www.facebook.com/search/posts/?q=${encodeURIComponent(q)}`;
  }
}

export const metaAdapter = new MetaAdapter();
