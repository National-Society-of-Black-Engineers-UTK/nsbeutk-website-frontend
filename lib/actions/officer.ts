"use server";

import { revalidatePath } from "next/cache";
import { requireOfficer } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import type { MemberRole } from "@/lib/auth/profile";

export async function setMemberRole(formData: FormData): Promise<void> {
  await requireOfficer();

  const profileId = String(formData.get("profileId") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!profileId || (role !== "member" && role !== "officer")) {
    throw new Error("Invalid role update request.");
  }

  const supabase = await createClient();

  if (role === "member") {
    const { data: target, error: targetError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", profileId)
      .maybeSingle();

    if (targetError) {
      throw new Error(`Failed to look up member: ${targetError.message}`);
    }

    if (target?.role === "officer") {
      const { count, error: countError } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "officer");

      if (countError) {
        throw new Error(`Failed to verify officer count: ${countError.message}`);
      }

      if ((count ?? 0) <= 1) {
        throw new Error("Cannot demote the last remaining officer.");
      }
    }
  }

  const { data: updated, error } = await supabase
    .from("profiles")
    .update({ role: role as MemberRole })
    .eq("id", profileId)
    .select("id");

  if (error) {
    throw new Error(`Failed to update role: ${error.message}`);
  }

  if (!updated || updated.length === 0) {
    throw new Error("Role update was blocked or the member no longer exists.");
  }

  revalidatePath("/officer");
}
