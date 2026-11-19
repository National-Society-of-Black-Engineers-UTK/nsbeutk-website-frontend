"use server";

import { createClient } from "@/lib/supabase/server";
import {
  opportunitySubmissionSchema,
  type OpportunitySubmissionFormValues,
} from "@/lib/schemas/opportunity-submission";
import { buildOpportunityInsertPayload } from "@/lib/utils/opportunities-payload";
import { revalidatePath } from "next/cache";
import { requireOfficer } from "@/lib/auth/dal";
import { createServiceClient } from "@/lib/supabase/service";
import { opportunityDeadlineCutoff } from "@/lib/utils/dates";
import { runGroupMeDigest } from "@/lib/groupme-digest";

export type SubmitOpportunityResult = { status: "success" } | { status: "error"; message: string };

export async function submitOpportunity(
  values: OpportunitySubmissionFormValues,
  honeypot: string
): Promise<SubmitOpportunityResult> {
  if (typeof honeypot !== "string") {
    return { status: "error", message: "Invalid submission." };
  }
  if (honeypot.trim().length > 0) {
    // A real user never fills this hidden field in; a bot filling forms by field name
    // often does. Pretend to succeed rather than tipping it off.
    return { status: "success" };
  }

  const parsed = opportunitySubmissionSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", message: "Check the submission fields and try again." };
  }

  if (parsed.data.deadline < opportunityDeadlineCutoff().slice(0, 10)) {
    return { status: "error", message: "Select a deadline of today or later in Eastern Time." };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("opportunities").insert(buildOpportunityInsertPayload(parsed.data));

  if (error) {
    return { status: "error", message: "Something went wrong submitting your opportunity. Try again." };
  }

  return { status: "success" };
}

export async function approveOpportunity(formData: FormData): Promise<void> {
  await requireOfficer();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    throw new Error("Missing opportunity id.");
  }

  const supabase = await createClient();

  const { data: updated, error: updateError } = await supabase
    .from("opportunities")
    .update({ status: "approved" })
    .eq("id", id)
    .eq("status", "pending")
    .select("id");
  if (updateError) {
    throw new Error(`Failed to approve opportunity: ${updateError.message}`);
  }

  revalidatePath("/officer");
  revalidatePath("/opportunities");

  if (updated?.length) {
    await runGroupMeDigest(id);
  }
}

export async function rejectOpportunity(formData: FormData): Promise<void> {
  await requireOfficer();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    throw new Error("Missing opportunity id.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("opportunities").update({ status: "rejected" })
    .eq("id", id)
    .eq("status", "pending");

  if (error) {
    throw new Error(`Failed to reject opportunity: ${error.message}`);
  }

  revalidatePath("/officer");
  revalidatePath("/opportunities");
}

export async function postGroupMeDigestNow(): Promise<void> {
  await requireOfficer();
  await runGroupMeDigest();
  revalidatePath("/officer");
}
