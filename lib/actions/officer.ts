"use server";

import { revalidatePath } from "next/cache";
import { requireOfficer } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export async function setMemberRole(formData: FormData): Promise<void> {
  await requireOfficer();

  const profileId = String(formData.get("profileId") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!profileId || (role !== "member" && role !== "officer")) {
    throw new Error("Invalid role update request.");
  }

  const supabase = await createClient();

  const { error } = await supabase.rpc("set_member_role", {
    target_id: profileId,
    target_role: role,
  });
  if (error) {
    throw new Error(`Failed to update role: ${error.message}`);
  }

  revalidatePath("/officer");
}
