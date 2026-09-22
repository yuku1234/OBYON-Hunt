"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { mockDashboardStats, mockOpportunities, mockActivityFeed } from "@/lib/opportunities/mock-data";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { formatDate, getServiceDisplayName } from "@/lib/utils";
import { Zap, TrendingUp, Clock, BarChart2, Activity } from "lucide-react";

const stats = mockDashboardStats;
const recentOpps = [...mockOpportunities]
  .sort((a, b) => new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime())
  .slice(0, 3);

function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div
      className="card animate-fade-in"
      style={{
        padding: "1.25rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {accent && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
          }}
        />
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="text-label">{label}</span>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "0.5rem",
            background: accent
              ? "rgba(99, 102, 241, 0.1)"
              : "var(--surface-3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: accent ? "#6366f1" : "var(--text-muted)",
          }}
        >
          <Icon size={15} />
        </div>
      </div>
      <div>
        <div
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: accent ? "#a5b4fc" : "var(--text-primary)",
            lineHeight: 1,
          }}
        >
          {value}
        </div>
        {subtitle && (
          <p className="text-body" style={{ marginTop: "0.25rem", fontSize: "0.8125rem" }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default function OverviewPage() {
  return (
    <div>
      <PageHeader
        title="Overview"
        description="Your opportunity pipeline at a glance."
        badge="Live"
      />

      {/* Stats Grid */}
      <div
        className="stagger"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <StatCard
          label="Total Opportunities"
          value={stats.totalOpportunities}
          subtitle="All time"
          icon={Zap}
        />
        <StatCard
          label="High Intent"
          value={stats.highIntentOpportunities}
          subtitle="Score ≥ 80"
          icon={TrendingUp}
          accent
        />
        <StatCard
          label="New This Week"
          value={stats.newThisWeek}
          subtitle="Last 7 days"
          icon={Clock}
        />
        <StatCard
          label="Avg Intent Score"
          value={stats.averageIntentScore}
          subtitle="Across all signals"
          icon={BarChart2}
        />
      </div>

      {/* Two-column: by service + recent activity */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {/* By Service */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2
            className="heading-sm"
            style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <BarChart2 size={16} color="#6366f1" />
            Opportunities by Service
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {stats.byService.map((item) => {
              const pct = Math.round((item.count / stats.totalOpportunities) * 100);
              return (
                <div key={item.service}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                      {item.name}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
                      {item.count}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 4,
                      background: "var(--surface-4)",
                      borderRadius: 9999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: item.color,
                        borderRadius: 9999,
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2
            className="heading-sm"
            style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Activity size={16} color="#6366f1" />
            Recent Activity
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {mockActivityFeed.slice(0, 5).map((event) => (
              <div
                key={event.id}
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background:
                      event.type === "opportunity_discovered"
                        ? "#6366f1"
                        : event.type === "source_synced"
                        ? "#10b981"
                        : "#f59e0b",
                    marginTop: 4,
                    flexShrink: 0,
                    boxShadow: `0 0 6px ${
                      event.type === "opportunity_discovered"
                        ? "rgba(99,102,241,0.5)"
                        : event.type === "source_synced"
                        ? "rgba(16,185,129,0.5)"
                        : "rgba(245,158,11,0.5)"
                    }`,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.4,
                      marginBottom: "0.125rem",
                    }}
                  >
                    {event.description}
                  </p>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {formatDate(event.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Opportunities */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <h2 className="heading-md">Recent Opportunities</h2>
          <a
            href="/opportunities"
            style={{
              fontSize: "0.875rem",
              color: "#6366f1",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            View all →
          </a>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "1rem",
          }}
        >
          {recentOpps.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      </div>
    </div>
  );
}
