"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Settings, Bot, Globe, Bell, User } from "lucide-react";

interface SettingRowProps {
  label: string;
  description: string;
  control: React.ReactNode;
}

function SettingRow({ label, description, control }: SettingRowProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 0",
        borderBottom: "1px solid var(--border-subtle)",
        gap: "1.5rem",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "0.9375rem", fontWeight: 500, color: "var(--text-primary)", marginBottom: "0.125rem" }}>
          {label}
        </div>
        <div className="text-body" style={{ fontSize: "0.8125rem" }}>
          {description}
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>{control}</div>
    </div>
  );
}

function Toggle({ id, defaultChecked = false }: { id: string; defaultChecked?: boolean }) {
  return (
    <label
      htmlFor={id}
      style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}
    >
      <input
        id={id}
        type="checkbox"
        defaultChecked={defaultChecked}
        style={{ accentColor: "#6366f1", width: 16, height: 16, cursor: "pointer" }}
      />
    </label>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="card" style={{ padding: "1.5rem", marginBottom: "1.25rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        <Icon size={16} color="#6366f1" />
        <h2 className="heading-sm">{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Configure OBYON Signal for your team."
      />

      <div style={{ maxWidth: 720 }}>
        {/* General */}
        <Section title="General" icon={Settings}>
          <SettingRow
            label="Workspace Name"
            description="Display name for your OBYON Signal workspace."
            control={
              <input
                id="settings-workspace-name"
                className="input"
                style={{ width: 200 }}
                defaultValue="OBYON Signal"
              />
            }
          />
          <SettingRow
            label="Default Currency"
            description="Currency used for budget signal detection."
            control={
              <select id="settings-currency" className="select" style={{ width: 120 }}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
                <option value="SGD">SGD</option>
              </select>
            }
          />
          <SettingRow
            label="Default Min Intent Score"
            description="Minimum score to surface an opportunity by default."
            control={
              <input
                id="settings-min-score"
                className="input"
                type="number"
                style={{ width: 80 }}
                min={0}
                max={100}
                defaultValue={50}
              />
            }
          />
        </Section>

        {/* AI Providers */}
        <Section title="AI Providers" icon={Bot}>
          <div
            style={{
              background: "rgba(99,102,241,0.05)",
              border: "1px solid rgba(99,102,241,0.15)",
              borderRadius: "0.5rem",
              padding: "0.875rem 1rem",
              marginBottom: "1rem",
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
            }}
          >
            <strong style={{ color: "#a5b4fc" }}>Phase 1:</strong> AI providers are not yet
            connected. Set your API keys in <code style={{ fontFamily: "var(--font-mono)", color: "#10b981", fontSize: "0.8125rem" }}>.env.local</code> to enable analysis in Phase 2.
          </div>
          <SettingRow
            label="Active AI Provider"
            description="Provider used for intent analysis and outreach generation."
            control={
              <select id="settings-ai-provider" className="select" style={{ width: 140 }} disabled>
                <option value="mock">Mock (Phase 1)</option>
                <option value="gemini">Gemini</option>
                <option value="groq">Groq</option>
              </select>
            }
          />
          <SettingRow
            label="Gemini API Key"
            description="Set GEMINI_API_KEY in your .env.local file."
            control={
              <input
                id="settings-gemini-key"
                className="input"
                type="password"
                style={{ width: 200 }}
                placeholder="Set in .env.local"
                disabled
              />
            }
          />
          <SettingRow
            label="Groq API Key"
            description="Set GROQ_API_KEY in your .env.local file."
            control={
              <input
                id="settings-groq-key"
                className="input"
                type="password"
                style={{ width: 200 }}
                placeholder="Set in .env.local"
                disabled
              />
            }
          />
        </Section>

        {/* Sources */}
        <Section title="Source Configuration" icon={Globe}>
          <SettingRow
            label="Auto-sync Sources"
            description="Automatically scan sources on a schedule."
            control={<Toggle id="settings-autosync" />}
          />
          <SettingRow
            label="Sync Interval"
            description="How often to scan configured sources."
            control={
              <select id="settings-sync-interval" className="select" style={{ width: 130 }} disabled>
                <option>Every 6 hours</option>
                <option>Every 12 hours</option>
                <option>Daily</option>
              </select>
            }
          />
        </Section>

        {/* Notifications */}
        <Section title="Notifications" icon={Bell}>
          <SettingRow
            label="New High-Intent Signal"
            description="Notify when a new opportunity has intent score ≥ 80."
            control={<Toggle id="settings-notif-high-intent" defaultChecked />}
          />
          <SettingRow
            label="Daily Digest"
            description="Receive a daily summary of new opportunities."
            control={<Toggle id="settings-notif-digest" />}
          />
          <SettingRow
            label="Source Sync Errors"
            description="Alert when a source fails to sync."
            control={<Toggle id="settings-notif-errors" defaultChecked />}
          />
        </Section>

        {/* Profile */}
        <Section title="Profile" icon={User}>
          <SettingRow
            label="Display Name"
            description="Your name shown within the workspace."
            control={
              <input
                id="settings-display-name"
                className="input"
                style={{ width: 200 }}
                defaultValue="OBYON Team"
              />
            }
          />
        </Section>

        {/* Save Button */}
        <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "0.5rem" }}>
          <button
            id="settings-save-btn"
            className="btn btn-primary"
            onClick={() => alert("Settings saved (mock — Phase 2 will persist to DB)")}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
