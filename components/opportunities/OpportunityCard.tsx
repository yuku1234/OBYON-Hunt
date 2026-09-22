"use client";

import Link from "next/link";
import type { Opportunity } from "@/types";
import {
  formatDate,
  getStatusStyle,
  getIntentStrengthStyle,
  getServiceDisplayName,
  truncate,
} from "@/lib/utils";
import { IntentScoreBadge } from "./IntentBadge";
import { UrgencyBadge } from "./UrgencyBadge";
import { MapPin, ExternalLink } from "lucide-react";

interface OpportunityCardProps {
  opportunity: Opportunity;
}

const SOURCE_COLORS: Record<string, string> = {
  linkedin: "#0077b5",
  twitter: "#1da1f2",
  reddit: "#ff4500",
  hackernews: "#ff6600",
  upwork: "#14a800",
  fiverr: "#1dbf73",
  producthunt: "#da552f",
  github: "#6e40c9",
  default: "#6366f1",
};

export function OpportunityCard({ opportunity: opp }: OpportunityCardProps) {
  const statusStyle = getStatusStyle(opp.status);
  const intentStyle = getIntentStrengthStyle(opp.intentStrength);
  const sourceColor = SOURCE_COLORS[opp.sourceType] ?? SOURCE_COLORS.default;

  return (
    <Link
      href={`/opportunities/${opp.id}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <article
        className="card animate-fade-in"
        style={{
          padding: "1.25rem",
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 8px 32px rgba(0,0,0,0.4)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "0.75rem",
            marginBottom: "0.875rem",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Source pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.375rem",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  color: sourceColor,
                  background: `${sourceColor}18`,
                  border: `1px solid ${sourceColor}30`,
                  padding: "0.125rem 0.5rem",
                  borderRadius: 9999,
                }}
              >
                {opp.sourceName}
              </span>
              <span className={`badge ${intentStyle.className}`}>
                {intentStyle.label}
              </span>
              <span className={`badge ${statusStyle.className}`}>
                {statusStyle.label}
              </span>
            </div>

            {/* Title */}
            <h3
              style={{
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                lineHeight: 1.4,
                marginBottom: "0.375rem",
              }}
            >
              {truncate(opp.title, 90)}
            </h3>

            {/* Author + location */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                fontSize: "0.8125rem",
                color: "var(--text-muted)",
              }}
            >
              <span>{opp.authorName}</span>
              {opp.companyName && (
                <>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span>{opp.companyName}</span>
                </>
              )}
              {opp.location && (
                <>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <MapPin size={11} />
                    {opp.location}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Intent Score */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.25rem",
              flexShrink: 0,
            }}
          >
            <IntentScoreBadge score={opp.intentScore} size="lg" />
            <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
              Intent
            </span>
          </div>
        </div>

        {/* Detected need */}
        <div
          style={{
            background: "var(--surface-3)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "0.5rem",
            padding: "0.625rem 0.75rem",
            marginBottom: "0.875rem",
          }}
        >
          <div
            style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "0.25rem",
            }}
          >
            Detected Need
          </div>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {truncate(opp.detectedNeed, 120)}
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                padding: "0.1875rem 0.5rem",
                borderRadius: 9999,
                background: "rgba(99, 102, 241, 0.08)",
                color: "#a5b4fc",
                border: "1px solid rgba(99, 102, 241, 0.15)",
              }}
            >
              {getServiceDisplayName(opp.primaryService)}
            </span>
            <UrgencyBadge urgency={opp.urgency} />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
            }}
          >
            <span>{formatDate(opp.publishedAt)}</span>
            <ExternalLink size={11} />
          </div>
        </div>
      </article>
    </Link>
  );
}
