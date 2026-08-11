"use server";

import { createClient } from "@/lib/supabase/server";
import {
  opportunitySubmissionSchema,
  type OpportunitySubmissionFormValues,
} from "@/lib/schemas/opportunity-submission";
import { buildOpportunityInsertPayload } from "@/lib/utils/opportunities-payload";

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
