# Phase 3: Opportunities Backend & GroupMe Bot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the Opportunities Hub from static hardcoded data to a real Supabase-backed
submission → officer-approval → public-display pipeline, and add a GroupMe bot that posts
approved opportunities to the chapter's GroupMe (instantly on approval, plus a weekly
safety-net digest for anything that didn't post).

**Architecture:** A new `opportunities` Supabase table (RLS: anyone can insert as `pending`,
only officers can read/update the base table) plus a `public_opportunities` view (approved
rows, PII columns excluded) that the public page reads from. GroupMe posting is a small
`fetch`-based helper called directly from the approval Server Action (instant post) and from a
Vercel Cron-triggered route handler (weekly safety net for anything `posted_to_groupme_at IS
NULL`), both sharing one digest function so there's a single code path for "post the digest,"
whether triggered by the cron schedule or an officer's manual button.

**Tech Stack:** Next.js Server Actions + Route Handlers, Supabase (Postgres + RLS + service-role
client), Vercel Cron, native `fetch` against the GroupMe Bot API. No new npm packages — this
phase only uses `@supabase/supabase-js`, `zod`, and `react-hook-form`, all already installed.

## Global Constraints

- No new npm packages. Everything needed (`@supabase/supabase-js`, `zod`, `react-hook-form`,
  native `fetch`) is already a dependency.
- Every Server Action that mutates officer-only data (`approveOpportunity`,
  `rejectOpportunity`, `postGroupMeDigestNow`) must call `requireOfficer()` from
  `@/lib/auth/dal` as its first line — this is the actual security boundary, not whichever
  buttons the UI happens to show.
- `SUPABASE_SERVICE_ROLE_KEY` must never be read from client code and must never get a
  `NEXT_PUBLIC_` prefix. It's only read inside `lib/supabase/service.ts`, which is only ever
  imported from server-only orchestration code (route handlers, Server Actions).
- **Critical, non-obvious constraint discovered during planning:** the `server-only` package
  referenced by `lib/supabase/server.ts`, `lib/auth/profile.ts`, and `lib/auth/dal.ts` is *not
  installed in `node_modules`* — it only resolves inside Next.js's own bundler, which
  special-cases that import specifier. Vitest runs under plain Node, so **any test file that
  imports a module which imports `server-only` (directly or transitively) fails immediately
  with `MODULE_NOT_FOUND`**, before your test logic ever runs. This is why `lib/actions/officer.ts`
  (an existing file) has no test file today — it's not an oversight, it's this constraint. Every
  task below that adds a *tested* pure-logic file is deliberately kept free of any import chain
  that touches `server-only`; every task that must touch Supabase or auth is deliberately left
  untested (matching this codebase's existing convention for that kind of code), with a manual
  verification note instead. Do not "fix" this by adding a test to an orchestration file — it
  will fail for a reason unrelated to your code.
- Follow existing UI primitives (`Button`, `Input`, `Textarea`, `Field`, `Card`, `Badge` in
  `components/ui/`) — don't introduce new component primitives for this phase.
- Vercel Cron schedules run in UTC with no daylight-saving awareness — this is a known,
  accepted limitation (see Task 8), not something to solve with extra infrastructure.
- Verify TypeScript compiles cleanly after every task that has no automated test:
  `npx tsc --noEmit`.

---

## Task 1: Opportunities data model migration

**Files:**
- Create: `supabase/migrations/0002_opportunities.sql`

**Interfaces:**
- Produces: an `opportunities` table (columns: `id`, `title`, `company`, `category`,
  `deadline`, `eligibility`, `description`, `url`, `submitted_by_name`, `submitted_by_email`,
  `status`, `posted_to_groupme_at`, `created_at`) and a `public_opportunities` view (columns:
  `id`, `title`, `company`, `category`, `deadline`, `eligibility`, `description`, `url`) that
  every later task's Supabase queries assume exist.

This phase doesn't include Supabase CLI/local-dev tooling (same as Phase 2) — this migration is
applied once, by hand, in the Supabase SQL editor.

- [ ] **Step 1: Write the migration file**

```sql
-- supabase/migrations/0002_opportunities.sql
create table opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  category text not null,
  deadline timestamptz not null,
  eligibility text not null,
  description text not null,
  url text not null,
  submitted_by_name text not null,
  submitted_by_email text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'archived')),
  posted_to_groupme_at timestamptz,
  created_at timestamptz not null default now()
);

alter table opportunities enable row level security;

-- Anyone (including anonymous visitors -- sponsors, alumni, non-members) can submit an
-- opportunity. The check clause blocks setting any status other than 'pending' on insert, so a
-- submitter can't self-approve by crafting the request.
create policy "anyone can submit an opportunity"
  on opportunities for insert
  to anon, authenticated
  with check (status = 'pending');

-- Only officers can read the base table directly -- it holds submitter PII
-- (submitted_by_name / submitted_by_email) that the public should never see, even for
-- approved rows. Public browsing goes through the public_opportunities view below instead,
-- which never selects those columns.
create policy "officers can read all opportunities"
  on opportunities for select
  to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'officer'));

-- Officers can update status (approve/reject) and posted_to_groupme_at.
create policy "officers can update opportunities"
  on opportunities for update
  to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'officer'));

-- Public-safe view: approved rows only, no submitter PII columns. Views run with the
-- definer's privileges by default in Postgres, so granting SELECT on this view to
-- anon/authenticated exposes exactly these eight columns without granting any privileges on
-- the opportunities table itself.
create view public_opportunities as
  select id, title, company, category, deadline, eligibility, description, url
  from opportunities
  where status = 'approved';

grant select on public_opportunities to anon, authenticated;
```

- [ ] **Step 2: Apply and manually verify in the Supabase SQL editor**

Run the migration against the project's Supabase database, then verify in the SQL editor (or
via the Supabase table editor) as a checklist:
- Insert a row directly as `anon` (via the REST API with the anon key, or the SQL editor
  running `set role anon;`) with `status = 'pending'` — should succeed.
- Attempting the same insert with `status = 'approved'` should be rejected by RLS.
- As `anon`, `select * from opportunities` should return zero rows / be denied (no SELECT
  policy grants anon access to the base table).
- As `anon`, `select * from public_opportunities` should return only rows where
  `status = 'approved'`, and never include `submitted_by_name` / `submitted_by_email` (the
  view doesn't have those columns at all).
- As an authenticated officer, `select * from opportunities` should return every row
  regardless of status.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0002_opportunities.sql
git commit -m "feat: add opportunities table, RLS policies, and public view"
```

---

## Task 2: GroupMe posting helper

**Files:**
- Create: `lib/groupme.ts`
- Test: `lib/groupme.test.ts`

**Interfaces:**
- Produces: `postToGroupMe(text: string): Promise<boolean>` — used by Task 7 (`groupme-digest.ts`)
  and Task 10 (`approveOpportunity`).

This file deliberately does **not** import `server-only` (see Global Constraints) — it's pure
enough (one `fetch` call plus one env var read) that it doesn't need the compile-time guard,
and skipping it is what makes it unit-testable under Vitest.

- [ ] **Step 1: Write the failing tests**

```ts
// lib/groupme.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { postToGroupMe } from "./groupme";

describe("postToGroupMe", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("posts the bot_id and text to the GroupMe bots endpoint", async () => {
    vi.stubEnv("GROUPME_BOT_ID", "test-bot-id");
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 202 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await postToGroupMe("hello chapter");

    expect(result).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.groupme.com/v3/bots/post",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bot_id: "test-bot-id", text: "hello chapter" }),
      })
    );
  });

  it("returns false when the GroupMe API responds with an error status", async () => {
    vi.stubEnv("GROUPME_BOT_ID", "test-bot-id");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 500 })));

    expect(await postToGroupMe("hello chapter")).toBe(false);
  });

  it("returns false when GROUPME_BOT_ID is not set", async () => {
    vi.stubEnv("GROUPME_BOT_ID", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    expect(await postToGroupMe("hello chapter")).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns false when the fetch call throws", async () => {
    vi.stubEnv("GROUPME_BOT_ID", "test-bot-id");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    expect(await postToGroupMe("hello chapter")).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run lib/groupme.test.ts`
Expected: FAIL with "Cannot find module './groupme'" (or similar — the module doesn't exist yet).

- [ ] **Step 3: Write the implementation**

```ts
// lib/groupme.ts
export async function postToGroupMe(text: string): Promise<boolean> {
  const botId = process.env.GROUPME_BOT_ID;

  if (!botId) {
    console.error("postToGroupMe: GROUPME_BOT_ID is not set");
    return false;
  }

  try {
    const response = await fetch("https://api.groupme.com/v3/bots/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bot_id: botId, text }),
    });

    return response.ok;
  } catch (error) {
    console.error("postToGroupMe: request failed", error);
    return false;
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run lib/groupme.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/groupme.ts lib/groupme.test.ts
git commit -m "feat: add GroupMe bot posting helper"
```

---

## Task 3: GroupMe message formatting

**Files:**
- Create: `lib/groupme-messages.ts`
- Test: `lib/groupme-messages.test.ts`

**Interfaces:**
- Consumes: nothing (pure formatting, plus `formatDate` from `@/lib/utils/dates`, already
  tested and already free of `server-only`).
- Produces: `type GroupMeOpportunity = { title: string; company: string; deadline: string; url:
  string }`, `buildSingleOpportunityMessage(opportunity: GroupMeOpportunity): string`,
  `buildDigestMessage(opportunities: GroupMeOpportunity[]): string`. Task 7 and Task 10 both
  import from this file.

- [ ] **Step 1: Write the failing tests**

```ts
// lib/groupme-messages.test.ts
import { describe, expect, it } from "vitest";
import { buildDigestMessage, buildSingleOpportunityMessage } from "./groupme-messages";

const sampleOpportunity = {
  title: "Software Engineering Intern",
  company: "Meridian Systems",
  deadline: "2026-09-15T00:00:00Z",
  url: "https://example.com",
};

describe("buildSingleOpportunityMessage", () => {
  it("formats a single opportunity announcement", () => {
    const message = buildSingleOpportunityMessage(sampleOpportunity);

    expect(message).toBe(
      "📢 New Opportunity\n" +
        "💼 Software Engineering Intern — Meridian Systems\n" +
        "📅 Deadline: September 15, 2026\n" +
        "🔗 https://example.com\n" +
        "Submit yours: nsbeutk.org/opportunities/submit"
    );
  });
});

describe("buildDigestMessage", () => {
  it("formats multiple opportunities into one digest", () => {
    const message = buildDigestMessage([
      sampleOpportunity,
      {
        title: "GEM Fellowship",
        company: "The GEM Consortium",
        deadline: "2026-11-15T00:00:00Z",
        url: "https://example.com/gem",
      },
    ]);

    expect(message).toBe(
      "📢 Opportunities Digest\n" +
        "💼 Software Engineering Intern — Meridian Systems\n📅 Deadline: September 15, 2026\n🔗 https://example.com\n\n" +
        "💼 GEM Fellowship — The GEM Consortium\n📅 Deadline: November 15, 2026\n🔗 https://example.com/gem\n\n" +
        "View all: nsbeutk.org/opportunities"
    );
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run lib/groupme-messages.test.ts`
Expected: FAIL with "Cannot find module './groupme-messages'"

- [ ] **Step 3: Write the implementation**

```ts
// lib/groupme-messages.ts
import { formatDate } from "@/lib/utils/dates";

export type GroupMeOpportunity = {
  title: string;
  company: string;
  deadline: string;
  url: string;
};

export function buildSingleOpportunityMessage(opportunity: GroupMeOpportunity): string {
  return [
    "📢 New Opportunity",
    `💼 ${opportunity.title} — ${opportunity.company}`,
    `📅 Deadline: ${formatDate(opportunity.deadline)}`,
    `🔗 ${opportunity.url}`,
    "Submit yours: nsbeutk.org/opportunities/submit",
  ].join("\n");
}

export function buildDigestMessage(opportunities: GroupMeOpportunity[]): string {
  const blocks = opportunities
    .map(
      (opportunity) =>
        `💼 ${opportunity.title} — ${opportunity.company}\n📅 Deadline: ${formatDate(opportunity.deadline)}\n🔗 ${opportunity.url}`
    )
    .join("\n\n");

  return `📢 Opportunities Digest\n${blocks}\n\nView all: nsbeutk.org/opportunities`;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run lib/groupme-messages.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/groupme-messages.ts lib/groupme-messages.test.ts
git commit -m "feat: add GroupMe message formatting helpers"
```

---

## Task 4: Cron request authorization check

**Files:**
- Create: `lib/cron-auth.ts`
- Test: `lib/cron-auth.test.ts`

**Interfaces:**
- Produces: `isAuthorizedCronRequest(authorizationHeader: string | null, expectedSecret:
  string | undefined): boolean`. Task 8's route handler passes
  `request.headers.get("authorization")` and `process.env.CRON_SECRET`.

Takes the secret as a parameter (rather than reading `process.env` internally) specifically so
it stays pure and testable — matches how `lib/auth/validation.ts`'s `isUtkEmail` /
`isSafeNextPath` are pure, parameter-driven functions in this codebase.

- [ ] **Step 1: Write the failing tests**

```ts
// lib/cron-auth.test.ts
import { describe, expect, it } from "vitest";
import { isAuthorizedCronRequest } from "./cron-auth";

describe("isAuthorizedCronRequest", () => {
  it("accepts a matching bearer token", () => {
    expect(isAuthorizedCronRequest("Bearer secret123", "secret123")).toBe(true);
  });

  it("rejects a missing authorization header", () => {
    expect(isAuthorizedCronRequest(null, "secret123")).toBe(false);
  });

  it("rejects a mismatched token", () => {
    expect(isAuthorizedCronRequest("Bearer wrong", "secret123")).toBe(false);
  });

  it("rejects when no secret is configured", () => {
    expect(isAuthorizedCronRequest("Bearer secret123", undefined)).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run lib/cron-auth.test.ts`
Expected: FAIL with "Cannot find module './cron-auth'"

- [ ] **Step 3: Write the implementation**

```ts
// lib/cron-auth.ts
export function isAuthorizedCronRequest(
  authorizationHeader: string | null,
  expectedSecret: string | undefined
): boolean {
  if (!expectedSecret) {
    return false;
  }

  return authorizationHeader === `Bearer ${expectedSecret}`;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run lib/cron-auth.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/cron-auth.ts lib/cron-auth.test.ts
git commit -m "feat: add cron request authorization check"
```

---

## Task 5: Opportunity submission payload builder

**Files:**
- Create: `lib/utils/opportunities-payload.ts`
- Test: `lib/utils/opportunities-payload.test.ts`

**Interfaces:**
- Consumes: `OpportunitySubmissionFormValues` (type-only import) from
  `@/lib/schemas/opportunity-submission` (already exists — no `server-only` in its import
  chain).
- Produces: `type OpportunityInsertPayload`, `buildOpportunityInsertPayload(values:
  OpportunitySubmissionFormValues): OpportunityInsertPayload`. Task 9's `submitOpportunity`
  imports this.

This mirrors the existing `lib/utils/opportunities-filter.ts` + `.test.ts` sibling pattern in
this codebase.

- [ ] **Step 1: Write the failing test**

```ts
// lib/utils/opportunities-payload.test.ts
import { describe, expect, it } from "vitest";
import { buildOpportunityInsertPayload } from "./opportunities-payload";

describe("buildOpportunityInsertPayload", () => {
  it("maps form values to the opportunities table's column names", () => {
    const payload = buildOpportunityInsertPayload({
      title: "Data Analyst Intern",
      company: "Example Corp",
      category: "Internship",
      deadline: "2026-12-01",
      eligibility: "Sophomore or above",
      description: "A summer internship on the analytics team.",
      url: "https://example.com",
      submitterName: "Jordan Williams",
      submitterEmail: "jordan@example.com",
    });

    expect(payload).toEqual({
      title: "Data Analyst Intern",
      company: "Example Corp",
      category: "Internship",
      deadline: "2026-12-01",
      eligibility: "Sophomore or above",
      description: "A summer internship on the analytics team.",
      url: "https://example.com",
      submitted_by_name: "Jordan Williams",
      submitted_by_email: "jordan@example.com",
      status: "pending",
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/utils/opportunities-payload.test.ts`
Expected: FAIL with "Cannot find module './opportunities-payload'"

- [ ] **Step 3: Write the implementation**

```ts
// lib/utils/opportunities-payload.ts
import type { OpportunitySubmissionFormValues } from "@/lib/schemas/opportunity-submission";

export type OpportunityInsertPayload = {
  title: string;
  company: string;
  category: string;
  deadline: string;
  eligibility: string;
  description: string;
  url: string;
  submitted_by_name: string;
  submitted_by_email: string;
  status: "pending";
};

export function buildOpportunityInsertPayload(
  values: OpportunitySubmissionFormValues
): OpportunityInsertPayload {
  return {
    title: values.title,
    company: values.company,
    category: values.category,
    deadline: values.deadline,
    eligibility: values.eligibility,
    description: values.description,
    url: values.url,
    submitted_by_name: values.submitterName,
    submitted_by_email: values.submitterEmail,
    status: "pending",
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run lib/utils/opportunities-payload.test.ts`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add lib/utils/opportunities-payload.ts lib/utils/opportunities-payload.test.ts
git commit -m "feat: add opportunity submission payload builder"
```

---

## Task 6: Service-role Supabase client and new environment variables

**Files:**
- Create: `lib/supabase/service.ts`
- Modify: `.env.example`

**Interfaces:**
- Produces: `createServiceClient(): SupabaseClient` — a Supabase client authenticated with the
  service-role key, bypassing RLS. Task 7 (`groupme-digest.ts`) is the only consumer.

No test for this file — it imports `server-only` and is a thin wrapper, matching
`lib/supabase/server.ts`'s existing (untested) precedent. Verify with a type check instead.

- [ ] **Step 1: Write the service client**

```ts
// lib/supabase/service.ts
import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
```

- [ ] **Step 2: Add the new environment variables to `.env.example`**

Add these three blocks after the existing `OFFICER_SEED_EMAILS` line in `.env.example`:

```
# Service-role key (Project Settings -> API -> service_role in the Supabase dashboard).
# Bypasses Row Level Security entirely -- only ever read server-side, in
# lib/supabase/service.ts, for the GroupMe digest cron job. Never expose this to the
# client and never prefix it with NEXT_PUBLIC_.
SUPABASE_SERVICE_ROLE_KEY=

# GroupMe Bot API (dev.groupme.com) -- the bot must already be registered against the
# chapter's GroupMe group; this app only posts to it, it doesn't create it.
GROUPME_BOT_ID=

# Shared secret Vercel Cron sends as a Bearer token when it calls
# /api/cron/groupme-digest, so the route can reject non-Vercel callers. Generate any
# random string; set the same value in Vercel project settings.
CRON_SECRET=
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/service.ts .env.example
git commit -m "feat: add service-role Supabase client and GroupMe/cron env vars"
```

---

## Task 7: Weekly GroupMe digest orchestration

**Files:**
- Create: `lib/groupme-digest.ts`

**Interfaces:**
- Consumes: `createServiceClient` (Task 6), `postToGroupMe` (Task 2), `buildDigestMessage` +
  `GroupMeOpportunity` (Task 3).
- Produces: `runGroupMeDigest(): Promise<{ posted: number }>`. Task 8's cron route and Task 11's
  `postGroupMeDigestNow` action both call this directly — it's the single code path for "post
  the digest," whether triggered by the cron schedule or an officer's manual button.

No automated test — it orchestrates a live Supabase query, a network call, and a Supabase
update, matching this codebase's convention of leaving that kind of orchestration to manual
verification (see Global Constraints). Verified manually in Task 8's checklist once the route
handler that calls it exists.

- [ ] **Step 1: Write the implementation**

```ts
// lib/groupme-digest.ts
import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { postToGroupMe } from "@/lib/groupme";
import { buildDigestMessage } from "@/lib/groupme-messages";

export async function runGroupMeDigest(): Promise<{ posted: number }> {
  const supabase = createServiceClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("opportunities")
    .select("id, title, company, deadline, url")
    .eq("status", "approved")
    .is("posted_to_groupme_at", null)
    .gte("created_at", sevenDaysAgo);

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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/groupme-digest.ts
git commit -m "feat: add GroupMe weekly digest orchestration"
```

---

## Task 8: Cron route handler and Vercel Cron schedule

**Files:**
- Create: `app/api/cron/groupme-digest/route.ts`
- Modify: `vercel.json`

**Interfaces:**
- Consumes: `isAuthorizedCronRequest` (Task 4), `runGroupMeDigest` (Task 7).
- Produces: a `GET /api/cron/groupme-digest` endpoint, called by Vercel Cron on the schedule
  below.

No automated test for the route itself — matches the existing, untested
`app/auth/callback/route.ts` in this codebase; the auth-check logic it depends on (Task 4) is
already unit tested on its own.

- [ ] **Step 1: Write the route handler**

```ts
// app/api/cron/groupme-digest/route.ts
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
```

- [ ] **Step 2: Add the Vercel Cron schedule**

Read the current `vercel.json` first (`{ "framework": "nextjs" }`), then update it to:

```json
{
  "framework": "nextjs",
  "crons": [
    {
      "path": "/api/cron/groupme-digest",
      "schedule": "0 1 * * 1"
    }
  ]
}
```

`0 1 * * 1` is 1am UTC every Monday — roughly 8-9pm Sunday Eastern, drifting by an hour across
daylight saving changes since Vercel Cron has no timezone awareness. Accepted limitation (see
Global Constraints), not something to fix here.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Manual verification checklist (requires a deployed Vercel project with `CRON_SECRET` set)**

- `curl` the route with no `Authorization` header → expect `401`.
- `curl -H "Authorization: Bearer <wrong-secret>"` → expect `401`.
- `curl -H "Authorization: Bearer <CRON_SECRET value>"` → expect `200` with a JSON body like
  `{"posted":0}` (or a real count if there happen to be qualifying rows).
- After deploying, confirm the cron job appears under the project's Vercel dashboard →
  Settings → Cron Jobs, scheduled for `0 1 * * 1`.

- [ ] **Step 5: Commit**

```bash
git add app/api/cron/groupme-digest/route.ts vercel.json
git commit -m "feat: add GroupMe digest cron route and Vercel Cron schedule"
```

---

## Task 9: Submission Server Action

**Files:**
- Create: `lib/actions/opportunities.ts`

**Interfaces:**
- Consumes: `opportunitySubmissionSchema`, `OpportunitySubmissionFormValues` (existing, from
  `@/lib/schemas/opportunity-submission`), `buildOpportunityInsertPayload` (Task 5),
  `createClient` (existing, from `@/lib/supabase/server`).
- Produces: `type SubmitOpportunityResult = { status: "success" } | { status: "error"; message:
  string }`, `submitOpportunity(values: OpportunitySubmissionFormValues, honeypot: string):
  Promise<SubmitOpportunityResult>`. Task 12's form component calls this directly (not via a
  `<form action>` prop — it's called as a plain async function from a `react-hook-form`
  submit handler, which is a supported way to invoke a Server Action).

No automated test — it's a `"use server"` orchestration function whose import chain includes
`@/lib/supabase/server` (which imports `server-only`), so it can't be unit tested under Vitest
(see Global Constraints). Its one piece of real logic, the payload mapping, is already covered
by Task 5's test.

- [ ] **Step 1: Write the implementation**

```ts
// lib/actions/opportunities.ts
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/actions/opportunities.ts
git commit -m "feat: add opportunity submission Server Action"
```

---

## Task 10: Approve / reject Server Actions

**Files:**
- Modify: `lib/actions/opportunities.ts`

**Interfaces:**
- Consumes: `requireOfficer` (existing, from `@/lib/auth/dal`), `postToGroupMe` (Task 2),
  `buildSingleOpportunityMessage` + `GroupMeOpportunity` (Task 3), `revalidatePath` (Next.js).
- Produces: `approveOpportunity(formData: FormData): Promise<void>`,
  `rejectOpportunity(formData: FormData): Promise<void>`. Task 13's `PendingOpportunities`
  component submits `<form action={approveOpportunity}>` / `<form action={rejectOpportunity}>`
  with a hidden `id` input, the same pattern `components/officer/officer-roster.tsx` already
  uses for `setMemberRole`.

No automated test — same `server-only` import-chain reason as Task 9.

- [ ] **Step 1: Add the two actions**

Append to `lib/actions/opportunities.ts` (add these imports to the top of the file alongside
the existing ones, and these two functions after `submitOpportunity`):

```ts
import { revalidatePath } from "next/cache";
import { requireOfficer } from "@/lib/auth/dal";
import { postToGroupMe } from "@/lib/groupme";
import { buildSingleOpportunityMessage, type GroupMeOpportunity } from "@/lib/groupme-messages";
```

```ts
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
```

A GroupMe post failure never blocks or rolls back the approval — the `if (posted)` guard is
the only thing gated on it. The row simply keeps `posted_to_groupme_at = null`, which is exactly
what makes it eligible for Task 7's weekly safety-net digest.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/actions/opportunities.ts
git commit -m "feat: add opportunity approve/reject Server Actions with GroupMe posting"
```

---

## Task 11: Manual "Post Now" Server Action

**Files:**
- Modify: `lib/actions/opportunities.ts`

**Interfaces:**
- Consumes: `requireOfficer` (existing), `runGroupMeDigest` (Task 7), `revalidatePath`
  (already imported by Task 10).
- Produces: `postGroupMeDigestNow(): Promise<void>`. Task 14's officer page submits
  `<form action={postGroupMeDigestNow}>`.

No automated test — same reason as Tasks 9 and 10.

- [ ] **Step 1: Add the action**

Append to `lib/actions/opportunities.ts` (add this import alongside the others, and this
function at the end of the file):

```ts
import { runGroupMeDigest } from "@/lib/groupme-digest";
```

```ts
export async function postGroupMeDigestNow(): Promise<void> {
  await requireOfficer();
  await runGroupMeDigest();
  revalidatePath("/officer");
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/actions/opportunities.ts
git commit -m "feat: add manual GroupMe digest trigger Server Action"
```

---

## Task 12: Wire the submission form to the real Server Action

**Files:**
- Modify: `components/forms/opportunity-submission-form.tsx`

**Interfaces:**
- Consumes: `submitOpportunity` (Task 9).

No automated test — no component in this codebase has a test file today (only `lib/` pure
logic does); verify manually in the browser (Step 3).

- [ ] **Step 1: Replace the file's submit handling**

Replace the full contents of `components/forms/opportunity-submission-form.tsx` with:

```tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { FormSuccess } from "@/components/shared/form-success";
import { OPPORTUNITY_CATEGORIES } from "@/lib/data/opportunities";
import { opportunitySubmissionSchema, type OpportunitySubmissionFormValues } from "@/lib/schemas/opportunity-submission";
import { submitOpportunity } from "@/lib/actions/opportunities";

export function OpportunitySubmissionForm() {
  const [submitted, setSubmitted] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | undefined>(undefined);
  const honeypotRef = React.useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OpportunitySubmissionFormValues>({ resolver: zodResolver(opportunitySubmissionSchema) });

  if (submitted) {
    return (
      <FormSuccess
        title="Submission received"
        description="An officer will review your submission before it's published to the Opportunities hub."
      >
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            reset();
            setSubmitted(false);
          }}
        >
          Submit another opportunity
        </Button>
      </FormSuccess>
    );
  }

  async function onSubmit(values: OpportunitySubmissionFormValues) {
    setSubmitError(undefined);
    const result = await submitOpportunity(values, honeypotRef.current?.value ?? "");

    if (result.status === "error") {
      setSubmitError(result.message);
      return;
    }

    setSubmitted(true);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="opp-website">Leave this field blank</label>
        <input ref={honeypotRef} id="opp-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <Field id="opp-title" label="Title" error={errors.title?.message}>
        <Input {...register("title")} />
      </Field>
      <Field id="opp-company" label="Company / organization" error={errors.company?.message}>
        <Input {...register("company")} />
      </Field>
      <Field id="opp-category" label="Category" error={errors.category?.message}>
        <select
          className="min-h-11 w-full rounded-md border border-border-subtle bg-fill-subtle px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          {...register("category")}
        >
          {OPPORTUNITY_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </Field>
      <Field id="opp-deadline" label="Deadline" error={errors.deadline?.message}>
        <Input type="date" {...register("deadline")} />
      </Field>
      <Field id="opp-eligibility" label="Eligibility" error={errors.eligibility?.message}>
        <Input placeholder="e.g. Sophomores and above, any major" {...register("eligibility")} />
      </Field>
      <Field id="opp-description" label="Description" error={errors.description?.message}>
        <Textarea rows={4} {...register("description")} />
      </Field>
      <Field id="opp-url" label="Apply / learn more URL" error={errors.url?.message}>
        <Input type="url" placeholder="https://" {...register("url")} />
      </Field>
      <Field id="opp-submitter-name" label="Your name" error={errors.submitterName?.message}>
        <Input {...register("submitterName")} />
      </Field>
      <Field id="opp-submitter-email" label="Your email" error={errors.submitterEmail?.message}>
        <Input type="email" {...register("submitterEmail")} />
      </Field>
      {submitError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {submitError}
        </p>
      ) : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit opportunity"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual verification in the browser**

Run `npm run dev`, visit `/opportunities`, and:
- Submit the form with valid data (leaving the hidden honeypot field alone, since it's
  off-screen) — confirm the "Submission received" success state appears, then check the
  Supabase table editor for a new row with `status = 'pending'`.
- Confirm Zod validation errors still appear inline for invalid input (e.g. an empty title, a
  `javascript:` URL) before any submission happens.

- [ ] **Step 4: Commit**

```bash
git add components/forms/opportunity-submission-form.tsx
git commit -m "feat: wire opportunity submission form to Supabase"
```

---

## Task 13: Public opportunities page reads from Supabase

**Files:**
- Modify: `app/opportunities/page.tsx`
- Modify: `lib/data/opportunities.ts`

**Interfaces:**
- Consumes: `createClient` (existing, from `@/lib/supabase/server`), the `public_opportunities`
  view (Task 1).
- Produces: no change to the `Opportunity` type, `OpportunityCategory` type, or
  `OPPORTUNITY_CATEGORIES` constant that `OpportunitiesBrowser`, `OpportunityCard`, and
  `lib/utils/opportunities-filter.ts` already depend on — only the now-unused static
  `opportunities` array is removed from `lib/data/opportunities.ts`.

No automated test — Server Component page, verified manually (Step 3).

- [ ] **Step 1: Remove the static opportunities array**

In `lib/data/opportunities.ts`, delete the `opportunities: Opportunity[]` array (the block
starting at `export const opportunities: Opportunity[] = [` through its closing `];`). Keep
`OPPORTUNITY_CATEGORIES`, `OpportunityCategory`, and `Opportunity` — every other file in the
codebase still imports those three.

- [ ] **Step 2: Fetch from Supabase in the page component**

Replace the full contents of `app/opportunities/page.tsx` with:

```tsx
import type { Metadata } from "next";
import { OpportunitiesBrowser } from "@/components/opportunities/opportunities-browser";
import { OpportunitySubmissionForm } from "@/components/forms/opportunity-submission-form";
import { createClient } from "@/lib/supabase/server";
import type { Opportunity } from "@/lib/data/opportunities";

export const metadata: Metadata = {
  title: "Opportunities",
  description: "Internships, scholarships, research, and more submitted by the NSBE UTK community.",
  openGraph: {
    title: "Opportunities",
    description: "Internships, scholarships, research, and more submitted by the NSBE UTK community.",
  },
};

export default async function OpportunitiesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("public_opportunities")
    .select("id, title, company, category, deadline, eligibility, description, url")
    .order("deadline", { ascending: true });

  if (error) {
    throw new Error(`Failed to load opportunities: ${error.message}`);
  }

  const opportunities = (data ?? []) as Opportunity[];

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-16 px-6 py-16">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold text-primary dark:text-secondary sm:text-4xl">Opportunities</h1>
        <p className="mt-4 text-base text-foreground">
          Browse internships, scholarships, research positions, and more. Anyone can submit an
          opportunity below — submissions are reviewed by an officer before they&apos;re published.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary dark:text-secondary">Browse opportunities</h2>
        <OpportunitiesBrowser opportunities={opportunities} />
      </section>

      <section className="max-w-xl">
        <h2 className="text-2xl font-bold text-primary dark:text-secondary">Submit an opportunity</h2>
        <div className="mt-6">
          <OpportunitySubmissionForm />
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles, then verify manually in the browser**

Run: `npx tsc --noEmit` — expect no errors.

Then run `npm run dev` and confirm:
- `/opportunities` loads with zero opportunities shown if the table is empty (no crash on an
  empty result set).
- After approving a pending opportunity via Task 14's officer UI, it appears on `/opportunities`
  within one page refresh (covered by `revalidatePath("/opportunities")` in Task 10).
- Category filter and search still work exactly as before against the live data.

- [ ] **Step 4: Commit**

```bash
git add app/opportunities/page.tsx lib/data/opportunities.ts
git commit -m "feat: read public opportunities page from Supabase"
```

---

## Task 14: Officer Pending Approvals UI

**Files:**
- Create: `components/officer/pending-opportunities.tsx`
- Modify: `app/officer/page.tsx`

**Interfaces:**
- Consumes: `approveOpportunity`, `rejectOpportunity` (Task 10), `postGroupMeDigestNow` (Task
  11), `formatDate` (existing, from `@/lib/utils/dates`).
- Produces: replaces the "Pending Approvals" `ComingSoonCard` on `/officer` with a real,
  functional queue.

No automated test — same "no component has a test file" reasoning as Task 12; verify manually
in the browser (Step 3).

- [ ] **Step 1: Write the pending-approvals component**

```tsx
// components/officer/pending-opportunities.tsx
import { approveOpportunity, rejectOpportunity } from "@/lib/actions/opportunities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/dates";

type PendingOpportunity = {
  id: string;
  title: string;
  company: string;
  category: string;
  deadline: string;
  submitted_by_name: string;
  submitted_by_email: string;
};

export function PendingOpportunities({ opportunities }: { opportunities: PendingOpportunity[] }) {
  if (opportunities.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm text-caption">No opportunities are waiting for review.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {opportunities.map((opportunity) => (
        <Card key={opportunity.id} className="flex flex-col gap-2 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">{opportunity.category}</Badge>
            <h3 className="text-lg font-bold text-primary dark:text-secondary">{opportunity.title}</h3>
          </div>
          <p className="text-sm font-medium text-foreground">{opportunity.company}</p>
          <p className="text-sm text-caption">Deadline: {formatDate(opportunity.deadline)}</p>
          <p className="text-sm text-caption">
            Submitted by {opportunity.submitted_by_name} ({opportunity.submitted_by_email})
          </p>
          <div className="mt-2 flex gap-3">
            <form action={approveOpportunity}>
              <input type="hidden" name="id" value={opportunity.id} />
              <Button type="submit" className="min-h-9 px-4 py-2 text-xs">
                Approve
              </Button>
            </form>
            <form action={rejectOpportunity}>
              <input type="hidden" name="id" value={opportunity.id} />
              <Button type="submit" variant="secondary" className="min-h-9 px-4 py-2 text-xs">
                Reject
              </Button>
            </form>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Wire it into the officer dashboard**

Replace the full contents of `app/officer/page.tsx` with:

```tsx
import type { Metadata } from "next";
import { CalendarCog, LineChart, Mail } from "lucide-react";
import { requireOfficer } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { listProfiles } from "@/lib/auth/profile";
import { ComingSoonCard } from "@/components/portal/coming-soon-card";
import { SignOutButton } from "@/components/shared/sign-out-button";
import { OfficerRoster } from "@/components/officer/officer-roster";
import { PendingOpportunities } from "@/components/officer/pending-opportunities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { postGroupMeDigestNow } from "@/lib/actions/opportunities";

export const metadata: Metadata = {
  title: "Officer Dashboard",
};

export default async function OfficerPage() {
  const { profile } = await requireOfficer();
  const supabase = await createClient();
  const roster = await listProfiles(supabase);

  const { data: pendingOpportunities, error: pendingError } = await supabase
    .from("opportunities")
    .select("id, title, company, category, deadline, submitted_by_name, submitted_by_email")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (pendingError) {
    throw new Error(`Failed to load pending opportunities: ${pendingError.message}`);
  }

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary dark:text-secondary sm:text-4xl">
            Officer Dashboard
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-sm text-caption">{profile.email}</p>
            <Badge variant="primary">{profile.role}</Badge>
          </div>
        </div>
        <SignOutButton />
      </div>

      <section>
        <h2 className="text-xl font-bold text-primary dark:text-secondary">Officer Roster</h2>
        <p className="mt-1 text-sm text-caption">
          Promote members to officer or demote officers back to member.
        </p>
        <OfficerRoster roster={roster} currentProfileId={profile.id} />
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-primary dark:text-secondary">Pending Approvals</h2>
            <p className="mt-1 text-sm text-caption">
              Approving posts to GroupMe immediately. A weekly digest catches anything that
              fails to post.
            </p>
          </div>
          <form action={postGroupMeDigestNow}>
            <Button type="submit" variant="secondary" className="min-h-9 px-4 py-2 text-xs">
              Post GroupMe Digest Now
            </Button>
          </form>
        </div>
        <div className="mt-4">
          <PendingOpportunities opportunities={pendingOpportunities ?? []} />
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ComingSoonCard
          icon={CalendarCog}
          title="Event Control"
          description="Set the active event for QR check-in."
        />
        <ComingSoonCard
          icon={LineChart}
          title="Membership Analytics"
          description="Attendance and points charts for the chapter."
        />
        <ComingSoonCard
          icon={Mail}
          title="Newsletter Stats"
          description="MailerLite subscriber count and open rates."
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles, then verify manually in the browser**

Run: `npx tsc --noEmit` — expect no errors.

Then, as an officer account, on `/officer`:
- Confirm pending submissions from Task 12's testing appear in the queue with all their
  details.
- Click **Approve** on one — confirm it disappears from the pending queue, appears on
  `/opportunities`, and (if `GROUPME_BOT_ID` is set to a real bot) posts to the chapter's
  GroupMe.
- Click **Reject** on another — confirm it disappears from the pending queue and never appears
  on `/opportunities`.
- Click **Post GroupMe Digest Now** with no unposted approved opportunities — confirm it
  doesn't error and doesn't post an empty message to GroupMe.

- [ ] **Step 4: Commit**

```bash
git add components/officer/pending-opportunities.tsx app/officer/page.tsx
git commit -m "feat: add officer Pending Approvals UI with GroupMe digest trigger"
```
