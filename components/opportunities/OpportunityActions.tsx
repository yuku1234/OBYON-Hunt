"use client";

import { Bookmark, MessageSquare, Copy } from "lucide-react";

interface OpportunityActionsProps {
  outreachMessage: string;
}

export function OpportunityActions({ outreachMessage }: OpportunityActionsProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {
      // Clipboard API may not be available in all contexts
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <button
        id="detail-bookmark-btn"
        className="btn btn-secondary"
        style={{ width: "100%" }}
      >
        <Bookmark size={14} />
        Bookmark Opportunity
      </button>
      <button
        id="detail-outreach-btn"
        className="btn btn-primary"
        style={{ width: "100%" }}
        onClick={() => copyToClipboard(outreachMessage)}
      >
        <MessageSquare size={14} />
        Copy Outreach Message
      </button>
    </div>
  );
}

interface CopyOutreachButtonProps {
  text: string;
}

export function CopyOutreachButton({ text }: CopyOutreachButtonProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <button
      id="copy-outreach-btn"
      className="btn btn-secondary btn-sm"
      onClick={copyToClipboard}
    >
      <Copy size={13} />
      Copy
    </button>
  );
}
