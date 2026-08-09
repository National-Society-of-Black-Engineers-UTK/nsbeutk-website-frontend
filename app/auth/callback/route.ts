import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/auth/profile";
import { isSafeNextPath } from "@/lib/auth/validation";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/portal";
  const next = isSafeNextPath(rawNext) ? rawNext : "/portal";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user?.email) {
      try {
        await ensureProfile(supabase, { id: data.user.id, email: data.user.email });
        return NextResponse.redirect(`${origin}${next}`);
      } catch {
        // If profile creation fails, redirect to error page
        return NextResponse.redirect(`${origin}/login?error=auth`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
