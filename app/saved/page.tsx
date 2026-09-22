import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { mockOpportunities } from "@/lib/opportunities/mock-data";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Bookmark } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Saved",
};

export default function SavedPage() {
  const saved = mockOpportunities
    .filter((o) => o.isBookmarked)
    .sort((a, b) => b.intentScore - a.intentScore);

  return (
    <div>
      <PageHeader
        title="Saved"
        description="Opportunities you've bookmarked for follow-up."
        badge={saved.length > 0 ? `${saved.length}` : undefined}
      />

      {saved.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved opportunities yet"
          description="Bookmark high-potential opportunities to review them later. You'll find the bookmark button on each opportunity detail page."
          action={
            <Link href="/opportunities" className="btn btn-secondary">
              Browse opportunities
            </Link>
          }
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "1rem",
          }}
        >
          {saved.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      )}
    </div>
  );
}
