import { getUrgencyStyle } from "@/lib/utils";
import type { UrgencyLevel } from "@/types";

interface UrgencyBadgeProps {
  urgency: UrgencyLevel;
}

export function UrgencyBadge({ urgency }: UrgencyBadgeProps) {
  const { label, className } = getUrgencyStyle(urgency);

  return (
    <span className={`badge ${className}`}>
      {label}
    </span>
  );
}
