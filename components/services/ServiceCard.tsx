"use client";

import type { Service } from "@/types";
import {
  Bot, Zap, MessageSquare, Code2, Globe, Smartphone,
  Video, Sparkles, MessageCircle, Database, Palette,
  Cloud, Plug, BarChart2, Wrench, Cpu, TrendingUp, Package,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Bot, Zap, MessageSquare, Code2, Globe, Smartphone,
  Video, Sparkles, MessageCircle, Database, Palette,
  Cloud, Plug, BarChart2, Wrench, Cpu, TrendingUp, Package,
};

export function ServiceCard({ service }: { service: Service }) {
  const Icon = ICON_MAP[service.icon] ?? Package;
  const hasOpps = service.opportunityCount > 0;

  return (
    <div
      className="card"
      style={{
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.875rem",
        position: "relative",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = hasOpps
          ? "rgba(99,102,241,0.3)"
          : "var(--border-strong)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "0.625rem",
            background: hasOpps ? "rgba(99,102,241,0.1)" : "var(--surface-3)",
            border: `1px solid ${hasOpps ? "rgba(99,102,241,0.2)" : "var(--border-subtle)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: hasOpps ? "#6366f1" : "var(--text-muted)",
            flexShrink: 0,
          }}
        >
          <Icon size={18} />
        </div>
        {hasOpps && (
          <span
            style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              padding: "0.125rem 0.5rem",
              borderRadius: 9999,
              background: "rgba(99,102,241,0.1)",
              color: "#a5b4fc",
              border: "1px solid rgba(99,102,241,0.2)",
              whiteSpace: "nowrap",
            }}
          >
            {service.opportunityCount} signal{service.opportunityCount > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div>
        <h3 className="heading-sm" style={{ marginBottom: "0.25rem" }}>
          {service.name}
        </h3>
        <p className="text-body" style={{ fontSize: "0.8125rem" }}>
          {service.description}
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", marginTop: "auto" }}>
        {service.keywords.slice(0, 3).map((kw) => (
          <span
            key={kw}
            style={{
              fontSize: "0.625rem",
              fontWeight: 500,
              padding: "0.0625rem 0.375rem",
              borderRadius: 9999,
              background: "var(--surface-4)",
              color: "var(--text-muted)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {kw}
          </span>
        ))}
      </div>
    </div>
  );
}
