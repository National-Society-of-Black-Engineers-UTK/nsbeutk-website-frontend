import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile, type Profile } from "@/lib/auth/profile";

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return null;
  }

  return ensureProfile(supabase, { id: user.id, email: user.email });
});

export async function requireUser(): Promise<{ profile: Profile }> {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return { profile };
}

export async function requireOfficer(): Promise<{ profile: Profile }> {
  const { profile } = await requireUser();

  if (profile.role !== "officer") {
    redirect("/portal");
  }

  return { profile };
}
