"use server";

import { createClient } from "@/lib/supabase/server";
import {
  opportunitySubmissionSchema,
  type OpportunitySubmissionFormValues,
} from "@/lib/schemas/opportunity-submission";
import { buildOpportunityInsertPayload } from "@/lib/utils/opportunities-payload";
import { revalidatePath } from "next/cache";
import { requireOfficer } from "@/lib/auth/dal";
import { postToGroupMe } from "@/lib/groupme";
import { buildSingleOpportunityMessage, type GroupMeOpportunity } from "@/lib/groupme-messages";
import { runGroupMeDigest } from "@/lib/groupme-digest";

export type SubmitOpportunityResult = { status: "success" } | { status: "error"; message: string };

export async function submitOpportunity(
  values: OpportunitySubmissionFormValues,
  honeypot: string
): Promise<SubmitOpportunityResult> {
  if (honeypot.trim().length > 0) {
    // A real user never fills this hidden field in; a bot filling forms by field name
    // often does. Pretend to succeed rather than tipping it off.
    return { status: "success" };
  }

  const parsed = opportunitySubmissionSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", message: "Check the highlighted fields and try again." };
  }

  const supabase = await createClient();
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

  const { error: updateError } = await supabase.from("opportunities").update({ status: "approved" }).eq("id", id);
  if (updateError) {
    throw new Error(`Failed to approve opportunity: ${updateError.message}`);
  }

  const { data: opportunity, error: fetchError } = await supabase
    .from("opportunities")
    .select("title, company, deadline, url")
    .eq("id", id)
    .single();

  if (!fetchError && opportunity) {
    const posted = await postToGroupMe(buildSingleOpportunityMessage(opportunity as GroupMeOpportunity));
    if (posted) {
      await supabase.from("opportunities").update({ posted_to_groupme_at: new Date().toISOString() }).eq("id", id);
    }
  }

  revalidatePath("/officer");
  revalidatePath("/opportunities");
}

export async function rejectOpportunity(formData: FormData): Promise<void> {
  await requireOfficer();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    throw new Error("Missing opportunity id.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("opportunities").update({ status: "rejected" }).eq("id", id);

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
