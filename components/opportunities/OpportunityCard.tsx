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
import {
  MapPin,
  ExternalLink,
  Flame,
  CheckCircle2,
  FileText,
  DollarSign,
  ShieldCheck,
  Building2,
} from "lucide-react";

interface OpportunityCardProps {
  opportunity: Opportunity;
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
  fiverr: "#1dbf73",
  producthunt: "#da552f",
  github: "#6e40c9",
  default: "#6366f1",
};

export function OpportunityCard({
  opportunity: opp,
  onStatusChange,
}: OpportunityCardProps) {
  const [currentStatus, setCurrentStatus] = useState<string>(opp.status || "NEW");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const statusStyle = getStatusStyle(currentStatus);
  const buyerStyle = getBuyerClassificationStyle(opp.buyerClassification);
  const sourceColor = SOURCE_COLORS[opp.sourceType] ?? SOURCE_COLORS.default;

  const handleStatusSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const newStatus = e.target.value as LeadStatus;
    setCurrentStatus(newStatus);
    setIsUpdatingStatus(true);

    try {
      await fetch(`/api/opportunities/${opp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (onStatusChange) {
        onStatusChange(opp.id, newStatus);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const openSource = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(opp.sourceUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <article
      className="card animate-fade-in"
      style={{
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.875rem",
        position: "relative",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.4)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.4)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {/* Header bar: Source + Buyer badge + Lead status selector */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexWrap: "wrap" }}>
          {/* Source Platform Badge */}
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
            {opp.sourcePlatform || opp.sourceName}
          </span>

          {/* Buyer Classification Badge */}
          <span className={`badge ${buyerStyle.className}`} style={{ fontSize: "0.6875rem" }}>
            <CheckCircle2 size={11} style={{ marginRight: 3, display: "inline" }} />
            {opp.buyerClassification || "BUYER"}
          </span>
        </div>

        {/* Lead Status Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <select
            value={currentStatus}
            onChange={handleStatusSelect}
            onClick={(e) => e.stopPropagation()}
            disabled={isUpdatingStatus}
            className="select"
            style={{
              fontSize: "0.6875rem",
              padding: "0.2rem 0.5rem",
              height: "auto",
              minHeight: 24,
              borderRadius: "0.375rem",
              background: "var(--surface-3)",
              fontWeight: 600,
            }}
            aria-label="Lead Status"
          >
            {LEAD_STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Row: Title & Intent Score */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "0.75rem",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link
            href={`/opportunities/${opp.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                lineHeight: 1.4,
                marginBottom: "0.375rem",
              }}
            >
              {truncate(opp.title, 110)}
            </h3>
          </Link>

          {/* Author / Company / Location */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              flexWrap: "wrap",
            }}
          >
            <span>{opp.authorName}</span>
            {opp.companyName && (
              <>
                <span style={{ opacity: 0.4 }}>·</span>
                <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Building2 size={11} />
                  {opp.companyName}
                </span>
              </>
            )}
            {opp.location && (
              <>
                <span style={{ opacity: 0.4 }}>·</span>
                <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <MapPin size={11} />
                  {opp.location}
                </span>
              </>
            )}
            <span style={{ opacity: 0.4 }}>·</span>
            <span>Discovered {formatDate(opp.discoveredAt)}</span>
          </div>
        </div>

        {/* Intent Score Hero Badge */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.125rem",
            flexShrink: 0,
            background: "rgba(99,102,241,0.06)",
            border: "1px solid rgba(99,102,241,0.15)",
            borderRadius: "0.5rem",
            padding: "0.375rem 0.625rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              fontSize: "1.25rem",
              fontWeight: 800,
              color: opp.intentScore >= 80 ? "#818cf8" : opp.intentScore >= 60 ? "#fbbf24" : "#9ca3af",
            }}
          >
            <Flame size={15} />
            {opp.intentScore}
          </div>
          <span style={{ fontSize: "0.625rem", color: "var(--text-muted)", fontWeight: 600 }}>
            INTENT
          </span>
        </div>
      </div>

      {/* Detected Need & Problem */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.5rem",
        }}
      >
        <div
          style={{
            background: "var(--surface-3)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "0.375rem",
            padding: "0.5rem 0.625rem",
          }}
        >
          <div
            style={{
              fontSize: "0.625rem",
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "0.125rem",
            }}
          >
            Detected Need
          </div>
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--text-secondary)",
              lineHeight: 1.4,
              margin: 0,
            }}
          >
            {truncate(opp.detectedNeed, 95)}
          </p>
        </div>

        <div
          style={{
            background: "var(--surface-3)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "0.375rem",
            padding: "0.5rem 0.625rem",
          }}
        >
          <div
            style={{
              fontSize: "0.625rem",
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "0.125rem",
            }}
          >
            Detected Problem
          </div>
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--text-secondary)",
              lineHeight: 1.4,
              margin: 0,
            }}
          >
            {truncate(opp.detectedProblem, 95)}
          </p>
        </div>
      </div>

      {/* Evidence / Verbatim Snippet */}
      {opp.evidence && (
        <div
          style={{
            background: "rgba(0,0,0,0.25)",
            borderLeft: "2px solid #6366f1",
            padding: "0.5rem 0.75rem",
            borderRadius: "0 0.375rem 0.375rem 0",
          }}
        >
          <div
            style={{
              fontSize: "0.625rem",
              color: "#a5b4fc",
              fontWeight: 700,
              textTransform: "uppercase",
              marginBottom: "0.125rem",
            }}
          >
            Evidence
          </div>
          <p
            style={{
              fontSize: "0.8125rem",
              fontStyle: "italic",
              color: "var(--text-secondary)",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            &ldquo;{truncate(opp.evidence, 140)}&rdquo;
          </p>
        </div>
      )}

      {/* Why Considered a Buyer */}
      {opp.reasoning && (
        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            lineHeight: 1.4,
            background: "var(--surface-2)",
            padding: "0.375rem 0.625rem",
            borderRadius: "0.375rem",
          }}
        >
          <strong style={{ color: "var(--text-secondary)" }}>Why Buyer:</strong> {truncate(opp.reasoning, 120)}
        </div>
      )}

      {/* Signals & Badges bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexWrap: "wrap",
          fontSize: "0.75rem",
        }}
      >
        <span
          style={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            padding: "0.125rem 0.5rem",
            borderRadius: 9999,
            background: "rgba(99, 102, 241, 0.08)",
            color: "#a5b4fc",
            border: "1px solid rgba(99, 102, 241, 0.15)",
          }}
        >
          {getServiceDisplayName(opp.primaryService)}
        </span>

        <UrgencyBadge urgency={opp.urgency} />

        {opp.budgetSignal !== "no_signal" && (
          <span
            style={{
              fontSize: "0.6875rem",
              display: "flex",
              alignItems: "center",
              gap: 2,
              color: "#34d399",
              background: "rgba(52, 211, 153, 0.1)",
              padding: "0.125rem 0.375rem",
              borderRadius: "0.25rem",
            }}
          >
            <DollarSign size={11} />
            {opp.budgetSignal.replace("_", " ")}
          </span>
        )}

        <span
          style={{
            fontSize: "0.6875rem",
            display: "flex",
            alignItems: "center",
            gap: 2,
            color: "var(--text-muted)",
          }}
        >
          <ShieldCheck size={11} />
          {opp.confidenceScore}% Conf.
        </span>
      </div>

      {/* Footer Actions: [VIEW ORIGINAL SOURCE] & [Details] */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.5rem",
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "0.75rem",
          marginTop: "auto",
        }}
      >
        {/* VIEW ORIGINAL SOURCE Button - Required */}
        <button
          onClick={openSource}
          className="btn btn-primary btn-sm"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
            fontSize: "0.75rem",
            fontWeight: 600,
          }}
          title={opp.sourceUrl}
        >
          <ExternalLink size={13} />
          VIEW ORIGINAL SOURCE
        </button>

        <Link
          href={`/opportunities/${opp.id}`}
          className="btn btn-ghost btn-sm"
          style={{ fontSize: "0.75rem" }}
        >
          <FileText size={13} />
          Full Details & Notes
        </Link>
      </div>
    </article>
  );
}
