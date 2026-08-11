import type { Metadata } from "next";
import { CalendarCog, LineChart, Mail } from "lucide-react";
import { requireOfficer } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { listProfiles } from "@/lib/auth/profile";
import { ComingSoonCard } from "@/components/portal/coming-soon-card";
import { SignOutButton } from "@/components/shared/sign-out-button";
import { OfficerRoster } from "@/components/officer/officer-roster";
import { PendingOpportunities } from "@/components/officer/pending-opportunities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { postGroupMeDigestNow } from "@/lib/actions/opportunities";

export const metadata: Metadata = {
  title: "Officer Dashboard",
};

export default async function OfficerPage() {
  const { profile } = await requireOfficer();
  const supabase = await createClient();
  const roster = await listProfiles(supabase);

  const { data: pendingOpportunities, error: pendingError } = await supabase
    .from("opportunities")
    .select("id, title, company, category, deadline, submitted_by_name, submitted_by_email")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (pendingError) {
    throw new Error(`Failed to load pending opportunities: ${pendingError.message}`);
  }

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary dark:text-secondary sm:text-4xl">
            Officer Dashboard
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-sm text-caption">{profile.email}</p>
            <Badge variant="primary">{profile.role}</Badge>
          </div>
        </div>
        <SignOutButton />
      </div>

      <section>
        <h2 className="text-xl font-bold text-primary dark:text-secondary">Officer Roster</h2>
        <p className="mt-1 text-sm text-caption">
          Promote members to officer or demote officers back to member.
        </p>
        <OfficerRoster roster={roster} currentProfileId={profile.id} />
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-primary dark:text-secondary">Pending Approvals</h2>
            <p className="mt-1 text-sm text-caption">
              Approving posts to GroupMe immediately. A weekly digest catches anything that
              fails to post.
            </p>
          </div>
          <form action={postGroupMeDigestNow}>
            <Button type="submit" variant="secondary" className="min-h-9 px-4 py-2 text-xs">
              Post GroupMe Digest Now
            </Button>
          </form>
        </div>
        <div className="mt-4">
          <PendingOpportunities opportunities={pendingOpportunities ?? []} />
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ComingSoonCard
          icon={CalendarCog}
          title="Event Control"
          description="Set the active event for QR check-in."
        />
        <ComingSoonCard
          icon={LineChart}
          title="Membership Analytics"
          description="Attendance and points charts for the chapter."
        />
        <ComingSoonCard
          icon={Mail}
          title="Newsletter Stats"
          description="MailerLite subscriber count and open rates."
        />
      </div>
    </div>
  );
}
