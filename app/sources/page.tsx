"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Globe,
  CheckCircle,
  AlertTriangle,
  Lock,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  Server,
  Zap,
} from "lucide-react";
import type { SourceConnectionStatus, IntegrationMethod } from "@/lib/sources/adapters/types";

interface SourceItem {
  id: string;
  name: string;
  type: string;
  method: IntegrationMethod;
  description: string;
  status: SourceConnectionStatus;
  statusMessage: string;
  lastTestedAt: string | null;
  requiredEnvVars: string[];
  setupGuide: {
    title: string;
    description: string;
    consoleUrl?: string;
    requiredEnvVars: Array<{ key: string; description: string; required: boolean }>;
    complianceNotes: string;
    steps: string[];
  };
  totalOpportunitiesFound: number;
}

function getStatusBadge(status: SourceConnectionStatus) {
  switch (status) {
    case "connected":
      return {
        label: "Connected & Tested",
        color: "#10b981",
        bg: "rgba(16,185,129,0.1)",
        border: "rgba(16,185,129,0.3)",
        icon: <CheckCircle size={14} color="#10b981" />,
      };
    case "configuration_required":
      return {
        label: "Configuration Required",
        color: "#f59e0b",
        bg: "rgba(245,158,11,0.1)",
        border: "rgba(245,158,11,0.3)",
        icon: <AlertTriangle size={14} color="#f59e0b" />,
      };
    case "permission_required":
      return {
        label: "Permission Required / Workflow Active",
        color: "#6366f1",
        bg: "rgba(99,102,241,0.1)",
        border: "rgba(99,102,241,0.3)",
        icon: <Lock size={14} color="#6366f1" />,
      };
    case "temporarily_unavailable":
      return {
        label: "Temporarily Unavailable",
        color: "#ef4444",
        bg: "rgba(239,68,68,0.1)",
        border: "rgba(239,68,68,0.3)",
        icon: <AlertTriangle size={14} color="#ef4444" />,
      };
    case "not_supported":
    default:
      return {
        label: "Not Supported",
        color: "#71717a",
        bg: "rgba(113,113,122,0.1)",
        border: "rgba(113,113,122,0.3)",
        icon: <Info size={14} color="#71717a" />,
      };
  }
}

function getMethodLabel(method: IntegrationMethod) {
  switch (method) {
    case "grounding":
      return "Google Grounding";
    case "official_api":
      return "Official API";
    case "compliant_search":
      return "Compliant Workflow";
    case "public_index":
      return "Public Index";
    default:
      return method;
  }
}

export default function SourcesPage() {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testingMap, setTestingMap] = useState<Record<string, boolean>>({});
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>(null);
  const [testResultMessages, setTestResultMessages] = useState<Record<string, string>>({});

  const loadSources = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/sources");
      if (res.ok) {
        const data = await res.json();
        setSources(data.sources || []);
      }
    } catch (err) {
      console.error("Failed to fetch sources:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  const handleTestSource = async (sourceId: string) => {
    setTestingMap((prev) => ({ ...prev, [sourceId]: true }));
    try {
      const res = await fetch("/api/sources/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId }),
      });
      const data = await res.json();
      if (data.result) {
        setTestResultMessages((prev) => ({
          ...prev,
          [sourceId]: data.result.statusMessage,
        }));
        // Update source status locally
        setSources((prev) =>
          prev.map((s) =>
            s.id === sourceId
              ? {
                  ...s,
                  status: data.result.status,
                  statusMessage: data.result.statusMessage,
                  lastTestedAt: data.result.testedAt,
                }
              : s
          )
        );
      }
    } catch {
      setTestResultMessages((prev) => ({
        ...prev,
        [sourceId]: "Network error testing source.",
      }));
    } finally {
      setTestingMap((prev) => ({ ...prev, [sourceId]: false }));
    }
  };

  const handleTestAll = async () => {
    setIsTestingAll(true);
    try {
      const res = await fetch("/api/sources/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (Array.isArray(data.results)) {
        const msgMap: Record<string, string> = {};
        for (const r of data.results) {
          msgMap[r.sourceId] = r.statusMessage;
        }
        setTestResultMessages(msgMap);
        await loadSources();
      }
    } catch (err) {
      console.error("Error testing all sources:", err);
    } finally {
      setIsTestingAll(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Source Management"
        description="Monitor live adapter connections, developer API credentials, and compliant search workflows."
        badge={`${sources.length} Registered Sources`}
        actions={
          <button
            className="btn btn-primary"
            onClick={handleTestAll}
            disabled={isTestingAll || isLoading}
          >
            <RefreshCw size={14} style={{ animation: isTestingAll ? "spin 1s linear infinite" : "none" }} />
            {isTestingAll ? "Testing All Adapters..." : "Test All Sources"}
          </button>
        }
      />

      {/* Overview Notice */}
      <div
        style={{
          background: "rgba(99,102,241,0.06)",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: "0.75rem",
          padding: "1rem 1.25rem",
          marginBottom: "1.75rem",
          display: "flex",
          alignItems: "center",
          gap: "0.875rem",
        }}
      >
        <Server size={18} color="#6366f1" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
          <strong style={{ color: "var(--text-primary)" }}>Zero-Mock Architecture:</strong> Sources report their genuine connection state. OBYON Hunt never fabricates results, scrapes behind logins, or shows a source as connected until a real API test succeeds.
        </p>
      </div>

      {/* Sources List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {isLoading ? (
          <div className="card" style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-muted)" }}>
            <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            Loading source adapters and connection health...
          </div>
        ) : (
          sources.map((source) => {
            const badge = getStatusBadge(source.status);
            const isTesting = Boolean(testingMap[source.id]) || isTestingAll;
            const isExpanded = expandedGuideId === source.id;
            const testMsg = testResultMessages[source.id];

            return (
              <div
                key={source.id}
                className="card"
                style={{
                  padding: "1.25rem 1.5rem",
                  borderColor: isExpanded ? "rgba(99,102,241,0.3)" : undefined,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                  {/* Left: Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>
                        {source.name}
                      </span>
                      {/* Integration Method Tag */}
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 500,
                          padding: "0.125rem 0.5rem",
                          borderRadius: "9999px",
                          background: "var(--surface-3)",
                          color: "var(--text-muted)",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        {getMethodLabel(source.method)}
                      </span>
                      {/* Status Badge */}
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.375rem",
                          padding: "0.1875rem 0.625rem",
                          borderRadius: "9999px",
                          background: badge.bg,
                          border: `1px solid ${badge.border}`,
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          color: badge.color,
                        }}
                      >
                        {badge.icon}
                        {badge.label}
                      </div>
                    </div>

                    <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", margin: "0.375rem 0 0.5rem 0" }}>
                      {source.description}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", fontSize: "0.75rem", color: "var(--text-muted)", flexWrap: "wrap" }}>
                      <span>
                        Opportunities Found: <strong style={{ color: "var(--text-primary)" }}>{source.totalOpportunitiesFound}</strong>
                      </span>
                      <span>
                        Last Check: {source.lastTestedAt ? new Date(source.lastTestedAt).toLocaleTimeString() : "Not tested yet"}
                      </span>
                    </div>

                    {/* Status / Test message */}
                    <div
                      style={{
                        marginTop: "0.625rem",
                        fontSize: "0.75rem",
                        color: source.status === "connected" ? "#10b981" : "var(--text-muted)",
                        background: "var(--surface-2)",
                        padding: "0.375rem 0.75rem",
                        borderRadius: "0.375rem",
                        display: "inline-block",
                      }}
                    >
                      {testMsg || source.statusMessage}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleTestSource(source.id)}
                      disabled={isTesting}
                      aria-label={`Test connection for ${source.name}`}
                    >
                      <RefreshCw
                        size={13}
                        style={{ animation: isTesting ? "spin 1s linear infinite" : "none" }}
                      />
                      {isTesting ? "Testing..." : "Test"}
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setExpandedGuideId(isExpanded ? null : source.id)}
                      style={{ padding: "0.375rem 0.5rem" }}
                      title="Setup Guide"
                    >
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Setup & Compliance Guide */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: "1.25rem",
                      paddingTop: "1.25rem",
                      borderTop: "1px solid var(--border-subtle)",
                      background: "rgba(0,0,0,0.15)",
                      padding: "1rem",
                      borderRadius: "0.5rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                      <h4 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                        {source.setupGuide.title}
                      </h4>
                      {source.setupGuide.consoleUrl && (
                        <a
                          href={source.setupGuide.consoleUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: "0.75rem",
                            color: "#6366f1",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            textDecoration: "none",
                          }}
                        >
                          Developer Console <ExternalLink size={12} />
                        </a>
                      )}
                    </div>

                    {/* Required Env Vars */}
                    {source.setupGuide.requiredEnvVars.length > 0 && (
                      <div style={{ marginBottom: "0.75rem" }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.375rem" }}>
                          Required in .env.local:
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                          {source.setupGuide.requiredEnvVars.map((v) => (
                            <div
                              key={v.key}
                              style={{
                                fontSize: "0.75rem",
                                background: "var(--surface-3)",
                                padding: "0.375rem 0.625rem",
                                borderRadius: "0.375rem",
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <code style={{ color: "#a5b4fc" }}>{v.key}</code>
                              <span style={{ color: "var(--text-muted)" }}>{v.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step-by-Step Instructions */}
                    <div style={{ marginBottom: "0.75rem" }}>
                      <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                        Setup Instructions:
                      </div>
                      <ol style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                        {source.setupGuide.steps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    {/* Compliance Notes */}
                    <div
                      style={{
                        fontSize: "0.6875rem",
                        color: "var(--text-muted)",
                        background: "rgba(99,102,241,0.05)",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "0.375rem",
                        borderLeft: "2px solid #6366f1",
                      }}
                    >
                      <strong>Compliance:</strong> {source.setupGuide.complianceNotes}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
