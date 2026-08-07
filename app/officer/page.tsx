import type { Metadata } from "next";
import { CalendarCog, ClipboardList, LineChart, Mail } from "lucide-react";
import { requireOfficer } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { listProfiles } from "@/lib/auth/profile";
import { ComingSoonCard } from "@/components/portal/coming-soon-card";
import { SignOutButton } from "@/components/shared/sign-out-button";
import { OfficerRoster } from "@/components/officer/officer-roster";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Officer Dashboard",
};

export default async function OfficerPage() {
  const { profile } = await requireOfficer();
  const supabase = await createClient();
  const roster = await listProfiles(supabase);

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

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <ComingSoonCard
          icon={ClipboardList}
          title="Pending Approvals"
          description="Review and approve opportunity submissions."
        />
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
