"use client";

import Link from "next/link";
import type { Opportunity } from "@/types";
import {
  formatDate,
  getStatusStyle,
  getServiceDisplayName,
  truncate,
} from "@/lib/utils";
import { IntentScoreBadge } from "./IntentBadge";
import { UrgencyBadge } from "./UrgencyBadge";

interface OpportunityTableProps {
  opportunities: Opportunity[];
}

const SOURCE_COLORS: Record<string, string> = {
  linkedin: "#0077b5",
  twitter: "#1da1f2",
  reddit: "#ff4500",
  hackernews: "#ff6600",
  default: "#6366f1",
};

export function OpportunityTable({ opportunities }: OpportunityTableProps) {
  if (opportunities.length === 0) {
    return (
      <div
        style={{
          padding: "3rem",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "0.875rem",
        }}
      >
        No opportunities found.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Opportunity</th>
            <th>Source</th>
            <th>Matched Service</th>
            <th>Intent</th>
            <th>Urgency</th>
            <th>Status</th>
            <th>Discovered</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.map((opp) => {
            const statusStyle = getStatusStyle(opp.status);
            const sourceColor = SOURCE_COLORS[opp.sourceType] ?? SOURCE_COLORS.default;

            return (
              <tr key={opp.id}>
                {/* Opportunity */}
                <td style={{ maxWidth: 300 }}>
                  <Link
                    href={`/opportunities/${opp.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "var(--text-primary)",
                        marginBottom: "0.125rem",
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.color = "#a5b4fc";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                      }}
                    >
                      {truncate(opp.title, 70)}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {opp.authorName}
                      {opp.companyName && ` · ${opp.companyName}`}
                    </div>
                  </Link>
                </td>

                {/* Source */}
                <td>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      color: sourceColor,
                      background: `${sourceColor}18`,
                      border: `1px solid ${sourceColor}30`,
                      padding: "0.125rem 0.5rem",
                      borderRadius: 9999,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {opp.sourceName}
                  </span>
                </td>

                {/* Service */}
                <td>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 500,
                      color: "#a5b4fc",
                      background: "rgba(99, 102, 241, 0.08)",
                      border: "1px solid rgba(99, 102, 241, 0.15)",
                      padding: "0.125rem 0.5rem",
                      borderRadius: 9999,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {getServiceDisplayName(opp.primaryService)}
                  </span>
                </td>

                {/* Intent Score */}
                <td>
                  <IntentScoreBadge score={opp.intentScore} size="sm" />
                </td>

                {/* Urgency */}
                <td>
                  <UrgencyBadge urgency={opp.urgency} />
                </td>

                {/* Status */}
                <td>
                  <span className={`badge ${statusStyle.className}`}>
                    {statusStyle.label}
                  </span>
                </td>

                {/* Date */}
                <td style={{ whiteSpace: "nowrap", fontSize: "0.8125rem" }}>
                  {formatDate(opp.discoveredAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
