import "server-only";

import { randomUUID } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/service";
import { GroupMeDeliveryError, postToGroupMe } from "@/lib/groupme";
import {
  buildDigestMessage,
  buildSingleOpportunityMessage,
  type GroupMeOpportunity,
} from "@/lib/groupme-messages";

export async function runGroupMeDigest(opportunityId?: string): Promise<{ posted: number }> {
  const supabase = createServiceClient();
  const batchId = randomUUID();
  const { data, error } = await supabase.rpc("claim_groupme_deliveries", {
    batch_id: batchId,
    target_id: opportunityId ?? null,
  });

  if (error) {
    throw new Error(`Failed to claim GroupMe deliveries: ${error.message}`);
  }

  const opportunities: GroupMeOpportunity[] = data ?? [];
  if (opportunities.length === 0) {
    return { posted: 0 };
  }

  const message = opportunityId
    ? buildSingleOpportunityMessage(opportunities[0])
    : buildDigestMessage(opportunities);

  let failure: GroupMeDeliveryError | undefined;
  try {
    await postToGroupMe(message);
  } catch (error) {
    if (!(error instanceof GroupMeDeliveryError)) throw error;
    failure = error;
  }

  const { error: finishError } = await supabase.rpc("finish_groupme_deliveries", {
    batch_id: batchId,
    outcome: failure?.outcome ?? "sent",
  });

  if (finishError) {
    throw new Error(`Failed to record GroupMe delivery ${batchId}: ${finishError.message}`, { cause: failure });
  }
  if (failure) throw failure;

  return { posted: opportunities.length };
}
