import type { Metadata } from "next";
import { Award, CalendarCheck, Users2 } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { ComingSoonCard } from "@/components/portal/coming-soon-card";
import { SignOutButton } from "@/components/shared/sign-out-button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Member Portal",
};

export default async function PortalPage() {
  const { profile } = await requireUser();

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary dark:text-secondary sm:text-4xl">
            Welcome, {profile.fullName ?? profile.email}
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-sm text-caption">{profile.email}</p>
            <Badge variant={profile.role === "officer" ? "primary" : "secondary"}>{profile.role}</Badge>
          </div>
        </div>
        <SignOutButton />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ComingSoonCard
          icon={Award}
          title="Points & Stole Progress"
          description="Track your semester points toward the 250-point stole requirement."
        />
        <ComingSoonCard
          icon={CalendarCheck}
          title="Attendance History"
          description="See every event you've checked in to this semester."
        />
        <ComingSoonCard
          icon={Users2}
          title="Committee"
          description="View your committee assignment and members."
        />
      </div>
    </div>
  );
}
