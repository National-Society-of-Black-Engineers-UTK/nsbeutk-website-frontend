# NSBE UTK Website — Phase 3: Opportunities Backend & GroupMe Bot Design

Source: `NSBE-UTK Website Product Design Document.pdf` (v1.0, July 2026), §4.2 (Opportunities
Hub), §4.7 (Officer Dashboard), §4.8 (GroupMe Bot & Automation), §9 (Integrations Architecture).

## Context

Phase 1 (`2026-07-30-phase-1-public-site-design.md`) shipped the public Opportunities page as
static data (`lib/data/opportunities.ts`) with a submission form
(`components/forms/opportunity-submission-form.tsx`) that ends in a client-side-only success
state — nothing is persisted. Phase 2
(`2026-08-06-phase-2-auth-design.md`) shipped real auth and left the Officer Dashboard's
"Pending Approvals" card as a `ComingSoonCard` placeholder, explicitly deferred because the
opportunities-approval data didn't exist yet.

This phase makes that data real, end to end: public submission → officer approval queue →
public display, plus a GroupMe bot that posts approved opportunities to the chapter's GroupMe.
The GroupMe bot only has value once approvals are real, so the two ship together.

**Explicitly out of scope** (per the decomposition discussed before this spec was written):
event reminders, and migrating events off static data — the doc recommends a 24h-before-event
GroupMe trigger, but events have the same static-data problem opportunities had, and fixing
both in one phase is more than this spec covers. Events stay static; only the "weekly
opportunities digest," "on-approval post," and "manual Post Now" triggers are built here.

## Stack Additions

None. This phase uses only what Phases 1–2 already added (`@supabase/supabase-js`,
`@supabase/ssr`, `react-hook-form` + `zod`) plus native `fetch` for the GroupMe Bot API — no new
npm packages.

Notably, this phase does **not** use Supabase Edge Functions, despite §9's recommendation. The
weekly digest is a Vercel Cron job hitting a Next.js route handler instead — this app is already
a single Next.js/Vercel deploy pipeline, and adding a second Deno-based runtime and deploy flow
for one cron job isn't worth the operational overhead it would add. The on-approval instant post
likewise skips the doc's "Supabase DB webhook → Edge Function" indirection and is just a direct
function call inside the approval Server Action.

## Data Model

New migration `supabase/migrations/0002_opportunities.sql`, following `0001_profiles.sql`'s RLS
style:

```sql
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

-- Anyone (including anonymous visitors — sponsors, alumni, non-members) can submit.
-- The check clause blocks setting any status other than 'pending' on insert, so a
-- submitter can't self-approve by crafting the request.
create policy "anyone can submit an opportunity"
  on opportunities for insert
  to anon, authenticated
  with check (status = 'pending');

-- The public opportunities page only shows approved rows.
create policy "approved opportunities are publicly readable"
  on opportunities for select
  to anon, authenticated
  using (status = 'approved');

-- Officers can read every row regardless of status (needed for the pending queue).
create policy "officers can read all opportunities"
  on opportunities for select
  to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'officer'));

-- Officers can update status (approve/reject) and posted_to_groupme_at.
create policy "officers can update opportunities"
  on opportunities for update
  to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'officer'));
```

`category` stays a `text` column (checked against `OPPORTUNITY_CATEGORIES` in the Zod schema,
which already exists at `lib/schemas/opportunity-submission.ts`), not a Postgres enum — matches
Phase 2's preference for keeping this kind of app-level list editable without a migration.

`posted_to_groupme_at` is the field that makes the weekly digest a safety net rather than a
duplicate-post machine: the approval action stamps it immediately on a successful GroupMe post,
and the weekly digest only ever looks at rows where it's still `null`.

As with Phase 2, this is illustrative of intent; exact Postgres RLS behavior gets verified
against a real Supabase project during implementation, not assumed correct from this draft.

## Submission Flow

The form UI, fields, and Zod schema already exist and don't change
(`components/forms/opportunity-submission-form.tsx`, `lib/schemas/opportunity-submission.ts`).
Two changes:

1. **Wire it to a real mutation.** `handleSubmit(() => setSubmitted(true))` currently does
   nothing but flip local state. It becomes `handleSubmit(onSubmit)` where `onSubmit` calls a
   new Server Action, `submitOpportunity`, and only shows the success state once that resolves
   without error.
2. **Add a honeypot field.** A visually hidden text input (`tabIndex={-1}`,
   `autoComplete="off"`, positioned off-screen — not `display: none`, which some bots skip) that
   real users never fill in. If it's non-empty on submit, the action pretends to succeed (shows
   the normal success state) without inserting a row — this avoids tipping off bots that they
   were caught, while not giving real users a confusing error.

`lib/actions/opportunities.ts` (new file):

```ts
"use server";
// submitOpportunity(values: OpportunitySubmissionFormValues & { honeypot: string })
//   - if honeypot is non-empty, return success without inserting
//   - re-validate with opportunitySubmissionSchema server-side (never trust client validation alone,
//     same principle Phase 2's login form follows)
//   - insert via the anon Supabase client; RLS enforces status='pending'
```

No auth required to submit — this endpoint is intentionally open per the doc ("anyone can
submit"), gated only by the honeypot and Postgres's own row-level check.

### Public Opportunities Page

`app/opportunities/page.tsx` changes from `import { opportunities } from "@/lib/data/opportunities"`
to a server-side Supabase query for `status = 'approved'` rows, ordered by `deadline`. The
`Opportunity` type, `OpportunitiesBrowser`, and `OpportunityCard` components are unchanged —
they already take `opportunities: Opportunity[]` as a generic prop and do client-side
category/search filtering, so this is purely a data-source swap in the page component, not a
component rewrite. The public RLS policy above means this query needs no auth check in the page
itself.

## Officer Approval Flow

New component `components/officer/pending-opportunities.tsx`, modeled on the existing
`components/officer/officer-roster.tsx` table pattern: server-fetches all `status = 'pending'`
rows (covered by the officers-can-read-all RLS policy) and renders each with Approve/Reject
buttons as `<form action={...}>` submissions, same as `OfficerRoster`'s Promote/Demote buttons.
This replaces the "Pending Approvals" `ComingSoonCard` on `/officer`.

Two new Server Actions in `lib/actions/opportunities.ts`, both calling `requireOfficer()` first
(same as `setMemberRole` does today — the button being hidden from non-officers client-side is a
UX nicety, not the security boundary):

- **`approveOpportunity(id)`** — updates `status = 'approved'`, then calls `postToGroupMe()`
  with a single-opportunity message. If the post succeeds, stamps `posted_to_groupme_at =
  now()` in the same action. If it fails, the approval still commits (a notification failure
  shouldn't block the actual moderation decision) — the row simply remains eligible for the
  weekly safety-net digest.
- **`rejectOpportunity(id)`** — updates `status = 'rejected'`. No GroupMe post.

Both call `revalidatePath("/officer")` and `revalidatePath("/opportunities")` afterward, same as
`setMemberRole`.

## GroupMe Integration

**`lib/groupme.ts`** (new file) — single exported function:

```ts
export async function postToGroupMe(text: string): Promise<boolean> {
  // POST { bot_id: process.env.GROUPME_BOT_ID, text } to
  // https://api.groupme.com/v3/bots/post
  // Returns true on the API's 202 success response, false on any failure.
  // Never throws — callers decide what a `false` means for them.
}
```

**Message formats:**

- Instant, single opportunity (posted from `approveOpportunity`):
  ```
  📢 New Opportunity
  💼 {title} — {company}
  📅 Deadline: {deadline}
  🔗 {url}
  Submit yours: nsbeutk.org/opportunities/submit
  ```
- Weekly digest (posted from the cron route / manual trigger), one block per opportunity in the
  same `💼 📅 🔗` shape, only sent when at least one opportunity qualifies:
  ```
  📢 Opportunities Digest
  {one block per opportunity}
  View all: nsbeutk.org/opportunities
  ```
  An empty result set is skipped entirely — no "nothing this week" message. This differs from
  the doc's literal wording (which always digests "opportunities approved in the past 7 days");
  since instant posts already cover the normal case, this route only ever sees the failure
  backlog, which is usually empty.

**`lib/groupme-digest.ts`** (new file) — the shared logic used by both the cron route and the
manual trigger, so there's exactly one code path:

```ts
export async function runGroupMeDigest(): Promise<{ posted: number }> {
  // Query: status='approved' AND created_at >= now() - interval '7 days'
  //        AND posted_to_groupme_at IS NULL
  // If empty, return { posted: 0 } without calling GroupMe.
  // Otherwise build the digest message, call postToGroupMe, and on success
  // stamp posted_to_groupme_at = now() on every included row.
}
```

**`app/api/cron/groupme-digest/route.ts`** (new file) — `GET` handler. Checks
`Authorization: Bearer ${process.env.CRON_SECRET}` (Vercel's documented pattern for securing
cron routes) and returns 401 if it doesn't match. Otherwise calls `runGroupMeDigest()` and
returns its result as JSON. Idempotent — a duplicate or retried invocation just finds no
unstamped rows and posts nothing.

**`vercel.json`** gains a `crons` entry:

```json
{
  "framework": "nextjs",
  "crons": [{ "path": "/api/cron/groupme-digest", "schedule": "0 1 * * 1" }]
}
```

`0 1 * * 1` is 1am UTC Monday, which is roughly 8–9pm Sunday Eastern depending on daylight
saving — Vercel Cron schedules run in UTC with no DST awareness, so the actual local send time
will drift by an hour twice a year. Noted as a code comment at the cron route; not worth solving
with additional infrastructure at chapter scale.

**Manual "Post Now"** — a button on `/officer` (in the same section as the pending-approvals
queue) submitting to a new Server Action `postGroupMeDigestNow()` that calls `requireOfficer()`
then `runGroupMeDigest()` directly — the exact same function the cron route calls, so manual and
scheduled runs can never drift apart in behavior.

## Environment Variables

Added to `.env.example`:

```
# GroupMe Bot API (dev.groupme.com) — bot must already be registered against
# the chapter's GroupMe group; this app only posts to it, it doesn't create it.
GROUPME_BOT_ID=

# Shared secret Vercel Cron sends as a Bearer token when it calls
# /api/cron/groupme-digest, so the route can reject non-Vercel callers.
# Generate any random string; set the same value in Vercel project settings.
CRON_SECRET=
```

## Error Handling

- GroupMe API failures never block or roll back the underlying database mutation — approval and
  rejection always commit regardless of whether the notification succeeds.
- Submission form: Zod validation errors surface inline per field (existing
  `react-hook-form` + resolver pattern). A tripped honeypot fails silently with the normal
  success UI.
- Cron route: 401 on a missing/incorrect `CRON_SECRET`; 200 with `{ posted: n }` on success, run
  or not. No retry logic needed since re-running is always safe (idempotent on
  `posted_to_groupme_at`).

## Testing

Following Phases 1–2's pattern (Vitest for pure logic, no live-integration E2E):

- `lib/groupme.test.ts` — mocks `fetch`; verifies the request body shape and that `true`/`false`
  are returned correctly for success/failure responses.
- `lib/groupme-digest.test.ts` — verifies the query logic (7-day window,
  `posted_to_groupme_at is null`) against a mocked Supabase client, and that an empty result set
  never calls `postToGroupMe`.
- `lib/actions/opportunities.test.ts` — verifies `approveOpportunity` only stamps
  `posted_to_groupme_at` when the GroupMe post succeeds, and that `rejectOpportunity` never
  calls GroupMe at all.
- Manual verification checklist (documented in the plan) for what can't be unit tested: a real
  submission → approval → GroupMe post round trip against a live Supabase project and the actual
  chapter GroupMe group, RLS policy behavior, and the Vercel Cron job actually firing on schedule
  after deploy.

## Out of Scope (future specs)

- Event reminders (24h-before, §4.8) and migrating events off static data (§4.1) — same
  static-to-Supabase problem opportunities had; deferred to its own phase.
- Submitter email confirmation via Resend (§9's automation-triggers table mentions this) —
  Resend isn't wired into this project yet; the submission form's own on-page success state is
  the only confirmation for now.
- Sponsor Portal / per-sponsor pages (§4.5 Phase 4)
- QR check-in, Microsoft Graph, MailerLite, analytics dashboard — unchanged from Phase 2's
  out-of-scope list, still blocked on the same open questions in §12 of the source doc.
