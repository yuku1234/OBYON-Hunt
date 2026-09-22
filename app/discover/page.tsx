"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { searchService } from "@/lib/search";
import type { SearchQuery, Opportunity } from "@/types";
import { Search, SlidersHorizontal, X } from "lucide-react";

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

export default function DiscoverPage() {
  const [formState, setFormState] = useState<SearchQuery>(defaultQuery);
  const [results, setResults] = useState<Opportunity[] | null>(null);
  const [totalFound, setTotalFound] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);

    // Simulate async search (in Phase 2 this hits real sources)
    await new Promise((r) => setTimeout(r, 600));

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
        description="Find people and businesses publicly expressing needs that OBYON can solve."
      />

      {/* Search Form */}
      <div
        className="card"
        style={{ padding: "1.5rem", marginBottom: "2rem" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1.25rem",
          }}
        >
          <SlidersHorizontal size={15} color="#6366f1" />
          <span className="heading-sm">Discovery Filters</span>
        </div>

        {/* Query */}
        <div style={{ marginBottom: "1rem" }}>
          <label
            className="text-label"
            htmlFor="discover-query"
            style={{ display: "block", marginBottom: "0.375rem" }}
          >
            What are you looking for?
          </label>
          <div style={{ position: "relative" }}>
            <Search
              size={15}
              color="var(--text-muted)"
              style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              id="discover-query"
              className="input"
              style={{ paddingLeft: "2.25rem" }}
              placeholder="e.g. AI customer support agent, website redesign, WhatsApp automation…"
              value={formState.query}
              onChange={(e) => setFormState((f) => ({ ...f, query: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>

        {/* Row 2 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          {/* Service Category */}
          <div>
            <label
              className="text-label"
              htmlFor="discover-service"
              style={{ display: "block", marginBottom: "0.375rem" }}
            >
              Service Category
            </label>
            <select
              id="discover-service"
              className="select"
              value={formState.serviceCategory}
              onChange={(e) =>
                setFormState((f) => ({
                  ...f,
                  serviceCategory: e.target.value as SearchQuery["serviceCategory"],
                }))
              }
            >
              {SERVICE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label
              className="text-label"
              htmlFor="discover-location"
              style={{ display: "block", marginBottom: "0.375rem" }}
            >
              Location
            </label>
            <input
              id="discover-location"
              className="input"
              placeholder="e.g. India, Singapore, Remote…"
              value={formState.location}
              onChange={(e) => setFormState((f) => ({ ...f, location: e.target.value }))}
            />
          </div>

          {/* Source */}
          <div>
            <label
              className="text-label"
              htmlFor="discover-source"
              style={{ display: "block", marginBottom: "0.375rem" }}
            >
              Source
            </label>
            <select
              id="discover-source"
              className="select"
              value={formState.sourceType}
              onChange={(e) =>
                setFormState((f) => ({
                  ...f,
                  sourceType: e.target.value as SearchQuery["sourceType"],
                }))
              }
            >
              {SOURCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Min Intent Score */}
          <div>
            <label
              className="text-label"
              htmlFor="discover-score"
              style={{ display: "block", marginBottom: "0.375rem" }}
            >
              Min Intent Score: {formState.minIntentScore}
            </label>
            <input
              id="discover-score"
              type="range"
              min={0}
              max={90}
              step={10}
              value={formState.minIntentScore}
              onChange={(e) =>
                setFormState((f) => ({
                  ...f,
                  minIntentScore: parseInt(e.target.value),
                }))
              }
              style={{
                width: "100%",
                accentColor: "#6366f1",
                cursor: "pointer",
                marginTop: "0.5rem",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.6875rem",
                color: "var(--text-muted)",
                marginTop: "0.125rem",
              }}
            >
              <span>Any</span>
              <span>90+</span>
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginBottom: "1.5rem",
            maxWidth: 420,
          }}
        >
          <div>
            <label
              className="text-label"
              htmlFor="discover-datefrom"
              style={{ display: "block", marginBottom: "0.375rem" }}
            >
              Date From
            </label>
            <input
              id="discover-datefrom"
              type="date"
              className="input"
              value={formState.dateFrom ?? ""}
              onChange={(e) =>
                setFormState((f) => ({ ...f, dateFrom: e.target.value || null }))
              }
            />
          </div>
          <div>
            <label
              className="text-label"
              htmlFor="discover-dateto"
              style={{ display: "block", marginBottom: "0.375rem" }}
            >
              Date To
            </label>
            <input
              id="discover-dateto"
              type="date"
              className="input"
              value={formState.dateTo ?? ""}
              onChange={(e) =>
                setFormState((f) => ({ ...f, dateTo: e.target.value || null }))
              }
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button
            id="discover-search-btn"
            className="btn btn-primary btn-lg"
            onClick={handleSearch}
            disabled={isSearching}
            style={{ minWidth: 180 }}
          >
            {isSearching ? (
              <>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTop: "2px solid white",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    display: "inline-block",
                  }}
                />
                Searching…
              </>
            ) : (
              <>
                <Search size={15} />
                Find Opportunities
              </>
            )}
          </button>
          {hasSearched && (
            <button
              id="discover-reset-btn"
              className="btn btn-ghost"
              onClick={handleReset}
            >
              <X size={14} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {hasSearched && !isSearching && (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <div>
              <span className="heading-sm">{totalFound} results</span>
              {formState.query && (
                <span
                  style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}
                >
                  for &ldquo;{formState.query}&rdquo;
                </span>
              )}
            </div>
          </div>

          {results && results.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
                gap: "1rem",
              }}
            >
              {results.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Search}
              title="No opportunities found"
              description="Try adjusting your filters or broadening your search query."
              action={
                <button className="btn btn-secondary" onClick={handleReset}>
                  Clear filters
                </button>
              }
            />
          )}
        </div>
      )}

      {!hasSearched && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "4rem 2rem",
            gap: "0.75rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "1rem",
              background: "rgba(99, 102, 241, 0.08)",
              border: "1px solid rgba(99, 102, 241, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6366f1",
              marginBottom: "0.5rem",
            }}
          >
            <Search size={26} />
          </div>
          <p className="heading-sm">Set your discovery criteria and search</p>
          <p className="text-body" style={{ maxWidth: 400 }}>
            OBYON Signal scans public platforms for people actively seeking the
            services you offer. Configure your filters above and hit{" "}
            <strong style={{ color: "var(--text-primary)" }}>Find Opportunities</strong>.
          </p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
