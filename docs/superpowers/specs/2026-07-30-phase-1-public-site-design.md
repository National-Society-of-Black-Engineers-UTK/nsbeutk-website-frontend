# NSBE UTK Website — Phase 1: Public Site Design

Source: `NSBE-UTK Website Product Design Document.pdf` (v1.0, July 2026), scoped down to Phase 1 only.

## Context

The full product spec describes a "Chapter Operations Platform": a Next.js frontend integrated
with Sanity CMS, Supabase (DB/Auth/Storage), Microsoft Graph API, MailerLite, a GroupMe bot,
QR-based attendance, and a Python analytics backend. That is several independent subsystems,
several of which depend on open questions the chapter/UTK IT still need to resolve (§12 of the
source doc): Volink API access, UTK IT policy on student org hosting, Microsoft 365 tenant type,
MailerLite account tier, and domain registration.

This spec covers **Phase 1 only**: a complete, deployable public-facing website with the full
design system, all public pages, and fully-built (but non-persisting) forms. No auth, database,
CMS, or third-party integrations. Every later phase (CMS/auth wiring, QR check-in + analytics,
sponsor portal, alumni directory) gets its own spec once Phase 1 ships and the open questions
above are resolved.

Existing state: `nsbeutk-website-frontend` is a fresh `create-next-app` scaffold (Next.js 16.2.10,
React 19.2.4, Tailwind CSS v4, TypeScript) already connected to GitHub
(`National-Society-of-Black-Engineers-UTK/nsbeutk-website`) and Vercel. `nsbeutk-website-backend`
is an empty placeholder repo, untouched in this phase.

## Stack Additions

On top of the existing scaffold:

- **shadcn/ui** — accessible base components (keyboard-navigable by default, satisfies §11.2)
- **Framer Motion** — animated stat counters (§11.9) and progress bar fill animation (§10.3)
- **React Hook Form + Zod** — form state/validation, isolated so a real submit handler can be
  swapped in later without touching validation logic
- **next-themes** — dark mode toggle (OS preference + manual override + localStorage)

No Supabase, Sanity, MS Graph, MailerLite, or GroupMe packages in this phase.

## Content Layer

`lib/data/` — typed TypeScript modules holding sample data, shaped to match the future
Sanity/Supabase schemas so a later swap to live data is a data-source change, not a page rewrite:

- `events.ts` — `Event` type per §4.1 fields (title, type, date/time, location, description, rsvpEnabled,
  points, icsAvailable, volinkLink). 4–5 sample events spanning GBM, Social, Volunteer, Conference.
- `officers.ts` — name, role, major, year, photo, bio, committee.
- `sponsors.ts` — name, tier (Gold/Silver/Bronze), logo, website, description.
- `news.ts` — title, slug, publishedAt, body, author.
- `opportunities.ts` — per §4.2 fields (title, company, category, deadline, eligibility, description, url).

Placeholder content is plausible-but-fake (e.g. "Jordan Williams — President",
"Volunteer Day @ Boys & Girls Club") — realistic enough for screenshots/demos, never resembling
a real person or an actual sponsor commitment.

## Pages

All ten public pages from §3, each following the component patterns (§10.3) and spacing/grid
rules (§10.4) from the design system:

| Page | Key elements |
|---|---|
| Home | Hero, upcoming events preview, social proof stat band (§11.9, animated counters, placeholder numbers), sponsor logo strip, member spotlight |
| About | Mission, history, exec board grid (from `officers.ts`), committees, awards |
| Join NSBE | National/local membership info, benefits, FAQ, interest form (stub) |
| Events | Card grid from `events.ts`, RSVP button (stub form), type badges, points value, past-event "View Recap" placeholder |
| Opportunities | Filterable/searchable card grid from `opportunities.ts` (category filter, keyword search), submission form (stub), deadline shown in red if within 7 days |
| Corporate Partners | Gold/Silver/Bronze tier display from `sponsors.ts`, partnership packet download placeholder, sponsor inquiry form (stub) |
| Resources | Static folder/file accordion mirroring the SharePoint structure in §4.6 (General Members, Professional Development, Conference, Officer Resources, Sponsors), sample files, disabled/placeholder download links |
| Gallery | Photo grid, sample images |
| News / Blog | Post list + detail from `news.ts` |
| Contact | General inquiry form (stub), officer emails, social links |

## Design System

Tailwind config extended with the exact palette from §10.1:

- `primary: #173345`, `secondary: #FFCF40`, `black`, `white`, plus primary/secondary tints at
  10%/20% opacity per the usage table
- Dark palette from §11.3: background `#0F1A29`, surface `#1A2D40`, text `#F1F5F9`,
  accent stays `#FFCF40`, border `#2D4A60`

Typography per §10.2 (H1 28–32pt, H2 22–24pt, H3 18–20pt, body 11–12pt). The spec calls for
Arial; since Arial isn't a font Next.js's font optimizer bundles, this build uses a
metric-compatible sans-serif via `next/font` (Arial Nova-equivalent fallback stack) — flagged
here as a deliberate deviation, swap-able if the chapter provides a specific brand font later.

Components follow §10.3 specs exactly (event card top accent bar, opportunity card left border,
progress bar track/fill colors, nav/footer treatment, table header/alternate-row styling).
Spacing follows §10.4 (8px multiples, 1280px max width, 3/2/1-column responsive card grid).

Dark mode: working toggle via `next-themes`, `dark:` Tailwind variants throughout, respects
`prefers-color-scheme` by default with manual override persisted to `localStorage`.

## Forms

RSVP, opportunity submission, sponsor inquiry, contact, and join-interest forms are fully built
(React Hook Form + Zod validation, shadcn form components, accessible labels/error messages per
§11.2). On submit, each shows a client-side success/confirmation state — no network call, nothing
persisted. Each form's submit handler is an isolated function so a later Phase 2 change (POST to
a real `/api/*` route backed by Supabase) is a small, contained diff.

## Accessibility & SEO

- Semantic heading hierarchy, descriptive alt text on all images, all interactive elements
  keyboard-reachable (inherited from shadcn/ui primitives)
- All form fields have associated `<label>`s; errors linked via `aria-describedby`
- 44×44px minimum tap targets; nav collapses to hamburger below 768px
- Static `metadata` export per page (title, description, OG tags, twitter:card) with a default
  branded 1200×630 OG image. Dynamic per-event OG image generation (§11.4 Phase 2 item) is
  deferred — it needs real event data to be worth generating.

## Explicitly Out of Scope (later phases)

Supabase/Sanity wiring, Supabase Auth (any of the four options in §8), QR check-in (§4.4),
Microsoft Graph integration (§4.6, §11.6), MailerLite integration, GroupMe bot (§4.8), Python
analytics dashboard (§6), sponsor portal (§4.5 Phase 4), alumni directory (§11.10 Phase 5),
officer dashboard (§4.7) — all require the account/API decisions in §12 and are separate specs.
