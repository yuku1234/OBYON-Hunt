"use client";

import { Bell, Search } from "lucide-react";

export function TopNav() {
  return (
    <header className="topnav">
      {/* Search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.625rem",
          flex: 1,
          maxWidth: 360,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "var(--surface-2)",
            border: "1px solid var(--border-default)",
            borderRadius: "0.5rem",
            padding: "0.4375rem 0.75rem",
            width: "100%",
            cursor: "text",
          }}
        >
          <Search size={14} color="var(--text-muted)" />
          <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Search opportunities…
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: "0.6875rem",
              color: "var(--text-muted)",
              background: "var(--surface-4)",
              padding: "0.0625rem 0.375rem",
              borderRadius: "0.25rem",
              fontFamily: "var(--font-mono)",
            }}
          >
            ⌘K
          </span>
        </div>
      </div>

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {/* Notification bell */}
        <button
          id="topnav-notifications-btn"
          style={{
            position: "relative",
            width: 34,
            height: 34,
            borderRadius: "0.5rem",
            background: "transparent",
            border: "1px solid transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-muted)",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-3)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
          aria-label="Notifications"
        >
          <Bell size={16} />
          {/* Unread dot */}
          <span
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#6366f1",
              border: "1.5px solid var(--surface-0)",
            }}
          />
        </button>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 20,
            background: "var(--border-subtle)",
          }}
        />

        {/* User Avatar */}
        <button
          id="topnav-profile-btn"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.25rem 0.5rem",
            borderRadius: "0.5rem",
            background: "transparent",
            border: "1px solid transparent",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
          aria-label="User profile"
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
            }}
          >
            O
          </div>
        </button>
      </div>
    </header>
  );
}
