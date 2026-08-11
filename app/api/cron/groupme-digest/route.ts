import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { runGroupMeDigest } from "@/lib/groupme-digest";

export async function GET(request: NextRequest) {
  const authorized = isAuthorizedCronRequest(
    request.headers.get("authorization"),
    process.env.CRON_SECRET
  );

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runGroupMeDigest();
  return NextResponse.json(result);
}
