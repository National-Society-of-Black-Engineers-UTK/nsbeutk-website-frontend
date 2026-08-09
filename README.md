# NSBE UTK Website

The public-facing website for the NSBE UTK chapter (National Society of Black Engineers, University of Tennessee, Knoxville).

This is Phase 1 of the platform described in `docs/superpowers/specs/2026-07-30-phase-1-public-site-design.md`: a complete public site with the full brand design system, all public pages, and fully-built forms. There is no backend yet — forms end in a client-side success state and content lives in `lib/data/`. Later phases (CMS/auth, QR check-in, analytics, sponsor/alumni portals) are separate specs.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint
- `npm run test` — Vitest (pure-logic unit tests: date helpers, .ics generation, form schemas, opportunities filtering)
- `npx tsc --noEmit` — type-check

## Updating content

Sample content lives in `lib/data/` (events, officers, sponsors, news, opportunities) — edit those files directly until a real CMS is wired up in a later phase.

## Environment variables (Phase 2: auth)

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from your Supabase project's
  Settings → API page.
- `OFFICER_SEED_EMAILS` — comma-separated UTK email addresses (`@utk.edu` or `@vols.utk.edu`) to
  auto-promote to the officer role on first login. Only matters for bootstrapping the very first
  officer(s); afterwards use the Officer Dashboard's roster to promote/demote.

The same three variables must also be set in the Vercel project settings for deploys.

See `docs/superpowers/specs/2026-08-06-phase-2-auth-design.md` for the full auth design, and
that spec's linked plan for one-time Supabase dashboard configuration (allowed email domain,
redirect URLs) required before login works.

### Database setup

Run `supabase/migrations/0001_profiles.sql` once in your Supabase project's SQL Editor
(Dashboard → SQL Editor → New query → paste → Run). It creates the `profiles` table that backs
both `/portal` and `/officer`.

## Before going live

Everything on this site is currently sample/placeholder content and must be replaced before a real deploy:

- All content in `lib/data/` (events, officers, sponsors, news, opportunities) is fictional
- The `STATS` array in `app/page.tsx` (member/event/opportunity/partner counts) is hardcoded, not live data
- Every `https://example.com` link (sponsor websites, social links, opportunity apply links) is a placeholder
- Officer emails in `app/contact/page.tsx` follow a plausible-but-unverified pattern (`nsbe-president@utk.edu`, etc.) — confirm these are real before publishing

This build also makes two deliberate deviations from the original design spec, documented in `docs/superpowers/plans/2026-07-30-phase-1-public-site.md`'s Global Constraints: Arimo is used in place of Arial (a real web font substitute), and the UI component layer is hand-built on Radix primitives + Tailwind rather than the shadcn/ui CLI.
