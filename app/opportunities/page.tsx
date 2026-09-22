"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { OpportunityTable } from "@/components/opportunities/OpportunityTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { mockOpportunities } from "@/lib/opportunities/mock-data";
import type { Opportunity, ServiceCategory, OpportunityStatus } from "@/types";
import { LayoutGrid, List, Zap } from "lucide-react";
import { getServiceDisplayName } from "@/lib/utils";

const SERVICE_FILTER_OPTIONS: Array<{ value: ServiceCategory | "all"; label: string }> = [
  { value: "all", label: "All Services" },
  { value: "ai_agents", label: "AI Agents" },
  { value: "ai_chatbots", label: "AI Chatbots" },
  { value: "ai_automation", label: "AI Automation" },
  { value: "saas_development", label: "SaaS Development" },
  { value: "web_development", label: "Web Development" },
  { value: "video_editing", label: "Video Editing" },
  { value: "whatsapp_automation", label: "WhatsApp Automation" },
  { value: "data_automation", label: "Data Automation" },
];

const STATUS_FILTER_OPTIONS: Array<{ value: OpportunityStatus | "all"; label: string }> = [
  { value: "all", label: "All Status" },
  { value: "new", label: "New" },
  { value: "reviewing", label: "Reviewing" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "converted", label: "Converted" },
  { value: "disqualified", label: "Disqualified" },
];

export default function OpportunitiesPage() {
  const [view, setView] = useState<"cards" | "table">("cards");
  const [serviceFilter, setServiceFilter] = useState<ServiceCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<OpportunityStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"intentScore" | "discoveredAt" | "urgencyScore">("intentScore");

  const filtered: Opportunity[] = mockOpportunities
    .filter((o) => {
      if (serviceFilter !== "all" && o.primaryService !== serviceFilter) return false;
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "intentScore") return b.intentScore - a.intentScore;
      if (sortBy === "urgencyScore") return b.urgencyScore - a.urgencyScore;
      return new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime();
    });

  return (
    <div>
      <PageHeader
        title="Opportunities"
        description="All detected buying signals — sorted by intent strength."
        badge={`${filtered.length} total`}
      />

      {/* Filters + View Toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <select
          id="opportunities-service-filter"
          className="select"
          style={{ width: "auto", minWidth: 160 }}
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value as ServiceCategory | "all")}
        >
          {SERVICE_FILTER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          id="opportunities-status-filter"
          className="select"
          style={{ width: "auto", minWidth: 140 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OpportunityStatus | "all")}
        >
          {STATUS_FILTER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          id="opportunities-sort"
          className="select"
          style={{ width: "auto", minWidth: 160 }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
        >
          <option value="intentScore">Sort: Intent Score</option>
          <option value="urgencyScore">Sort: Urgency</option>
          <option value="discoveredAt">Sort: Date</option>
        </select>

        <div style={{ marginLeft: "auto", display: "flex", gap: "0.25rem" }}>
          <button
            id="opportunities-view-cards-btn"
            className={`btn ${view === "cards" ? "btn-secondary" : "btn-ghost"}`}
            style={{ padding: "0.375rem 0.625rem" }}
            onClick={() => setView("cards")}
            aria-label="Card view"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            id="opportunities-view-table-btn"
            className={`btn ${view === "table" ? "btn-secondary" : "btn-ghost"}`}
            style={{ padding: "0.375rem 0.625rem" }}
            onClick={() => setView("table")}
            aria-label="Table view"
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No opportunities match your filters"
          description="Try changing the service or status filter to see more results."
          action={
            <button
              className="btn btn-secondary"
              onClick={() => {
                setServiceFilter("all");
                setStatusFilter("all");
              }}
            >
              Clear filters
            </button>
          }
        />
      ) : view === "cards" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "1rem",
          }}
        >
          {filtered.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      ) : (
        <div className="card">
          <OpportunityTable opportunities={filtered} />
        </div>
      )}
    </div>
  );
}
