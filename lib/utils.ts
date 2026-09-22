import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { IntentStrength, UrgencyLevel, BudgetSignal, OpportunityStatus } from "@/types";

// ============================================================
// Utility Functions
// ============================================================

/**
 * Merge Tailwind CSS class names intelligently.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string to a human-readable relative or absolute date.
 */
export function formatDate(dateString: string, relative = true): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (relative) {
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Get colour coding for intent score.
 */
export function getIntentScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-amber-400";
  return "text-zinc-400";
}

/**
 * Get background colour for intent score badge.
 */
export function getIntentScoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (score >= 60) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
}

/**
 * Get styling for intent strength badge.
 */
export function getIntentStrengthStyle(strength: IntentStrength): {
  label: string;
  className: string;
} {
  switch (strength) {
    case "explicit":
      return {
        label: "Explicit Intent",
        className: "bg-violet-500/10 text-violet-400 border-violet-500/20",
      };
    case "implicit":
      return {
        label: "Implicit Signal",
        className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      };
    case "weak":
      return {
        label: "Weak Signal",
        className: "bg-zinc-500/10 text-zinc-500 border-zinc-600/20",
      };
  }
}

/**
 * Get styling for urgency level.
 */
export function getUrgencyStyle(urgency: UrgencyLevel): {
  label: string;
  className: string;
} {
  switch (urgency) {
    case "critical":
      return { label: "Critical", className: "bg-red-500/10 text-red-400 border-red-500/20" };
    case "high":
      return {
        label: "High",
        className: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      };
    case "medium":
      return {
        label: "Medium",
        className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      };
    case "low":
      return { label: "Low", className: "bg-zinc-500/10 text-zinc-500 border-zinc-600/20" };
  }
}

/**
 * Get styling for budget signal.
 */
export function getBudgetSignalStyle(signal: BudgetSignal): {
  label: string;
  className: string;
} {
  switch (signal) {
    case "confirmed_budget":
      return {
        label: "Budget Confirmed",
        className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      };
    case "implied_budget":
      return {
        label: "Budget Implied",
        className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      };
    case "budget_concern":
      return {
        label: "Budget Concern",
        className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      };
    case "no_signal":
      return {
        label: "No Budget Signal",
        className: "bg-zinc-500/10 text-zinc-500 border-zinc-600/20",
      };
  }
}

/**
 * Get styling for opportunity status.
 */
export function getStatusStyle(status: OpportunityStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case "new":
      return { label: "New", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
    case "reviewing":
      return {
        label: "Reviewing",
        className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      };
    case "contacted":
      return {
        label: "Contacted",
        className: "bg-violet-500/10 text-violet-400 border-violet-500/20",
      };
    case "qualified":
      return {
        label: "Qualified",
        className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      };
    case "disqualified":
      return {
        label: "Disqualified",
        className: "bg-red-500/10 text-red-400 border-red-500/20",
      };
    case "converted":
      return {
        label: "Converted",
        className: "bg-green-500/10 text-green-400 border-green-500/20",
      };
  }
}

/**
 * Get source type icon name (Lucide icon name).
 */
export function getSourceIcon(sourceType: string): string {
  const icons: Record<string, string> = {
    twitter: "Twitter",
    linkedin: "Linkedin",
    reddit: "MessageSquare",
    hackernews: "Code2",
    upwork: "Briefcase",
    fiverr: "Zap",
    producthunt: "Rocket",
    github: "Github",
    quora: "HelpCircle",
    youtube: "Youtube",
    web: "Globe",
    other: "Globe",
  };
  return icons[sourceType] ?? "Globe";
}

/**
 * Map a ServiceCategory key to a display name.
 */
export function getServiceDisplayName(category: string): string {
  const names: Record<string, string> = {
    ai_automation: "AI Automation",
    ai_agents: "AI Agents",
    ai_chatbots: "AI Chatbots",
    ai_integrations: "AI Integrations",
    saas_development: "SaaS Development",
    web_development: "Web Development",
    mobile_development: "Mobile Development",
    custom_software: "Custom Software",
    video_editing: "Video Editing",
    ai_video: "AI Video",
    marketing_automation: "Marketing Automation",
    whatsapp_automation: "WhatsApp Automation",
    crm_automation: "CRM Automation",
    data_automation: "Data Automation",
    ui_ux: "UI/UX Design",
    cloud_devops: "Cloud / DevOps",
    api_integrations: "API Integrations",
    other: "Other",
  };
  return names[category] ?? category;
}

/**
 * Truncate text to a given character limit.
 */
export function truncate(text: string, limit: number): string {
  if (text.length <= limit) return text;
  return text.slice(0, limit).trimEnd() + "…";
}
