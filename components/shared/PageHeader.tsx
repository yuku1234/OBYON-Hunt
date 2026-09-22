interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, badge, actions }: PageHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: "2rem",
        gap: "1rem",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.25rem" }}>
          <h1 className="heading-xl">{title}</h1>
          {badge && (
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                padding: "0.1875rem 0.5rem",
                borderRadius: 9999,
                background: "rgba(99, 102, 241, 0.1)",
                color: "#a5b4fc",
                border: "1px solid rgba(99, 102, 241, 0.2)",
              }}
            >
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-body" style={{ marginTop: "0.25rem", maxWidth: 520 }}>
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </div>
  );
}
