"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { searchService } from "@/lib/search";
import type { SearchQuery, Opportunity, IntentAnalysis } from "@/types";
import { Search, SlidersHorizontal, X, Sparkles, AlertCircle, Copy, CheckCircle } from "lucide-react";
import { getServiceDisplayName } from "@/lib/utils";

// ── helpers ────────────────────────────────────────────────

const SERVICE_OPTIONS = [
  { value: "all", label: "All Services" },
  { value: "ai_automation", label: "AI Automation" },
  { value: "ai_agents", label: "AI Agents" },
  { value: "ai_chatbots", label: "AI Chatbots" },
  { value: "ai_integrations", label: "AI Integrations" },
  { value: "saas_development", label: "SaaS Development" },
  { value: "web_development", label: "Web Development" },
  { value: "mobile_development", label: "Mobile Development" },
  { value: "custom_software", label: "Custom Software" },
  { value: "video_editing", label: "Video Editing" },
  { value: "ai_video", label: "AI Video" },
  { value: "marketing_automation", label: "Marketing Automation" },
  { value: "whatsapp_automation", label: "WhatsApp Automation" },
  { value: "crm_automation", label: "CRM Automation" },
  { value: "data_automation", label: "Data Automation" },
  { value: "ui_ux", label: "UI/UX Design" },
  { value: "cloud_devops", label: "Cloud / DevOps" },
  { value: "api_integrations", label: "API Integrations" },
  { value: "other", label: "Other" },
];

const SOURCE_OPTIONS = [
  { value: "all", label: "All Sources" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter / X" },
  { value: "reddit", label: "Reddit" },
  { value: "hackernews", label: "Hacker News" },
  { value: "upwork", label: "Upwork" },
  { value: "producthunt", label: "Product Hunt" },
  { value: "github", label: "GitHub" },
  { value: "web", label: "Web" },
];

const defaultQuery: SearchQuery = {
  query: "",
  serviceCategory: "all",
  location: "",
  sourceType: "all",
  dateFrom: null,
  dateTo: null,
  minIntentScore: 0,
  maxResults: 50,
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 80 ? "#6366f1" : value >= 60 ? "#f59e0b" : "#52525b";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{label}</span>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color }}>{value}</span>
      </div>
      <div style={{ height: 4, background: "var(--surface-4)", borderRadius: 9999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 9999, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

// ── Manual Signal Analyzer ─────────────────────────────────

function SignalAnalyzer() {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<IntentAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const analyze = async () => {
    if (text.trim().length < 10) return;
    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Analysis failed. Please try again.");
        return;
      }

      setResult(data as IntentAnalysis);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyOutreach = () => {
    if (!result?.suggestedOutreach) return;
    navigator.clipboard.writeText(result.suggestedOutreach);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setText("");
    setResult(null);
    setError(null);
  };

  const intentColor =
    !result ? "#6366f1"
    : result.intentScore >= 80 ? "#6366f1"
    : result.intentScore >= 60 ? "#f59e0b"
    : "#52525b";

  return (
    <div
      className="card"
      style={{
        padding: "1.5rem",
        marginBottom: "2rem",
        borderColor: "rgba(99,102,241,0.2)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Accent top bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
        <div style={{ width: 28, height: 28, borderRadius: "0.375rem", background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Sparkles size={14} color="#6366f1" />
        </div>
        <div>
          <span className="heading-sm">Live Signal Analyzer</span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>
            Powered by Gemini AI
          </span>
        </div>
      </div>

      <p className="text-body" style={{ fontSize: "0.8125rem", marginBottom: "1rem" }}>
        Paste any post, tweet, job ad, or message. Gemini will instantly analyze it for buying intent and match it to OBYON services.
      </p>

      {/* Textarea */}
      <textarea
        id="analyzer-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Paste content here — for example:\n\n"We're a 50-person SaaS company and our customer support team is drowning in tickets. We're looking for someone to build an AI chatbot that can handle tier-1 queries automatically..."`}
        style={{
          width: "100%",
          minHeight: 140,
          padding: "0.75rem 1rem",
          background: "var(--surface-3)",
          border: "1px solid var(--border-default)",
          borderRadius: "0.5rem",
          color: "var(--text-primary)",
          fontSize: "0.9rem",
          lineHeight: 1.6,
          fontFamily: "inherit",
          resize: "vertical",
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-default)"; }}
        disabled={isAnalyzing}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.75rem" }}>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", flex: 1 }}>
          {text.length} / 8000 characters
        </div>
        {result && (
          <button id="analyzer-reset-btn" className="btn btn-ghost btn-sm" onClick={reset}>
            <X size={13} /> Clear
          </button>
        )}
        <button
          id="analyzer-submit-btn"
          className="btn btn-primary"
          onClick={analyze}
          disabled={isAnalyzing || text.trim().length < 10}
          style={{ minWidth: 160 }}
        >
          {isAnalyzing ? (
            <>
              <span style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
              Analyzing…
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Analyze Signal
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginTop: "1rem", display: "flex", alignItems: "flex-start", gap: "0.625rem", padding: "0.875rem 1rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "0.5rem" }}>
          <AlertCircle size={15} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: "0.875rem", color: "#fca5a5", margin: 0, lineHeight: 1.5 }}>{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem", animation: "fadeIn 0.3s ease" }}>
          <div style={{ height: 1, background: "var(--border-subtle)" }} />

          {/* Intent score hero */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", fontWeight: 800, color: intentColor, lineHeight: 1, letterSpacing: "-0.04em" }}>
                {result.intentScore}
              </div>
              <div className="text-label" style={{ marginTop: 2 }}>Intent Score</div>
            </div>
            <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <ScoreBar label="Intent" value={result.intentScore} />
              <ScoreBar label="Urgency" value={result.urgencyScore} />
              <ScoreBar label="Confidence" value={result.confidenceScore} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              {[
                { label: result.intentStrength, color: result.intentScore >= 80 ? "#6366f1" : result.intentScore >= 60 ? "#f59e0b" : "#52525b" },
                { label: result.urgency, color: result.urgencyScore >= 80 ? "#ef4444" : result.urgencyScore >= 60 ? "#f59e0b" : "#52525b" },
                { label: result.budgetSignal.replace(/_/g, " "), color: "#10b981" },
              ].map(({ label, color }) => (
                <span key={label} style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "capitalize", padding: "0.125rem 0.5rem", borderRadius: 9999, background: `${color}18`, color, border: `1px solid ${color}30` }}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Detected signals */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.625rem" }}>
            {[
              { label: "Detected Need", value: result.detectedNeed },
              { label: "Core Problem", value: result.detectedProblem },
              { label: "Specific Requirement", value: result.detectedRequirement },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: "0.75rem", background: "var(--surface-3)", border: "1px solid var(--border-subtle)", borderRadius: "0.5rem" }}>
                <div className="text-label" style={{ marginBottom: "0.25rem" }}>{label}</div>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Services */}
          <div>
            <div className="text-label" style={{ marginBottom: "0.5rem" }}>Matched OBYON Services</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
              {result.matchedServices.map((svc, i) => (
                <span key={svc} style={{ fontSize: "0.8125rem", fontWeight: i === 0 ? 600 : 400, padding: "0.25rem 0.625rem", borderRadius: 9999, background: i === 0 ? "rgba(99,102,241,0.12)" : "var(--surface-3)", color: i === 0 ? "#a5b4fc" : "var(--text-secondary)", border: `1px solid ${i === 0 ? "rgba(99,102,241,0.25)" : "var(--border-subtle)"}` }}>
                  {i === 0 && <span style={{ fontSize: "0.55rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginRight: 4, background: "#6366f1", color: "white", padding: "0.0625rem 0.25rem", borderRadius: 3 }}>Primary</span>}
                  {getServiceDisplayName(svc)}
                </span>
              ))}
            </div>
          </div>

          {/* Reasoning */}
          <div style={{ padding: "0.875rem 1rem", background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: "0.5rem" }}>
            <div className="text-label" style={{ color: "#a5b4fc", marginBottom: "0.25rem" }}>AI Reasoning</div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>{result.reasoning}</p>
          </div>

          {/* Suggested Outreach */}
          <div style={{ background: "var(--surface-3)", border: "1px solid var(--border-default)", borderRadius: "0.5rem", padding: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.625rem" }}>
              <div className="text-label">Suggested Outreach</div>
              <button id="analyzer-copy-btn" className="btn btn-ghost btn-sm" onClick={copyOutreach}>
                {copied ? <><CheckCircle size={13} color="#10b981" /> Copied!</> : <><Copy size={13} /> Copy</>}
              </button>
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {result.suggestedOutreach}
            </p>
          </div>

          {/* Tags */}
          {result.tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
              {result.tags.map((tag) => (
                <span key={tag} style={{ fontSize: "0.6875rem", padding: "0.125rem 0.5rem", borderRadius: 9999, background: "var(--surface-4)", color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

// ── Discover Page ──────────────────────────────────────────

export default function DiscoverPage() {
  const [formState, setFormState] = useState<SearchQuery>(defaultQuery);
  const [results, setResults] = useState<Opportunity[] | null>(null);
  const [totalFound, setTotalFound] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    await new Promise((r) => setTimeout(r, 400));
    const result = await searchService.search(formState);
    setResults(result.opportunities);
    setTotalFound(result.totalFound);
    setIsSearching(false);
  };

  const handleReset = () => {
    setFormState(defaultQuery);
    setResults(null);
    setHasSearched(false);
  };

  return (
    <div>
      <PageHeader
        title="Discover"
        description="Analyze any signal with live AI, or search your discovered opportunities."
      />

      {/* ── Live Signal Analyzer ── */}
      <SignalAnalyzer />

      {/* ── Divider ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Search Discovered Opportunities
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
      </div>

      {/* ── Search Filters ── */}
      <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <SlidersHorizontal size={15} color="#6366f1" />
          <span className="heading-sm">Discovery Filters</span>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label className="text-label" htmlFor="discover-query" style={{ display: "block", marginBottom: "0.375rem" }}>
            Keyword Search
          </label>
          <div style={{ position: "relative" }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
            <input
              id="discover-query"
              className="input"
              style={{ paddingLeft: "2.25rem" }}
              placeholder="e.g. AI chatbot, website redesign, WhatsApp automation…"
              value={formState.query}
              onChange={(e) => setFormState((f) => ({ ...f, query: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label className="text-label" htmlFor="discover-service" style={{ display: "block", marginBottom: "0.375rem" }}>Service Category</label>
            <select id="discover-service" className="select" value={formState.serviceCategory}
              onChange={(e) => setFormState((f) => ({ ...f, serviceCategory: e.target.value as SearchQuery["serviceCategory"] }))}>
              {SERVICE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-label" htmlFor="discover-location" style={{ display: "block", marginBottom: "0.375rem" }}>Location</label>
            <input id="discover-location" className="input" placeholder="India, Singapore, Remote…"
              value={formState.location} onChange={(e) => setFormState((f) => ({ ...f, location: e.target.value }))} />
          </div>
          <div>
            <label className="text-label" htmlFor="discover-source" style={{ display: "block", marginBottom: "0.375rem" }}>Source</label>
            <select id="discover-source" className="select" value={formState.sourceType}
              onChange={(e) => setFormState((f) => ({ ...f, sourceType: e.target.value as SearchQuery["sourceType"] }))}>
              {SOURCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-label" htmlFor="discover-score" style={{ display: "block", marginBottom: "0.375rem" }}>
              Min Intent Score: {formState.minIntentScore}
            </label>
            <input id="discover-score" type="range" min={0} max={90} step={10} value={formState.minIntentScore}
              onChange={(e) => setFormState((f) => ({ ...f, minIntentScore: parseInt(e.target.value) }))}
              style={{ width: "100%", accentColor: "#6366f1", cursor: "pointer", marginTop: "0.5rem" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "0.125rem" }}>
              <span>Any</span><span>90+</span>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem", maxWidth: 420 }}>
          <div>
            <label className="text-label" htmlFor="discover-datefrom" style={{ display: "block", marginBottom: "0.375rem" }}>Date From</label>
            <input id="discover-datefrom" type="date" className="input" value={formState.dateFrom ?? ""}
              onChange={(e) => setFormState((f) => ({ ...f, dateFrom: e.target.value || null }))} />
          </div>
          <div>
            <label className="text-label" htmlFor="discover-dateto" style={{ display: "block", marginBottom: "0.375rem" }}>Date To</label>
            <input id="discover-dateto" type="date" className="input" value={formState.dateTo ?? ""}
              onChange={(e) => setFormState((f) => ({ ...f, dateTo: e.target.value || null }))} />
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button id="discover-search-btn" className="btn btn-primary btn-lg" onClick={handleSearch} disabled={isSearching} style={{ minWidth: 180 }}>
            {isSearching ? (
              <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} /> Searching…</>
            ) : (
              <><Search size={15} /> Find Opportunities</>
            )}
          </button>
          {hasSearched && (
            <button id="discover-reset-btn" className="btn btn-ghost" onClick={handleReset}>
              <X size={14} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      {hasSearched && !isSearching && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div>
              <span className="heading-sm">{totalFound} results</span>
              {formState.query && (
                <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                  for &ldquo;{formState.query}&rdquo;
                </span>
              )}
            </div>
          </div>
          {results && results.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "1rem" }}>
              {results.map((opp) => <OpportunityCard key={opp.id} opportunity={opp} />)}
            </div>
          ) : (
            <EmptyState icon={Search} title="No opportunities found"
              description="Try adjusting your filters or broadening your search query."
              action={<button className="btn btn-secondary" onClick={handleReset}>Clear filters</button>} />
          )}
        </div>
      )}
    </div>
  );
}
