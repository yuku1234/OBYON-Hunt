"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { mockSources } from "@/lib/opportunities/mock-data";
import { formatDate } from "@/lib/utils";
import type { Source, SourceType } from "@/types";
import { Globe, CheckCircle, XCircle, RefreshCw, Sparkles, Check } from "lucide-react";

function SourceRow({
  source,
  onSync,
  isSyncing,
}: {
  source: Source;
  onSync: (sourceType: SourceType) => void;
  isSyncing: boolean;
}) {
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
          {source.lastScrapedAt ? formatDate(source.lastScrapedAt) : "Just now"}
        </div>
        <div className="text-label">last sync</div>
      </div>

      {/* Actions */}
      <button
        className="btn btn-secondary btn-sm"
        style={{ flexShrink: 0, minWidth: 85 }}
        disabled={!source.isActive || isSyncing}
        onClick={() => onSync(source.type)}
        aria-label={`Sync ${source.name}`}
      >
        <RefreshCw size={13} style={{ animation: isSyncing ? "spin 1s linear infinite" : "none" }} />
        {isSyncing ? "Syncing..." : "Sync Now"}
      </button>
    </div>
  );
}

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>(mockSources);
  const [syncingMap, setSyncingMap] = useState<Record<string, boolean>>({});
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const syncSource = async (sourceType?: SourceType) => {
    const key = sourceType ?? "all";
    if (sourceType) {
      setSyncingMap((prev) => ({ ...prev, [sourceType]: true }));
    } else {
      setIsSyncingAll(true);
    }
    setSyncMessage(null);

    try {
      const res = await fetch("/api/sources/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceType }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSyncMessage(`Error: ${data.error ?? "Failed to sync"}`);
        return;
      }

      setSyncMessage(data.message ?? "Sync completed successfully!");

      // Update source counts & lastScrapedAt locally
      setSources((prev) =>
        prev.map((s) => {
          if (!sourceType || s.type === sourceType) {
            return {
              ...s,
              lastScrapedAt: new Date().toISOString(),
              totalOpportunitiesFound: s.totalOpportunitiesFound + (data.result?.newOpportunitiesCount ?? 0),
            };
          }
          return s;
        })
      );
    } catch {
      setSyncMessage("Network error triggering live sync.");
    } finally {
      if (sourceType) {
        setSyncingMap((prev) => ({ ...prev, [sourceType]: false }));
      } else {
        setIsSyncingAll(false);
      }
    }
  };

  return (
    <div>
      <PageHeader
        title="Sources"
        description="Platforms and channels OBYON Signal monitors for buying-intent signals."
        badge="Live Collection Active"
        actions={
          <button
            className="btn btn-primary"
            onClick={() => syncSource()}
            disabled={isSyncingAll}
          >
            <Sparkles size={15} style={{ animation: isSyncingAll ? "spin 1s linear infinite" : "none" }} />
            {isSyncingAll ? "Syncing All Sources..." : "Sync All Sources"}
          </button>
        }
      />

      {/* Sync Status Banner */}
      {syncMessage && (
        <div
          style={{
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: "0.75rem",
            padding: "0.875rem 1.25rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            fontSize: "0.875rem",
            color: "#10b981",
          }}
        >
          <Check size={16} />
          {syncMessage}
        </div>
      )}

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
          <strong style={{ color: "var(--text-primary)" }}>Phase 3 Active:</strong> Connectors for
          Hacker News, Reddit, GitHub, and RSS feeds are live. Click <strong>Sync Now</strong> on any active source to ingest real posts and score intent with Gemini AI.
        </p>
      </div>

      {/* Sources List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {sources.map((source) => (
          <SourceRow
            key={source.id}
            source={source}
            onSync={(type) => syncSource(type)}
            isSyncing={Boolean(syncingMap[source.type]) || isSyncingAll}
          />
        ))}
      </div>

      {/* Coming soon */}
      <div style={{ marginTop: "2rem" }}>
        <h2 className="heading-sm" style={{ marginBottom: "1rem", color: "var(--text-muted)" }}>
          Additional Connectors Roadmap
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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
