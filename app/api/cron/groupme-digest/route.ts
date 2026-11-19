import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { GroupMeDeliveryError } from "@/lib/groupme";
import { runGroupMeDigest } from "@/lib/groupme-digest";

export async function GET(request: NextRequest) {
  const authorized = isAuthorizedCronRequest(
    request.headers.get("authorization"),
    process.env.CRON_SECRET
  );

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(await runGroupMeDigest());
  } catch (error) {
    console.error("GroupMe digest failed", error);
    const status = error instanceof GroupMeDeliveryError ? error.statusCode : 500;
    return NextResponse.json({ error: "GroupMe digest failed" }, { status });
  }
}
