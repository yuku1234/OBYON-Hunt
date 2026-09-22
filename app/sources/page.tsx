import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { mockSources } from "@/lib/opportunities/mock-data";
import { formatDate } from "@/lib/utils";
import { Globe, CheckCircle, XCircle, RefreshCw, Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Sources",
};

function SourceRow({ source }: { source: (typeof mockSources)[0] }) {
  return (
    <div
      className="card"
      style={{
        padding: "1.125rem 1.25rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      {/* Status dot */}
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: source.isActive ? "#10b981" : "#52525b",
          flexShrink: 0,
          boxShadow: source.isActive ? "0 0 6px rgba(16,185,129,0.5)" : "none",
        }}
      />

      {/* Name + URL */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-primary)" }}>
          {source.name}
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.125rem" }}>
          {source.url}
        </div>
      </div>

      {/* Status */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", minWidth: 110 }}>
        {source.isActive ? (
          <>
            <CheckCircle size={13} color="#10b981" />
            <span style={{ fontSize: "0.8125rem", color: "#10b981", fontWeight: 500 }}>Active</span>
          </>
        ) : (
          <>
            <XCircle size={13} color="#52525b" />
            <span style={{ fontSize: "0.8125rem", color: "#52525b", fontWeight: 500 }}>Inactive</span>
          </>
        )}
      </div>

      {/* Opportunities found */}
      <div style={{ textAlign: "center", minWidth: 80 }}>
        <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>
          {source.totalOpportunitiesFound}
        </div>
        <div className="text-label">signals</div>
      </div>

      {/* Last synced */}
      <div style={{ textAlign: "right", minWidth: 100 }}>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          {source.lastScrapedAt ? formatDate(source.lastScrapedAt) : "Never synced"}
        </div>
        <div className="text-label">last sync</div>
      </div>

      {/* Actions */}
      <button
        className="btn btn-ghost btn-sm"
        style={{ flexShrink: 0 }}
        disabled={!source.isActive}
        aria-label={`Sync ${source.name}`}
      >
        <RefreshCw size={13} />
        Sync
      </button>
    </div>
  );
}

export default function SourcesPage() {
  return (
    <div>
      <PageHeader
        title="Sources"
        description="Platforms and channels OBYON Signal monitors for buying-intent signals."
        badge="Phase 1"
        actions={
          <button className="btn btn-secondary" disabled>
            <Plus size={15} />
            Add Source
          </button>
        }
      />

      {/* Banner */}
      <div
        style={{
          background: "rgba(99,102,241,0.05)",
          border: "1px solid rgba(99,102,241,0.15)",
          borderRadius: "0.75rem",
          padding: "1rem 1.25rem",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <Globe size={16} color="#6366f1" />
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0 }}>
          <strong style={{ color: "var(--text-primary)" }}>Phase 1:</strong> Source connections are
          configured but data collection is not yet active. Live scraping integrations will be
          enabled in Phase 2.
        </p>
      </div>

      {/* Sources List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {mockSources.map((source) => (
          <SourceRow key={source.id} source={source} />
        ))}
      </div>

      {/* Coming soon */}
      <div style={{ marginTop: "2rem" }}>
        <h2 className="heading-sm" style={{ marginBottom: "1rem", color: "var(--text-muted)" }}>
          Coming in Phase 2
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "0.625rem",
          }}
        >
          {["Fiverr", "Product Hunt", "Quora", "YouTube Comments", "Facebook Groups", "Discord"].map(
            (name) => (
              <div
                key={name}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  background: "var(--surface-2)",
                  border: "1px dashed var(--border-subtle)",
                  fontSize: "0.875rem",
                  color: "var(--text-muted)",
                  textAlign: "center",
                }}
              >
                {name}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
