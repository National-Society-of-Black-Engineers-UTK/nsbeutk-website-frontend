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
  const { error } = await supabase
    .from("profiles")
    .update({ role: role as MemberRole })
    .eq("id", profileId);

  if (error) {
    throw new Error(`Failed to update role: ${error.message}`);
  }

  revalidatePath("/officer");
}
