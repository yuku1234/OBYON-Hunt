import { getIntentScoreBg } from "@/lib/utils";

interface IntentScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function IntentScoreBadge({ score, size = "md", showLabel = false }: IntentScoreBadgeProps) {
  const sizeStyles = {
    sm: { fontSize: "0.6875rem", padding: "0.125rem 0.375rem" },
    md: { fontSize: "0.75rem", padding: "0.1875rem 0.5rem" },
    lg: { fontSize: "0.875rem", padding: "0.25rem 0.75rem" },
  };

  return (
    <span
      className={`badge ${getIntentScoreBg(score)}`}
      style={sizeStyles[size]}
    >
      {showLabel && <span style={{ opacity: 0.7 }}>Intent&nbsp;</span>}
      {score}
    </span>
  );
}

interface IntentScoreRingProps {
  score: number;
  size?: number;
}

export function IntentScoreRing({ score, size = 56 }: IntentScoreRingProps) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#71717a";

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-4)"
          strokeWidth={3}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <span
        style={{
          fontSize: size <= 40 ? "0.625rem" : "0.8125rem",
          fontWeight: 700,
          color,
        }}
      >
        {score}
      </span>
    </div>
  );
}
