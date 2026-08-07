# NSBE UTK Website — Phase 2: Auth & Protected Pages Design

Source: `NSBE-UTK Website Product Design Document.pdf` (v1.0, July 2026), §3 (Site Map),
§8 (Custom CMS Auth), §10 (UI Design System).

## Context

Phase 1 (`docs/superpowers/specs/2026-07-30-phase-1-public-site-design.md`) shipped a complete
public-facing site with no backend — all content lives in `lib/data/`, forms end in a
client-side success state, and there is no auth of any kind.

This spec covers **Phase 2 only**: real authentication and the two protected pages that don't
depend on unbuilt subsystems. The site map (§3) lists four protected pages; two are explicitly
out of scope here because they depend on backend pieces this phase doesn't build:

| Page | In scope? | Why |
|---|---|---|
| Member Portal | Yes | Only depends on auth + a `profiles` table |
| Officer Dashboard | Yes | Only depends on auth + a `profiles` table |
| Check-In Page | No | Depends on an events/attendance schema (§4.1, §4.4) — separate spec |
| Officer Portal (Files) | No | Depends on Microsoft Graph/SharePoint integration (§4.6) — separate spec |

Points, attendance, opportunities-approval, and analytics data don't exist yet either. Rather
than fabricate mock numbers (Phase 1's pattern for public content), protected-page sections that
depend on that data are rendered as clearly-labeled **Coming soon** placeholders — the auth and
profile data underneath them is real.

## Stack Additions

- **`@supabase/supabase-js`** + **`@supabase/ssr`** — Supabase Auth client for Next.js App Router
  (browser client, server client, proxy-scoped client)

No Sanity, MS Graph, MailerLite, or GroupMe packages in this phase — those remain future specs.

## Auth Method

Per §8's recommendation for NSBE UTK: **Magic Link** (email-only, Supabase's `signInWithOtp`)
combined with an `@utk.edu` domain restriction. No passwords. TOTP/2FA (§8 Option 3) is
explicitly deferred to a later phase once the chapter is handling sensitive budget data.

The domain restriction is normally a Supabase **dashboard** setting (Auth → Providers → Email →
Allowed email domains), which only the project owner can configure — that's a manual one-time
setup step, documented in this repo's README, not something this codebase can set on your
behalf. The app also rejects non-`@utk.edu` addresses in the login form itself (client + server)
as defense-in-depth, so the UX is correct even before that dashboard setting is applied.

## Next.js 16 Note: `proxy.ts`, not `middleware.ts`

This repo runs Next.js 16, where the `middleware.ts` file convention was renamed to `proxy.ts`
(same mechanism — request interception before a route renders — new name, and it now defaults to
the Node.js runtime instead of Edge). Any reference to "middleware" in Supabase's own Next.js
docs or the product spec's AI-prompt snippets maps to `proxy.ts` here.

## Data Model

One new table, created via a SQL migration file checked into the repo
(`supabase/migrations/0001_profiles.sql`) that you run once in the Supabase SQL editor (this
phase doesn't include Supabase CLI/local-dev tooling — out of scope):

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'member' check (role in ('member', 'officer')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Any authenticated user can read all profiles (needed for the officer promotion table)
create policy "profiles are readable by authenticated users"
  on profiles for select
  to authenticated
  using (true);

-- A user can update their own full_name, but not their own role
create policy "users can update their own name"
  on profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from profiles where id = auth.uid()));

-- Only officers can change anyone's role
create policy "officers can update any profile"
  on profiles for update
  to authenticated
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'officer'));

-- Row insertion happens via a server action using the service role, not client-side
```

The policies above are illustrative of intent (self-service name edits, role changes
officer-only); Postgres's exact behavior with multiple permissive `UPDATE` policies on the same
table will be verified against a real Supabase project during implementation, not assumed
correct from this draft.

Note: `role` isn't stored in Supabase Auth's JWT/`app_metadata` (as §8's AI-prompt snippets
show) because that requires a service-role call on every role change and JWT refresh to
propagate. A plain table read is simpler and fast enough at chapter scale (~50-200 members).

## Officer Bootstrapping

You chose to build a promotion UI rather than hand-editing the database per login. That still
leaves a chicken-and-egg problem: the very first officer has to come from somewhere before any
promotion UI exists to use.

Solution: an `OFFICER_SEED_EMAILS` environment variable — a comma-separated list of `@utk.edu`
addresses. When a `profiles` row is created for a matching email, its `role` is set to
`'officer'` instead of the default `'member'`. Set this once with your current officer board's
emails; after that, officers use the in-app promotion UI (below) to manage the roster, and the
env var only matters again if you ever need to re-bootstrap.

## Auth Flow

1. **`/login`** — single email input. Validates `@utk.edu` client-side before submit; the server
   action re-validates (never trust client validation alone) before calling
   `supabase.auth.signInWithOtp()`. Shows a "check your email" confirmation state — no
   password, no signup/login distinction from the user's perspective.
2. **`/auth/callback`** (route handler) — exchanges the magic-link code for a session
   (`exchangeCodeForSession`). If no `profiles` row exists for this user yet, creates one
   (`role` from the `OFFICER_SEED_EMAILS` check above, else `'member'`). Redirects to the
   `?next=` param if present, else `/portal`.
3. **Sign out** — a server action that calls `supabase.auth.signOut()` and redirects to `/`.
   Exposed as a button on both protected pages and in the header user menu.

## Route Protection

Two layers, matching the pattern Next.js's own authentication guide recommends for this
version:

1. **`proxy.ts`** (project root) — runs on every request, does an *optimistic* check: is there a
   Supabase session cookie at all? If a request hits `/portal` or `/officer` with no session,
   redirect to `/login?next=<path>` before any page code runs. This also refreshes the Supabase
   session cookie on every request (required for magic-link sessions to stay alive).
2. **`lib/auth/dal.ts`** (Data Access Layer) — the real, non-optimistic check, called at the top
   of every protected Server Component and Server Action:
   - `requireUser()` — resolves the verified session server-side (not just cookie presence);
     redirects to `/login` if absent. Used by `/portal`.
   - `requireOfficer()` — calls `requireUser()`, then reads the caller's `profiles.role`;
     redirects to `/portal` if not `'officer'`. Used by `/officer` and the promotion Server
     Action.

`proxy.ts` alone is never sufficient (it can't safely make a DB call for the role check without
adding latency to every request) — the DAL is the actual authorization boundary.

## Protected Pages

Both follow the existing component patterns (§10.3) and dark-mode palette (§11.3) already
established in Phase 1 — no new design-system work.

### `/portal` — Member Portal

- Header: name, email, role badge — real data from `profiles`, fetched via `requireUser()`.
- "Points & Stole Progress," "Attendance History," "Committee" — each a card with the section
  title, an icon, and "Coming in a later phase" body text. No fabricated numbers or progress
  bars (Phase 1's stat-band placeholder pattern doesn't apply to authenticated data).
- Sign-out button.

### `/officer` — Officer Dashboard

- Same real-profile header as `/portal`, reached only if `requireOfficer()` passes.
- **Officer Roster** (fully functional, not a placeholder): a table of every `profiles` row
  (name, email, role) with a Promote/Demote button per row. Submits to a Server Action that
  calls `requireOfficer()` again server-side before writing — the button being hidden from
  non-officers client-side is a UX nicety, not the security boundary.
- "Pending Approvals," "Event Control," "Membership Analytics," "Newsletter Stats" — "Coming
  soon" cards, same treatment as the Member Portal's placeholders.
- Sign-out button.

## Nav Integration

`components/layout/site-header.tsx` is a client component (`usePathname` for active-link
styling) with a hardcoded `NAV_LINKS` array. Rather than add a client-side Supabase listener to
it, `app/layout.tsx` (already a Server Component) fetches the session + profile once per request
and passes `user: { email, role } | null` down as a prop:

- Logged out → header shows a **Log In** link to `/login`.
- Logged in, member → header shows **Portal** (→ `/portal`) and **Log Out**.
- Logged in, officer → header shows **Officer** (→ `/officer`) and **Log Out**.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OFFICER_SEED_EMAILS=
```

`.env.local` (gitignored) for local dev; the same three set in Vercel project settings for
deploys. `.env.example` checked in with empty values and a comment on each. No service-role key
is needed anywhere in this phase — RLS policies handle all authorization, and profile creation
in the callback route runs as the authenticated user via the anon key + RLS, not a service-role
bypass.

## Testing

Following Phase 1's pattern (Vitest for pure-logic units, no auth-flow E2E in this phase):

- `lib/auth/validation.test.ts` — the `@utk.edu` email-domain check (valid/invalid emails, case
  sensitivity, subdomain edge cases).
- Manual verification checklist (documented in the plan) for the parts that need a real
  Supabase project and can't be unit tested: magic-link round trip, officer promotion, proxy
  redirects for logged-out/wrong-role access.

## Out of Scope (future specs)

- Check-In Page + QR flow (§4.4) — needs events/attendance schema
- Officer Portal Files (§4.6) — needs Microsoft Graph integration
- TOTP/2FA layer (§8 Option 3)
- Points/attendance/opportunities data and the dashboard sections that depend on it
- Supabase CLI / local dev database tooling
