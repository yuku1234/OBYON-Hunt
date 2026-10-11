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
  Copy,
  CheckCircle,
  Globe,
  Radio,
  Sliders,
  Filter,
  Check,
  X,
  Flame,
} from "lucide-react";
import { getServiceDisplayName } from "@/lib/utils";

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
  { value: "WhatsApp Automation", label: "WhatsApp Automation" },
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

const DISCOVERY_STAGES = [
  "Searching public web...",
  "Analyzing demand signals...",
  "Filtering non-buyers...",
  "Ranking opportunities...",
  "Saving verified opportunities...",
];

export default function DiscoverPage() {
  // Discovery Form State
  const [service, setService] = useState("AI Agents");
  const [problem, setProblem] = useState("");
  const [location, setLocation] = useState("");
  const [freshness, setFreshness] = useState<FreshnessFilter>("7d");
  const [minIntentScore, setMinIntentScore] = useState(70);

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
    supabaseSaved?: boolean;
    dbError?: string;
  } | null>(null);

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  // Manual Signal Analyzer State
  const [manualText, setManualText] = useState("");
  const [isAnalyzingManual, setIsAnalyzingManual] = useState(false);
  const [manualResult, setManualResult] = useState<IntentAnalysis | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);
  const [manualCopied, setManualCopied] = useState(false);

  const handleDiscover = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!problem.trim()) return;

    setIsRunning(true);
    setDiscoveryError(null);
    setHasSearched(true);
    setOpportunities([]);
    setSearchRunMetrics(null);
    setCurrentStageIndex(0);

    // Animate stages while waiting for server response
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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Live web discovery failed");
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
        description="Search the live public web for verified buyer demand signals powered by Google Search Grounding."
        badge="Live Web Discovery"
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
            Real-Time Demand Search
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
                Location / Geography
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
                Freshness
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

          {/* Primary Action Button */}
          <button
            id="discover-submit-button"
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isRunning || !problem.trim()}
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
                DISCOVERING REAL OPPORTUNITIES...
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
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Radio size={14} color="#6366f1" style={{ animation: "spin 2s linear infinite" }} />
              <strong style={{ fontSize: "0.875rem", color: "#a5b4fc", textTransform: "uppercase" }}>
                ● LIVE WEB DISCOVERY IN PROGRESS
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
                Live Discovery Error
              </strong>
              <p style={{ fontSize: "0.8125rem", color: "#fecaca", margin: "0.25rem 0 0 0", lineHeight: 1.5 }}>
                {discoveryError}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Search Metrics Breakdown Banner ── */}
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "1rem",
              textAlign: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>
                {searchRunMetrics.scannedCount}
              </div>
              <div className="text-label">Source Results Found</div>
            </div>

            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#10b981" }}>
                {searchRunMetrics.buyerCount}
              </div>
              <div className="text-label">Buyer Opportunities</div>
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

          {searchRunMetrics.queries.length > 0 && (
            <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-subtle)" }}>
              <div className="text-label" style={{ marginBottom: "0.375rem" }}>
                Search Queries Generated ({searchRunMetrics.queries.length}):
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                {searchRunMetrics.queries.map((q, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "0.6875rem",
                      background: "var(--surface-3)",
                      padding: "0.125rem 0.5rem",
                      borderRadius: "0.25rem",
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {q}
                  </span>
                ))}
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
              description="Our AI filtered all non-buyers, sellers, and generic articles. Try adjusting your problem description or lowering the minimum intent score."
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
