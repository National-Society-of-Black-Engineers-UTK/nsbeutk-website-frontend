import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/service";
import { isUtkEmail } from "@/lib/auth/validation";

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
  if (!isUtkEmail(user.email)) {
    throw new Error("A verified UTK email address is required.");
  }
  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) {
    throw new Error(`Failed to read profile for ${user.email}: ${selectError.message}`);
  }

  if (existing) {
    return profileFromRow(existing as ProfileRow);
  }

  const seedEmails = getOfficerSeedEmails();
  const role: MemberRole = seedEmails.includes(user.email.toLowerCase()) ? "officer" : "member";

  // Seed promotion is trusted server configuration; ordinary clients may only
  // provision member profiles under the database policy.
  const insertClient = role === "officer" ? createServiceClient() : supabase;
  const { data: created, error: insertError } = await insertClient
    .from("profiles")
    .insert({ id: user.id, email: user.email, role })
    .select(PROFILE_COLUMNS)
    .single();

  if (insertError) {
    // Two concurrent first-logins can race on the INSERT; the loser hits a
    // unique-violation on the primary key. Re-read instead of failing, since
    // the row now genuinely exists.
    if (insertError.code === "23505") {
      const { data: retried, error: retryError } = await supabase
        .from("profiles")
        .select(PROFILE_COLUMNS)
        .eq("id", user.id)
        .single();

      if (retryError || !retried) {
        throw new Error(
          `Failed to read profile for ${user.email} after insert conflict: ${retryError?.message ?? "unknown error"}`
        );
      }

      return profileFromRow(retried as ProfileRow);
    }

    throw new Error(`Failed to create profile for ${user.email}: ${insertError.message}`);
  }

  if (!created) {
    throw new Error(`Failed to create profile for ${user.email}: unknown error`);
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
