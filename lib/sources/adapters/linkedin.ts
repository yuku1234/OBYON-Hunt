// ============================================================
// LinkedIn Adapter — Compliant Public Search Workflow
// Strictly adheres to LinkedIn Developer Terms & anti-scraping policies.
// Uses official partner API when configured or compliant deep-search workflow.
// ============================================================

import type {
  SourceAdapter,
  SourceConnectionStatus,
  SourceTestResult,
  SourceDiscoveryInput,
  RawCandidate,
  SourceSetupGuide,
} from "./types";

export class LinkedInAdapter implements SourceAdapter {
  readonly id = "linkedin";
  readonly name = "LinkedIn";
  readonly type = "linkedin";
  readonly method = "compliant_search" as const;
  readonly description = "Permitted LinkedIn buyer-discovery workflow. Generates exact query strings and direct content search links without scraping restricted member data.";
  readonly requiredEnvVars = ["LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET"];

  private lastTestedAt?: string;

  private getCredentials() {
    return {
      clientId: process.env.LINKEDIN_CLIENT_ID?.trim() || null,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET?.trim() || null,
    };
  }

  async getStatus(): Promise<{
    status: SourceConnectionStatus;
    statusMessage: string;
    lastTestedAt?: string;
  }> {
    const { clientId } = this.getCredentials();
    if (!clientId) {
      return {
        status: "permission_required",
        statusMessage: "Official LinkedIn Lead Sync API requires enterprise app approval. Compliant public-search workflow is active.",
        lastTestedAt: this.lastTestedAt,
      };
    }

    return {
      status: this.lastTestedAt ? "connected" : "configuration_required",
      statusMessage: "LinkedIn app credentials configured; enterprise permissions check required.",
      lastTestedAt: this.lastTestedAt,
    };
  }

  async testConnection(): Promise<SourceTestResult> {
    const start = Date.now();
    const { clientId, clientSecret } = this.getCredentials();

    if (!clientId || !clientSecret) {
      this.lastTestedAt = new Date().toISOString();
      return {
        sourceId: this.id,
        sourceName: this.name,
        status: "permission_required",
        statusMessage: "Compliant Search Workflow active. Official LinkedIn Lead Sync API requires enterprise partnership approval from LinkedIn.",
        latencyMs: Date.now() - start,
        testedAt: this.lastTestedAt,
      };
    }

    // If developer credentials are provided, test token endpoint
    try {
      const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`,
        cache: "no-store",
      });

      if (res.status === 400 || res.status === 401) {
        return {
          sourceId: this.id,
          sourceName: this.name,
          status: "permission_required",
          statusMessage: "LinkedIn API app credentials rejected or enterprise Lead Sync permissions not approved.",
          latencyMs: Date.now() - start,
          testedAt: new Date().toISOString(),
        };
      }

      this.lastTestedAt = new Date().toISOString();
      return {
        sourceId: this.id,
        sourceName: this.name,
        status: "connected",
        statusMessage: "LinkedIn Developer API responded successfully.",
        latencyMs: Date.now() - start,
        testedAt: this.lastTestedAt,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        sourceId: this.id,
        sourceName: this.name,
        status: "temporarily_unavailable",
        statusMessage: `LinkedIn test failed: ${msg}`,
        latencyMs: Date.now() - start,
        testedAt: new Date().toISOString(),
      };
    }
  }

  async discover(_input: SourceDiscoveryInput): Promise<RawCandidate[]> {
    // Note: Automated scraping of logged-in LinkedIn member profiles violates platform terms and is prohibited.
    // Publicly indexed LinkedIn posts are discovered legitimately via the Google Web Grounding adapter.
    return [];
  }

  getSetupGuide(): SourceSetupGuide {
    return {
      title: "LinkedIn Compliant Lead Discovery Workflow",
      description: "Direct compliant search link generator and enterprise Lead Sync integration.",
      consoleUrl: "https://www.linkedin.com/developers/apps",
      requiredEnvVars: [
        {
          key: "LINKEDIN_CLIENT_ID",
          description: "LinkedIn Developer App Client ID (for official Lead Sync integration).",
          required: false,
        },
        {
          key: "LINKEDIN_CLIENT_SECRET",
          description: "LinkedIn Developer App Client Secret.",
          required: false,
        },
      ],
      complianceNotes: "OBYON Hunt strictly complies with LinkedIn's User Agreement. We never scrape logged-in member data, bypass authentication, or violate platform terms. Public indexed posts are surfaced via Google Search Grounding, and direct search workflows open genuine LinkedIn search results for authorized user review.",
      steps: [
        "1. Direct compliant search links are automatically generated in Discover queries.",
        "2. To connect the official LinkedIn Lead Sync API, visit LinkedIn Developer Portal (https://www.linkedin.com/developers/apps).",
        "3. Create an enterprise app and request the 'Lead Sync API' or 'Community Management API' products.",
        "4. Add LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET to .env.local when approved.",
      ],
    };
  }

  generateCompliantSearchUrl(input: { service: string; problem: string; location?: string }): string {
    const q = `"looking for" OR "hiring" "${input.service}" ${input.problem} ${input.location || ""}`.trim();
    return `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(q)}&sortBy="date_posted"`;
  }
}

export const linkedInAdapter = new LinkedInAdapter();
