"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Opportunity, FreshnessFilter, IntentAnalysis } from "@/types";
import {
  Search,
  Sparkles,
  AlertCircle,
  Globe,
  Radio,
  Check,
  ExternalLink,
  Layers,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const SERVICE_OPTIONS = [
  { value: "AI Agents", label: "AI Agents" },
  { value: "AI Automation", label: "AI Automation" },
  { value: "AI Chatbots", label: "AI Chatbots" },
  { value: "AI Integrations", label: "AI Integrations" },
  { value: "SaaS Development", label: "SaaS Development" },
  { value: "Web Development", label: "Web Development" },
  { value: "Mobile Development", label: "Mobile Development" },
  { value: "Custom Software", label: "Custom Software" },
  { value: "Video Editing", label: "Video Editing" },
  { value: "AI Video", label: "AI Video" },
  { value: "WhatsApp Automation", label: "WhatsApp Automation" },
  { value: "CRM Automation", label: "CRM Automation" },
  { value: "Data Automation", label: "Data Automation" },
  { value: "UI/UX Design", label: "UI/UX Design" },
  { value: "Cloud / DevOps", label: "Cloud / DevOps" },
  { value: "API Integrations", label: "API Integrations" },
];

const FRESHNESS_OPTIONS: Array<{ value: FreshnessFilter; label: string }> = [
  { value: "24h", label: "Past 24 hours" },
  { value: "3d", label: "Past 3 days" },
  { value: "7d", label: "Past 7 days" },
  { value: "30d", label: "Past 30 days" },
];

const AVAILABLE_SOURCES = [
  { id: "google_grounding", name: "Google Web Grounding", badge: "Live Gemini", isDefault: true },
  { id: "hackernews", name: "Hacker News", badge: "Public Index", isDefault: true },
  { id: "github", name: "GitHub Issues", badge: "Open Issues", isDefault: true },
  { id: "reddit", name: "Reddit", badge: "OAuth API", isDefault: false },
  { id: "x_twitter", name: "X (Twitter)", badge: "API v2", isDefault: false },
  { id: "linkedin", name: "LinkedIn", badge: "Compliant Search", isDefault: false },
  { id: "meta_facebook", name: "Meta (FB / IG)", badge: "Compliant Search", isDefault: false },
];

const DISCOVERY_STAGES = [
  "Querying active sources concurrently...",
  "Analyzing real buyer demand signals...",
  "Rejecting agencies, sellers, and general articles...",
  "Calculating deterministic 0–100 intent scores...",
  "Deduplicating and persisting verified opportunities...",
];

interface SourceOutcome {
  sourceId: string;
  sourceName: string;
  scannedCount: number;
  buyerCount: number;
  rejectedCount: number;
  error?: string;
}

export default function DiscoverPage() {
  // Discovery Form State
  const [service, setService] = useState("AI Agents");
  const [problem, setProblem] = useState("");
  const [location, setLocation] = useState("");
  const [freshness, setFreshness] = useState<FreshnessFilter>("7d");
  const [minIntentScore, setMinIntentScore] = useState(70);
  const [selectedSources, setSelectedSources] = useState<string[]>([
    "google_grounding",
    "hackernews",
    "github",
  ]);

  // Discovery Run State
  const [isRunning, setIsRunning] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Discovery Results Metrics
  const [searchRunMetrics, setSearchRunMetrics] = useState<{
    queries: string[];
    scannedCount: number;
    buyerCount: number;
    sellerCount: number;
    generalCount: number;
    unknownCount: number;
    rejectedCount: number;
    savedCount: number;
    sourceOutcomes?: SourceOutcome[];
    compliantLinks?: Record<string, string>;
    supabaseSaved?: boolean;
    dbError?: string;
  } | null>(null);

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  // Manual Signal Analyzer State
  const [manualText, setManualText] = useState("");
  const [isAnalyzingManual, setIsAnalyzingManual] = useState(false);
  const [manualResult, setManualResult] = useState<IntentAnalysis | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);

  const toggleSource = (sourceId: string) => {
    setSelectedSources((prev) =>
      prev.includes(sourceId) ? prev.filter((id) => id !== sourceId) : [...prev, sourceId]
    );
  };

  const handleDiscover = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!problem.trim()) return;

    setIsRunning(true);
    setDiscoveryError(null);
    setHasSearched(true);
    setOpportunities([]);
    setSearchRunMetrics(null);
    setCurrentStageIndex(0);

    const stageInterval = setInterval(() => {
      setCurrentStageIndex((prev) => (prev < DISCOVERY_STAGES.length - 1 ? prev + 1 : prev));
    }, 2500);

    try {
      const res = await fetch("/api/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service,
          problem: problem.trim(),
          location: location.trim(),
          freshness,
          minIntentScore,
          selectedSources,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Multi-source lead discovery failed");
      }

      setSearchRunMetrics({
        queries: data.queriesGenerated || [],
        scannedCount: data.scannedCount || 0,
        buyerCount: data.buyerCount || 0,
        sellerCount: data.sellerCount || 0,
        generalCount: data.generalCount || 0,
        unknownCount: data.unknownCount || 0,
        rejectedCount: data.rejectedCount || 0,
        savedCount: data.savedCount || 0,
        sourceOutcomes: data.sourceOutcomes,
        compliantLinks: data.compliantLinks,
        supabaseSaved: data.supabaseSaved,
        dbError: data.dbError,
      });

      setOpportunities(data.opportunities || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Live discovery failed";
      setDiscoveryError(msg);
    } finally {
      clearInterval(stageInterval);
      setIsRunning(false);
    }
  };

  const handleManualAnalyze = async () => {
    if (manualText.trim().length < 10) return;
    setIsAnalyzingManual(true);
    setManualResult(null);
    setManualError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: manualText.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }
      setManualResult(data as IntentAnalysis);
    } catch (err: unknown) {
      setManualError(err instanceof Error ? err.message : "Error analyzing text");
    } finally {
      setIsAnalyzingManual(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Discover Real Opportunities"
        description="Search live multi-source channels for genuine buyer demand signals with zero synthetic leads."
        badge="Live Multi-Source Engine"
      />

      {/* ── Main Discovery Form Card ── */}
      <div
        className="card"
        style={{
          padding: "1.75rem",
          marginBottom: "2rem",
          borderColor: "rgba(99,102,241,0.25)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "linear-gradient(90deg, #6366f1, #a855f7)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <Globe size={18} color="#6366f1" />
          <h2 className="heading-sm" style={{ margin: 0, fontSize: "1.1rem" }}>
            Multi-Source Demand Search
          </h2>
        </div>

        <form onSubmit={handleDiscover}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "1.25rem",
              marginBottom: "1.25rem",
            }}
          >
            {/* 1. Service / Category */}
            <div>
              <label
                className="text-label"
                htmlFor="discover-service-input"
                style={{ display: "block", marginBottom: "0.375rem" }}
              >
                Service / Category
              </label>
              <select
                id="discover-service-input"
                className="select"
                value={service}
                onChange={(e) => setService(e.target.value)}
                style={{ width: "100%", fontWeight: 600 }}
              >
                {SERVICE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Problem / Search Description */}
            <div style={{ gridColumn: "span 2", minWidth: 280 }}>
              <label
                className="text-label"
                htmlFor="discover-problem-input"
                style={{ display: "block", marginBottom: "0.375rem" }}
              >
                Problem / Search Description *
              </label>
              <input
                id="discover-problem-input"
                className="input"
                placeholder="e.g. customer support automation, WhatsApp ordering bot, SaaS MVP development"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                required
                style={{ width: "100%" }}
              />
            </div>

            {/* 3. Location */}
            <div>
              <label
                className="text-label"
                htmlFor="discover-location-input"
                style={{ display: "block", marginBottom: "0.375rem" }}
              >
                Location / Context
              </label>
              <input
                id="discover-location-input"
                className="input"
                placeholder="e.g. India, US, Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>

            {/* 4. Freshness */}
            <div>
              <label
                className="text-label"
                htmlFor="discover-freshness-input"
                style={{ display: "block", marginBottom: "0.375rem" }}
              >
                Freshness Filter
              </label>
              <select
                id="discover-freshness-input"
                className="select"
                value={freshness}
                onChange={(e) => setFreshness(e.target.value as FreshnessFilter)}
                style={{ width: "100%" }}
              >
                {FRESHNESS_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Minimum Intent Score */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem" }}>
                <label className="text-label" htmlFor="discover-min-intent">
                  Min Intent Score: {minIntentScore}
                </label>
                <span style={{ fontSize: "0.75rem", color: "#818cf8", fontWeight: 700 }}>
                  {minIntentScore >= 80 ? "Explicit Only" : "High Demand"}
                </span>
              </div>
              <input
                id="discover-min-intent"
                type="range"
                min={40}
                max={90}
                step={5}
                value={minIntentScore}
                onChange={(e) => setMinIntentScore(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#6366f1", cursor: "pointer" }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.6875rem",
                  color: "var(--text-muted)",
                }}
              >
                <span>40 (Broad)</span>
                <span>70 (Targeted)</span>
                <span>90 (Strict)</span>
              </div>
            </div>
          </div>

          {/* 6. Sources to Search Checkboxes */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label className="text-label" style={{ display: "block", marginBottom: "0.5rem" }}>
              Select Discovery Sources
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {AVAILABLE_SOURCES.map((src) => {
                const isChecked = selectedSources.includes(src.id);
                return (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => toggleSource(src.id)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.4375rem 0.875rem",
                      borderRadius: "0.5rem",
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      background: isChecked ? "rgba(99,102,241,0.18)" : "var(--surface-3)",
                      border: `1px solid ${isChecked ? "#6366f1" : "var(--border-subtle)"}`,
                      color: isChecked ? "#e0e7ff" : "var(--text-secondary)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "3px",
                        border: `1px solid ${isChecked ? "#6366f1" : "var(--text-muted)"}`,
                        background: isChecked ? "#6366f1" : "transparent",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isChecked && <Check size={11} color="white" />}
                    </span>
                    {src.name}
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        color: "var(--text-muted)",
                        background: "rgba(0,0,0,0.2)",
                        padding: "0.125rem 0.375rem",
                        borderRadius: "3px",
                      }}
                    >
                      {src.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            id="discover-submit-button"
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isRunning || !problem.trim() || selectedSources.length === 0}
            style={{
              minWidth: 260,
              padding: "0.875rem 1.75rem",
              fontSize: "0.9375rem",
              fontWeight: 700,
              letterSpacing: "0.02em",
            }}
          >
            {isRunning ? (
              <>
                <span
                  style={{
                    width: 15,
                    height: 15,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTop: "2px solid white",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    display: "inline-block",
                  }}
                />
                SEARCHING LIVE SOURCES...
              </>
            ) : (
              <>
                <Search size={16} />
                DISCOVER REAL OPPORTUNITIES
              </>
            )}
          </button>
        </form>

        {/* Live Running Progress Status Display */}
        {isRunning && (
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1rem 1.25rem",
              background: "rgba(99,102,241,0.06)",
              border: "1px solid rgba(99,102,241,0.25)",
              borderRadius: "0.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Radio size={14} color="#6366f1" style={{ animation: "spin 2s linear infinite" }} />
              <strong style={{ fontSize: "0.875rem", color: "#a5b4fc", textTransform: "uppercase" }}>
                ● MULTI-SOURCE DISCOVERY IN PROGRESS
              </strong>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              {DISCOVERY_STAGES.map((stg, idx) => (
                <div
                  key={stg}
                  style={{
                    fontSize: "0.8125rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color:
                      idx === currentStageIndex
                        ? "#e0e7ff"
                        : idx < currentStageIndex
                        ? "#10b981"
                        : "var(--text-muted)",
                    fontWeight: idx === currentStageIndex ? 600 : 400,
                  }}
                >
                  {idx < currentStageIndex ? (
                    <Check size={13} color="#10b981" />
                  ) : idx === currentStageIndex ? (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#818cf8",
                        display: "inline-block",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "var(--border-subtle)",
                        display: "inline-block",
                      }}
                    />
                  )}
                  {stg}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Real Error Display */}
        {discoveryError && (
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1rem 1.25rem",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "0.5rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
            }}
          >
            <AlertCircle size={18} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <strong style={{ fontSize: "0.875rem", color: "#fca5a5", display: "block" }}>
                Discovery Execution Error
              </strong>
              <p style={{ fontSize: "0.8125rem", color: "#fecaca", margin: "0.25rem 0 0 0", lineHeight: 1.5 }}>
                {discoveryError}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Search Metrics & Per-Source Outcomes Breakdown ── */}
      {searchRunMetrics && !isRunning && (
        <div
          className="card"
          style={{
            padding: "1.25rem",
            marginBottom: "1.75rem",
            background: "var(--surface-2)",
            border: "1px solid var(--border-default)",
          }}
        >
          {/* Top Level Numbers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "1rem",
              textAlign: "center",
              marginBottom: "1.25rem",
            }}
          >
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>
                {searchRunMetrics.scannedCount}
              </div>
              <div className="text-label">Results Inspected</div>
            </div>

            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#10b981" }}>
                {searchRunMetrics.buyerCount}
              </div>
              <div className="text-label">Buyer Demand Found</div>
            </div>

            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f87171" }}>
                {searchRunMetrics.rejectedCount}
              </div>
              <div className="text-label">Rejected (Non-Buyers)</div>
            </div>

            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#818cf8" }}>
                {searchRunMetrics.savedCount}
              </div>
              <div className="text-label">Saved to Pipeline</div>
            </div>
          </div>

          {/* Per-Source Execution Outcomes */}
          {searchRunMetrics.sourceOutcomes && searchRunMetrics.sourceOutcomes.length > 0 && (
            <div style={{ paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)" }}>
              <div className="text-label" style={{ marginBottom: "0.625rem" }}>
                Per-Source Execution Breakdown:
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.625rem" }}>
                {searchRunMetrics.sourceOutcomes.map((so) => (
                  <div
                    key={so.sourceId}
                    style={{
                      background: "var(--surface-3)",
                      padding: "0.75rem",
                      borderRadius: "0.375rem",
                      border: "1px solid var(--border-subtle)",
                      fontSize: "0.75rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.375rem" }}>
                      <strong style={{ color: "var(--text-primary)" }}>{so.sourceName}</strong>
                      {so.error ? (
                        <span style={{ color: "#ef4444", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                          <XCircle size={12} /> Error
                        </span>
                      ) : (
                        <span style={{ color: "#10b981", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                          <CheckCircle2 size={12} /> Active
                        </span>
                      )}
                    </div>
                    {so.error ? (
                      <div style={{ color: "#f87171", fontSize: "0.6875rem", lineHeight: 1.4 }}>
                        {so.error}
                      </div>
                    ) : (
                      <div style={{ color: "var(--text-muted)" }}>
                        Inspected: <strong style={{ color: "var(--text-secondary)" }}>{so.scannedCount}</strong> | Buyers: <strong style={{ color: "#10b981" }}>{so.buyerCount}</strong>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliant Direct Search Links */}
          {searchRunMetrics.compliantLinks && Object.keys(searchRunMetrics.compliantLinks).length > 0 && (
            <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-subtle)" }}>
              <div className="text-label" style={{ marginBottom: "0.375rem" }}>
                Compliant Direct Search Links (Open Live Results):
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {Object.entries(searchRunMetrics.compliantLinks).map(([k, url]) => {
                  const label =
                    k === "linkedin"
                      ? "LinkedIn Live Posts"
                      : k === "x_twitter"
                      ? "X Live Tweets"
                      : k === "meta_facebook"
                      ? "Facebook Group Posts"
                      : k === "reddit"
                      ? "Reddit Search"
                      : `${k} search`;

                  return (
                    <a
                      key={k}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-ghost btn-sm"
                      style={{
                        fontSize: "0.75rem",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        background: "var(--surface-3)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      {label} <ExternalLink size={12} />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Real Opportunities Discovered ── */}
      {hasSearched && !isRunning && (
        <div style={{ marginBottom: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 className="heading-md" style={{ margin: 0 }}>
              Verified Buyer Opportunities ({opportunities.length})
            </h2>
          </div>

          {opportunities.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
                gap: "1rem",
              }}
            >
              {opportunities.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Search}
              title="No verified buyer opportunities found for this search."
              description="All inspected results were non-buyers, sellers, or did not meet the intent threshold. Try broadening your problem description or lowering the minimum intent score."
            />
          )}
        </div>
      )}

      {/* ── Section 2: Manual Text Signal Analyzer ── */}
      <div
        className="card"
        style={{
          padding: "1.5rem",
          borderColor: "var(--border-subtle)",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <Sparkles size={16} color="#6366f1" />
          <h2 className="heading-sm" style={{ margin: 0 }}>
            Manual Signal Analyzer
          </h2>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            (Inspect any raw post or snippet)
          </span>
        </div>

        <p className="text-body" style={{ fontSize: "0.8125rem", marginBottom: "0.75rem" }}>
          Found a post or email thread manually? Paste it below to test buying intent and generate custom outreach.
        </p>

        <textarea
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          placeholder={`Paste text here...`}
          style={{
            width: "100%",
            minHeight: 110,
            padding: "0.75rem",
            background: "var(--surface-3)",
            border: "1px solid var(--border-default)",
            borderRadius: "0.5rem",
            color: "var(--text-primary)",
            fontSize: "0.875rem",
            lineHeight: 1.5,
            resize: "vertical",
            marginBottom: "0.75rem",
            fontFamily: "inherit",
          }}
        />

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleManualAnalyze}
            disabled={isAnalyzingManual || manualText.trim().length < 10}
          >
            <Sparkles size={13} />
            {isAnalyzingManual ? "Analyzing..." : "Analyze Signal"}
          </button>
          {manualResult && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setManualText("");
                setManualResult(null);
              }}
            >
              Clear
            </button>
          )}
        </div>

        {manualError && (
          <p style={{ fontSize: "0.8125rem", color: "#f87171", marginTop: "0.5rem" }}>
            {manualError}
          </p>
        )}

        {manualResult && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              background: "var(--surface-2)",
              borderRadius: "0.5rem",
              border: "1px solid var(--border-default)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#818cf8" }}>
                {manualResult.intentScore} <span style={{ fontSize: "0.75rem" }}>/ 100 Intent</span>
              </div>
              <span className="badge badge-primary">{manualResult.intentStrength}</span>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", margin: "0 0 0.5rem 0" }}>
              <strong>Detected Need:</strong> {manualResult.detectedNeed}
            </p>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", margin: "0 0 0.5rem 0" }}>
              <strong>Reasoning:</strong> {manualResult.reasoning}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
