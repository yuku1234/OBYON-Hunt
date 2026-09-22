import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: number;
  label?: string;
  className?: string;
}

export function LoadingSpinner({ size = 20, label = "Loading…", className }: LoadingSpinnerProps) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        padding: "3rem",
        color: "var(--text-muted)",
      }}
    >
      <Loader2 size={size} style={{ animation: "spin 1s linear infinite" }} />
      <span style={{ fontSize: "0.875rem" }}>{label}</span>
    </div>
  );
}
