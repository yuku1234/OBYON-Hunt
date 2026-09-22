import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { mockOpportunities } from "@/lib/opportunities/mock-data";
import {
  formatDate,
  getIntentStrengthStyle,
  getUrgencyStyle,
  getBudgetSignalStyle,
  getStatusStyle,
  getServiceDisplayName,
} from "@/lib/utils";
import { IntentScoreRing } from "@/components/opportunities/IntentBadge";
import { OpportunityActions, CopyOutreachButton } from "@/components/opportunities/OpportunityActions";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Calendar,
  User,
  Building2,
  Lightbulb,
  Bot,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const opp = mockOpportunities.find((o) => o.id === id);
  return {
    title: opp ? opp.title : "Opportunity Not Found",
  };
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const { id } = await params;
  const opp = mockOpportunities.find((o) => o.id === id);

  if (!opp) notFound();

  const intentStyle = getIntentStrengthStyle(opp.intentStrength);
  const urgencyStyle = getUrgencyStyle(opp.urgency);
  const budgetStyle = getBudgetSignalStyle(opp.budgetSignal);
  const statusStyle = getStatusStyle(opp.status);

  return (
    <div>
      {/* Back */}
      <Link
        href="/opportunities"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.375rem",
          fontSize: "0.875rem",
          color: "var(--text-muted)",
          textDecoration: "none",
          marginBottom: "1.5rem",
          transition: "color 0.15s",
        }}
      >
        <ArrowLeft size={15} />
        Back to Opportunities
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>
        {/* Main Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Header Card */}
          <div className="card" style={{ padding: "1.5rem" }}>
            {/* Badges */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.875rem" }}>
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  color: "#0077b5",
                  background: "rgba(0,119,181,0.1)",
                  border: "1px solid rgba(0,119,181,0.2)",
                  padding: "0.125rem 0.5rem",
                  borderRadius: 9999,
                }}
              >
                {opp.sourceName}
              </span>
              <span className={`badge ${intentStyle.className}`}>{intentStyle.label}</span>
              <span className={`badge ${statusStyle.className}`}>{statusStyle.label}</span>
            </div>

            <h1
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                lineHeight: 1.3,
                letterSpacing: "-0.02em",
                marginBottom: "0.875rem",
              }}
            >
              {opp.title}
            </h1>

            {/* Meta */}
            <div
              style={{
                display: "flex",
                gap: "1.25rem",
                flexWrap: "wrap",
                fontSize: "0.8125rem",
                color: "var(--text-muted)",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <User size={13} /> {opp.authorName}
                {opp.authorHandle && (
                  <span style={{ opacity: 0.6 }}>{opp.authorHandle}</span>
                )}
              </span>
              {opp.companyName && (
                <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  <Building2 size={13} /> {opp.companyName}
                </span>
              )}
              {opp.location && (
                <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  <MapPin size={13} /> {opp.location}
                </span>
              )}
              <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <Calendar size={13} /> {formatDate(opp.publishedAt, false)}
              </span>
              <a
                href={opp.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  color: "#6366f1",
                  textDecoration: "none",
                }}
              >
                <ExternalLink size={13} /> View original
              </a>
            </div>
          </div>

          {/* Original Content */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <h2 className="heading-sm" style={{ marginBottom: "0.875rem" }}>
              Original Content
            </h2>
            <blockquote
              style={{
                borderLeft: "3px solid rgba(99,102,241,0.4)",
                paddingLeft: "1rem",
                margin: 0,
                color: "var(--text-secondary)",
                fontSize: "0.9375rem",
                lineHeight: 1.7,
                fontStyle: "italic",
              }}
            >
              {opp.content}
            </blockquote>
          </div>

          {/* AI Signal Analysis */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1.25rem",
              }}
            >
              <Bot size={16} color="#6366f1" />
              <h2 className="heading-sm">AI Signal Analysis</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { label: "Detected Need", value: opp.detectedNeed },
                { label: "Problem Identified", value: opp.detectedProblem },
                { label: "Specific Requirement", value: opp.detectedRequirement },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    background: "var(--surface-3)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "0.5rem",
                    padding: "0.875rem 1rem",
                  }}
                >
                  <div className="text-label" style={{ marginBottom: "0.25rem" }}>
                    {label}
                  </div>
                  <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                    {value}
                  </p>
                </div>
              ))}

              {/* Reasoning */}
              <div
                style={{
                  background: "rgba(99,102,241,0.05)",
                  border: "1px solid rgba(99,102,241,0.15)",
                  borderRadius: "0.5rem",
                  padding: "0.875rem 1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    marginBottom: "0.375rem",
                  }}
                >
                  <Lightbulb size={13} color="#6366f1" />
                  <div className="text-label" style={{ color: "#a5b4fc" }}>
                    AI Reasoning
                  </div>
                </div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {opp.reasoning}
                </p>
              </div>
            </div>
          </div>

          {/* Suggested Outreach */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Bot size={16} color="#6366f1" />
                <h2 className="heading-sm">Suggested Outreach</h2>
              </div>
              <CopyOutreachButton text={opp.suggestedOutreach} />
            </div>
            <div
              style={{
                background: "var(--surface-3)",
                border: "1px solid var(--border-default)",
                borderRadius: "0.5rem",
                padding: "1rem",
                fontSize: "0.9375rem",
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
              }}
            >
              {opp.suggestedOutreach}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Score Card */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <h3 className="heading-sm" style={{ marginBottom: "1.25rem" }}>
              Signal Scores
            </h3>
            <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "1.25rem" }}>
              <div style={{ textAlign: "center" }}>
                <IntentScoreRing score={opp.intentScore} size={64} />
                <div className="text-label" style={{ marginTop: "0.375rem" }}>
                  Intent
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <IntentScoreRing score={opp.urgencyScore} size={64} />
                <div className="text-label" style={{ marginTop: "0.375rem" }}>
                  Urgency
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <IntentScoreRing score={opp.confidenceScore} size={64} />
                <div className="text-label" style={{ marginTop: "0.375rem" }}>
                  Confidence
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="text-label">Intent</span>
                <span className={`badge ${intentStyle.className}`}>{intentStyle.label}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="text-label">Urgency</span>
                <span className={`badge ${urgencyStyle.className}`}>{urgencyStyle.label}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="text-label">Budget</span>
                <span className={`badge ${budgetStyle.className}`}>{budgetStyle.label}</span>
              </div>
            </div>
          </div>

          {/* Matched Services */}
          <div className="card" style={{ padding: "1.25rem" }}>
            <h3 className="heading-sm" style={{ marginBottom: "0.875rem" }}>
              Recommended Services
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              {opp.matchedServices.map((svc, i) => (
                <div
                  key={svc}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 0.625rem",
                    borderRadius: "0.375rem",
                    background: i === 0 ? "rgba(99,102,241,0.1)" : "var(--surface-3)",
                    border: `1px solid ${i === 0 ? "rgba(99,102,241,0.2)" : "var(--border-subtle)"}`,
                  }}
                >
                  {i === 0 && (
                    <span
                      style={{
                        fontSize: "0.5rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        background: "#6366f1",
                        color: "white",
                        padding: "0.0625rem 0.3125rem",
                        borderRadius: 9999,
                      }}
                    >
                      Primary
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      color: i === 0 ? "#a5b4fc" : "var(--text-secondary)",
                      fontWeight: i === 0 ? 600 : 400,
                    }}
                  >
                    {getServiceDisplayName(svc)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          {opp.tags.length > 0 && (
            <div className="card" style={{ padding: "1.25rem" }}>
              <h3 className="heading-sm" style={{ marginBottom: "0.75rem" }}>
                Tags
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                {opp.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 500,
                      padding: "0.125rem 0.5rem",
                      borderRadius: 9999,
                      background: "var(--surface-3)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <OpportunityActions outreachMessage={opp.suggestedOutreach} />
        </div>
      </div>
    </div>
  );
}
