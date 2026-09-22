"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Zap,
  Bookmark,
  Globe,
  Briefcase,
  Settings,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const mainNavItems: NavItem[] = [
  {
    label: "Overview",
    href: "/overview",
    icon: <LayoutDashboard size={16} />,
  },
  {
    label: "Discover",
    href: "/discover",
    icon: <Search size={16} />,
  },
  {
    label: "Opportunities",
    href: "/opportunities",
    icon: <Zap size={16} />,
  },
  {
    label: "Saved",
    href: "/saved",
    icon: <Bookmark size={16} />,
  },
];

const resourceNavItems: NavItem[] = [
  {
    label: "Sources",
    href: "/sources",
    icon: <Globe size={16} />,
  },
  {
    label: "Services",
    href: "/services",
    icon: <Briefcase size={16} />,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <Settings size={16} />,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <TrendingUp size={14} color="white" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
          <span
            style={{
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            OBYON
          </span>
          <span
            style={{
              fontSize: "0.6875rem",
              color: "var(--text-muted)",
              fontWeight: 500,
              letterSpacing: "0.04em",
            }}
          >
            Signal
          </span>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Workspace</div>
        {mainNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn("sidebar-nav-item", isActive(item.href) && "active")}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}

        <div className="sidebar-section-label">Configuration</div>
        {resourceNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn("sidebar-nav-item", isActive(item.href) && "active")}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "1rem 1.25rem",
          borderTop: "1px solid var(--border-subtle)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 0",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "white",
              flexShrink: 0,
            }}
          >
            O
          </div>
          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              OBYON Team
            </div>
            <div
              style={{
                fontSize: "0.6875rem",
                color: "var(--text-muted)",
              }}
            >
              Phase 1 — Foundation
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
