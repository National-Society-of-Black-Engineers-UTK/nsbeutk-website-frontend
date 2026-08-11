// lib/groupme-digest.ts
import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { postToGroupMe } from "@/lib/groupme";
import { buildDigestMessage } from "@/lib/groupme-messages";

export async function runGroupMeDigest(): Promise<{ posted: number }> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("opportunities")
    .select("id, title, company, deadline, url")
    .eq("status", "approved")
    .is("posted_to_groupme_at", null);

  if (error) {
    throw new Error(`Failed to load opportunities for GroupMe digest: ${error.message}`);
  }

  const opportunities = data ?? [];

  if (opportunities.length === 0) {
    return { posted: 0 };
  }

  const posted = await postToGroupMe(buildDigestMessage(opportunities));

  if (!posted) {
    return { posted: 0 };
  }

  const { error: updateError } = await supabase
    .from("opportunities")
    .update({ posted_to_groupme_at: new Date().toISOString() })
    .in(
      "id",
      opportunities.map((opportunity) => opportunity.id)
    );

  if (updateError) {
    throw new Error(`Failed to mark opportunities as posted: ${updateError.message}`);
  }

  return { posted: opportunities.length };
}
