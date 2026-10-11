"use client";

import { useState } from "react";
import type { LeadStatus } from "@/types";
import { Check, Save, ExternalLink } from "lucide-react";

interface LeadStatusNotesProps {
  opportunityId: string;
  initialStatus: LeadStatus | string;
  initialNotes: string | null;
  sourceUrl: string;
}

const LEAD_STATUS_OPTIONS: LeadStatus[] = [
  "NEW",
  "QUALIFIED",
  "CONTACTED",
  "REPLIED",
  "MEETING",
  "WON",
  "LOST",
];

export function LeadStatusNotes({
  opportunityId,
  initialStatus,
  initialNotes,
  sourceUrl,
}: LeadStatusNotesProps) {
  const [status, setStatus] = useState<string>(initialStatus || "NEW");
  const [notes, setNotes] = useState<string>(initialNotes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/opportunities/${opportunityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update lead");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Lead Status Card */}
      <div className="card" style={{ padding: "1.25rem" }}>
        <h3 className="heading-sm" style={{ marginBottom: "0.75rem" }}>
          Pipeline Status
        </h3>

        <div style={{ marginBottom: "0.75rem" }}>
          <label className="text-label" htmlFor="lead-status-select" style={{ display: "block", marginBottom: "0.375rem" }}>
            Current Lead Stage
          </label>
          <select
            id="lead-status-select"
            className="select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ width: "100%", fontWeight: 600 }}
          >
            {LEAD_STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* View Original Source Button */}
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{
            width: "100%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          <ExternalLink size={15} />
          VIEW ORIGINAL SOURCE
        </a>
      </div>

      {/* Notes Card */}
      <div className="card" style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <h3 className="heading-sm">Prospect Notes</h3>
          {saveSuccess && (
            <span style={{ fontSize: "0.75rem", color: "#10b981", display: "flex", alignItems: "center", gap: 3 }}>
              <Check size={12} /> Saved
            </span>
          )}
        </div>

        <textarea
          className="input"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Contacted via LinkedIn on 8 Oct. Waiting for reply. Client asked for quote on AI chatbot..."
          style={{
            width: "100%",
            minHeight: 110,
            padding: "0.625rem",
            fontSize: "0.8125rem",
            lineHeight: 1.5,
            resize: "vertical",
            marginBottom: "0.75rem",
            fontFamily: "inherit",
          }}
        />

        {error && (
          <p style={{ fontSize: "0.75rem", color: "#f87171", margin: "0 0 0.5rem 0" }}>
            {error}
          </p>
        )}

        <button
          className="btn btn-secondary btn-sm"
          onClick={handleSave}
          disabled={isSaving}
          style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.375rem" }}
        >
          <Save size={13} />
          {isSaving ? "Saving..." : "Save Status & Notes"}
        </button>
      </div>
    </div>
  );
}
