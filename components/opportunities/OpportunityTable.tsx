"use client";

import { useState } from "react";
import Link from "next/link";
import type { Opportunity, LeadStatus } from "@/types";
import {
  formatDate,
  getStatusStyle,
  getServiceDisplayName,
  getBuyerClassificationStyle,
  truncate,
} from "@/lib/utils";
import { IntentScoreBadge } from "./IntentBadge";
import { UrgencyBadge } from "./UrgencyBadge";
import { ExternalLink } from "lucide-react";

interface OpportunityTableProps {
  opportunities: Opportunity[];
  onStatusChange?: (id: string, newStatus: LeadStatus) => void;
}

const LEAD_STATUS_OPTIONS: LeadStatus[] = [
  "NEW",
  "QUALIFIED",
  "CONTACTED",
  "REPLIED",
  "MEETING",
  "WON",
  "LOST",
];

const SOURCE_COLORS: Record<string, string> = {
  linkedin: "#0077b5",
  twitter: "#1da1f2",
  reddit: "#ff4500",
  hackernews: "#ff6600",
  upwork: "#14a800",
  github: "#6e40c9",
  default: "#6366f1",
};

export function OpportunityTable({ opportunities, onStatusChange }: OpportunityTableProps) {
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});

  const handleStatusChange = async (id: string, newStatus: LeadStatus) => {
    setStatusMap((prev) => ({ ...prev, [id]: newStatus }));
    try {
      await fetch(`/api/opportunities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (onStatusChange) {
        onStatusChange(id, newStatus);
      }
    } catch (err) {
      console.error("Failed to update status in table:", err);
    }
  };

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
        No verified opportunities found.
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
            <th>Original Source</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.map((opp) => {
            const currentStatus = statusMap[opp.id] || opp.status || "NEW";
            const sourceColor = SOURCE_COLORS[opp.sourceType] ?? SOURCE_COLORS.default;
            const buyerStyle = getBuyerClassificationStyle(opp.buyerClassification);

            return (
              <tr key={opp.id}>
                {/* Title & Detected Need */}
                <td style={{ maxWidth: 280 }}>
                  <Link
                    href={`/opportunities/${opp.id}`}
                    style={{
                      textDecoration: "none",
                      color: "var(--text-primary)",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      display: "block",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {truncate(opp.title, 60)}
                  </Link>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      margin: 0,
                      lineHeight: 1.3,
                    }}
                  >
                    {truncate(opp.detectedNeed, 80)}
                  </p>
                </td>

                {/* Source Platform */}
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
                    {opp.sourcePlatform || opp.sourceName}
                  </span>
                </td>

                {/* Service */}
                <td>
                  <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                    {getServiceDisplayName(opp.primaryService)}
                  </span>
                </td>

                {/* Intent Score */}
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <IntentScoreBadge score={opp.intentScore} size="sm" />
                    <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {opp.intentScore}
                    </span>
                  </div>
                </td>

                {/* Urgency */}
                <td>
                  <UrgencyBadge urgency={opp.urgency} />
                </td>

                {/* Lead Status Dropdown */}
                <td>
                  <select
                    value={currentStatus}
                    onChange={(e) => handleStatusChange(opp.id, e.target.value as LeadStatus)}
                    className="select"
                    style={{
                      fontSize: "0.6875rem",
                      padding: "0.2rem 0.4rem",
                      minHeight: 24,
                      borderRadius: "0.375rem",
                      background: "var(--surface-3)",
                      fontWeight: 600,
                    }}
                    aria-label="Lead Status"
                  >
                    {LEAD_STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </td>

                {/* View Original Source Link */}
                <td>
                  <a
                    href={opp.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontSize: "0.6875rem",
                      padding: "0.25rem 0.5rem",
                    }}
                    title={opp.sourceUrl}
                  >
                    <ExternalLink size={11} />
                    Open Source
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
