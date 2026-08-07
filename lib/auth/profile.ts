import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type MemberRole = "member" | "officer";

export type Profile = {
  id: string;
  email: string;
  fullName: string | null;
  role: MemberRole;
  createdAt: string;
};

type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: MemberRole;
  created_at: string;
};

const PROFILE_COLUMNS = "id, email, full_name, role, created_at";

function profileFromRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    createdAt: row.created_at,
  };
}

function getOfficerSeedEmails(): string[] {
  return (process.env.OFFICER_SEED_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function ensureProfile(
  supabase: SupabaseClient,
  user: { id: string; email: string }
): Promise<Profile> {
  const { data: existing } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    return profileFromRow(existing as ProfileRow);
  }

  const seedEmails = getOfficerSeedEmails();
  const role: MemberRole = seedEmails.includes(user.email.toLowerCase()) ? "officer" : "member";

  const { data: created, error } = await supabase
    .from("profiles")
    .insert({ id: user.id, email: user.email, role })
    .select(PROFILE_COLUMNS)
    .single();

  if (error || !created) {
    throw new Error(`Failed to create profile for ${user.email}: ${error?.message ?? "unknown error"}`);
  }

  return profileFromRow(created as ProfileRow);
}

export async function listProfiles(supabase: SupabaseClient): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to list profiles: ${error.message}`);
  }

  return (data as ProfileRow[]).map(profileFromRow);
}
