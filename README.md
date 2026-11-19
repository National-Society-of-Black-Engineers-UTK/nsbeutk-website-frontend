# NSBE UTK Website

The public-facing website for the NSBE UTK chapter (National Society of Black Engineers, University of Tennessee, Knoxville).

The platform includes the public site, Supabase magic-link authentication, a member portal, an officer dashboard, and moderated opportunity submissions with GroupMe notifications. Public content is configured in `lib/data/chapter.ts`. The soft launch hides contact, join, sponsorship, and RSVP forms. Configure verified links and email addresses to give visitors direct ways to reach the chapter.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Turbopack's persistent development cache is disabled in `next.config.ts` to avoid
cache-restoration panics and stale client manifests across server restarts.
Development still uses Turbopack, with caching in memory during each session.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint
- `npm run test` — Vitest (pure-logic unit tests: date helpers, .ics generation, form schemas, opportunities filtering)
- `npx tsc --noEmit` — type-check

## Updating content

Add chapter-approved officers, sponsors, events, stats, news, and links in `lib/data/chapter.ts`. Empty sections are hidden or show a brief availability message. Use timestamps with explicit UTC offsets for event start and end times. Event times display in Eastern Time.

## Environment variables (Phase 2: auth)

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from your Supabase project's
  Settings → API page.
- `OFFICER_SEED_EMAILS` — comma-separated UTK email addresses (`@utk.edu` or `@vols.utk.edu`) to
  auto-promote to the officer role on first login. Only matters for bootstrapping the very first
  officer(s); afterwards use the Officer Dashboard's roster to promote/demote.
- `SUPABASE_SERVICE_ROLE_KEY` — from the same Settings → API page. Bypasses Row Level Security;
  only ever read server-side, for opportunity submission, GroupMe delivery, and initial officer provisioning. Never expose this to the client.
- `GROUPME_BOT_ID` — the Bot ID for the chapter's GroupMe group, from dev.groupme.com. The bot
  must already be registered against the group; this app only posts to it, it doesn't create one.
- `CRON_SECRET` — a random shared secret that Vercel Cron sends as a Bearer token when it calls
  `/api/cron/groupme-digest`, so the route can reject non-Vercel callers.

The same six variables must also be set in the Vercel project settings for deploys.

See `docs/superpowers/specs/2026-08-06-phase-2-auth-design.md` for the full auth design, and
that spec's linked plan for one-time Supabase dashboard configuration (allowed email domain,
redirect URLs) required before login works.

### Database setup

Run `supabase/migrations/0001_profiles.sql` once in your Supabase project's SQL Editor
(Dashboard → SQL Editor → New query → paste → Run). It creates the `profiles` table that backs
both `/portal` and `/officer`.

Run `supabase/migrations/0002_opportunities.sql` the same way (Supabase SQL Editor) before the
Opportunities Hub features will work. It creates the `opportunities` table that backs
`/opportunities` and the officer approval queue.

Then run `supabase/migrations/0003_profile_policy_hardening.sql`. This is required for
both new and existing databases: it blocks self-assigned officer roles, prevents recursive
profile update policies, and limits roster visibility to officers. Seed officers are
provisioned server-side using `SUPABASE_SERVICE_ROLE_KEY`.

Run `supabase/migrations/0004_hide_expired_opportunities.sql` to hide expired
opportunities from the public database view. Date-only deadlines remain active
through the end of that day in Eastern Time.

Apply `0005_opportunity_submission_permissions.sql`, `0006_officer_role_safeguard.sql`,
and `0007_groupme_delivery.sql` in order before deploying Phase 2. Test against a staging
copy first. Migration `0005` validates existing field lengths, URL shape, and finite
deadlines, so correct any incompatible legacy rows before applying it. Existing
expired deadlines remain valid historical data. On an existing project, review the
officer roster before release because the counter starts from the current roles.

The GroupMe cron reports an error when a delivery attempt fails. Explicit rejections
can be retried by the next digest. If a request times out, the provider returns an
ambiguous error, or the worker stops before recording the outcome, check the staging
or chapter GroupMe before retrying. For an `uncertain` claim or a stale `pending` claim,
confirm no worker is still active and reconcile the whole claim by `claim_id`:
mark it `failed` if no message was delivered, or set its rows to `sent` and the matching
`opportunities.posted_to_groupme_at` timestamps in the same transaction if it was delivered.

## Before going live

Populate the chapter content config with approved data and verify each published URL
and email address. Check that the production database has all seven migrations.
