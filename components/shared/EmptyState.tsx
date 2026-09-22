import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "4rem 2rem",
        gap: "1rem",
      }}
    >
      {Icon && (
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "0.75rem",
            background: "var(--surface-3)",
            border: "1px solid var(--border-default)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
            marginBottom: "0.25rem",
          }}
        >
          <Icon size={22} />
        </div>
      )}
      <div>
        <p className="heading-sm" style={{ marginBottom: "0.25rem" }}>
          {title}
        </p>
        {description && (
          <p className="text-body" style={{ maxWidth: 380, margin: "0 auto" }}>
            {description}
          </p>
        )}
      </div>
      {action && <div style={{ marginTop: "0.5rem" }}>{action}</div>}
    </div>
  );
}
