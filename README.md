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

## Before going live

Everything on this site is currently sample/placeholder content and must be replaced before a real deploy:

- All content in `lib/data/` (events, officers, sponsors, news, opportunities) is fictional
- The `STATS` array in `app/page.tsx` (member/event/opportunity/partner counts) is hardcoded, not live data
- Every `https://example.com` link (sponsor websites, social links, opportunity apply links) is a placeholder
- Officer emails in `app/contact/page.tsx` follow a plausible-but-unverified pattern (`nsbe-president@utk.edu`, etc.) — confirm these are real before publishing

This build also makes two deliberate deviations from the original design spec, documented in `docs/superpowers/plans/2026-07-30-phase-1-public-site.md`'s Global Constraints: Arimo is used in place of Arial (a real web font substitute), and the UI component layer is hand-built on Radix primitives + Tailwind rather than the shadcn/ui CLI.
