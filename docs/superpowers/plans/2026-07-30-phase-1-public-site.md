# Phase 1 Public Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a complete, deployable NSBE UTK public website (all 10 public pages, full brand design system, working dark mode, fully-built stub forms) on top of the existing `nsbeutk-website-frontend` Next.js scaffold, with zero backend/CMS dependencies.

**Architecture:** Next.js App Router pages read from a local typed `lib/data/` layer shaped like the future Sanity/Supabase schemas. Shared UI primitives (button, card, badge, form field, dialog, accordion) live in `components/ui/`, hand-built on Radix primitives + Tailwind rather than a CLI-scaffolded component library, so every visual detail matches the brand spec exactly. Forms use React Hook Form + Zod and end in a local success state — no network calls.

**Tech Stack:** Next.js 16.2.10 (App Router), React 19.2.4, TypeScript, Tailwind CSS v4 (CSS-based `@theme`, no `tailwind.config.ts`), Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-accordion`), `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `next-themes`, `framer-motion`, `react-hook-form`, `@hookform/resolvers`, `zod@^3`, Vitest (pure-logic unit tests only).

## Global Constraints

- Do not downgrade Next.js/React/Tailwind — build against the versions already installed (Next 16.2.10, React 19.2.4, Tailwind v4). Confirmed via `node_modules/next/dist/docs`.
- `params` and `searchParams` in Server Components are `Promise`s in this Next.js version — always `await` them (confirmed in `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md`).
- `export const metadata` / `generateMetadata` only work in Server Components. Any page needing both page-level metadata and top-level interactive state must split the interactive part into a separate `"use client"` child component.
- Tailwind v4 has no `tailwind.config.ts` in this project — all design tokens live in `app/globals.css` using `@theme` / `@theme inline` blocks, following the pattern already established in the scaffold. Class-based dark mode requires `@custom-variant dark (&:where(.dark, .dark *));` (confirmed against current Tailwind CSS v4 docs) since we need a manual toggle, not just `prefers-color-scheme`.
- Brand palette (exact hex, from the product spec §10.1/§11.3): Primary `#173345`, Secondary `#FFCF40`, Secondary hover `#E6BB38`, dark-teal accent `#1E4D6B`. Dark mode: background `#0F1A29`, surface `#1A2D40`, text `#F1F5F9`, border `#2D4A60`. Light mode: background `#FFFFFF`, text `#000000`, border `#D1D5DB`, caption `#6B7280`.
- Border radius: cards 8px (`rounded-lg`), buttons 6px (`rounded-md`), badges 4px (`rounded`). Spacing in multiples of 8px. Page max width 1280px. All tap targets ≥44×44px (`min-h-11` = 44px).
- The spec calls for Arial; Arial isn't a font `next/font` can optimize, so this plan uses **Arimo** (`next/font/google`), which is metrically compatible with Arial — a deliberate, documented deviation.
- The spec names shadcn/ui as the component layer. This plan instead hand-builds `components/ui/*` directly on Radix primitives (`@radix-ui/react-dialog`, `@radix-ui/react-accordion`) plus `class-variance-authority` — which is what shadcn/ui itself is built on. This avoids the shadcn CLI's interactive prompts (unreliable for an unattended task-by-task build) and gives every component the exact brand hex values from §10 with no default-theme cleanup pass needed. Functionally equivalent; a deliberate, documented deviation.
- `zod` is pinned to `^3` — all schema code in this plan uses the Zod v3 `.string().email()`/`.string().url()`/`z.enum(array)` API.
- The product spec's Type enum (§4.1) and Points Schedule (§4.3) don't fully agree (`Workshop`/`Career Fair`/`Hackathon` appear in the Type enum but not the points table; `Professional Development` appears in the points table/AI prompt but not the Type enum). This plan merges both into one 9-value `EventType` and prices the three unpriced types as `Professional Development` (15 pts) — documented inline in `lib/data/events.ts`.
- All placeholder content must be plausible-but-fake (per product decision) and must never resemble a real person, company, or working endpoint. Any placeholder external link uses `https://example.com` (a reserved documentation domain — never a guessed real URL). The one real detail carried over from the source spec is the chapter's intended domain `nsbeutk.org` and general inbox `nsbe@utk.edu`, both explicitly named in the product doc itself.
- Forms are fully built (validation, accessible errors) but submission is a local success state only — no network call, nothing persisted (per product decision).
- Dark mode ships as a working toggle in this phase, not just tokens (per product decision).
- Run `npm run lint`, `npx tsc --noEmit`, and `npm run test` (Vitest) before every commit that touches code covered by them; all three must pass clean.

---

### Task 1: Design tokens, fonts, and base utilities

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx` (font import only — full layout wiring happens in Task 11)
- Create: `lib/utils.ts`
- Modify: `package.json` (new dependencies)

**Interfaces:**
- Produces: `cn(...inputs: ClassValue[]): string` from `lib/utils.ts`, used by every styled component from Task 6 onward.
- Produces: `getInitials(name: string): string` from `lib/utils.ts`, used by the About page (Task 17).
- Produces: Tailwind utilities `bg-primary`, `text-primary`, `bg-secondary`, `hover:bg-secondary-hover`, `text-primary-deep-teal`, `bg-background`, `text-foreground`, `bg-surface`, `border-border-subtle`, `text-caption`, plus the `dark:` variant, all available to every later task.
- Produces: CSS variable `--font-arimo` wired to the `font-sans` theme token, available globally.

- [ ] **Step 1: Install foundational dependencies**

Run: `npm install clsx tailwind-merge class-variance-authority lucide-react`

- [ ] **Step 2: Replace `app/globals.css` with the full brand token set**

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-primary: #173345;
  --color-primary-deep-teal: #1e4d6b;
  --color-secondary: #ffcf40;
  --color-secondary-hover: #e6bb38;
}

:root {
  --background: #ffffff;
  --foreground: #000000;
  --surface: #ffffff;
  --border-subtle: #d1d5db;
  --caption: #6b7280;
}

.dark {
  --background: #0f1a29;
  --foreground: #f1f5f9;
  --surface: #1a2d40;
  --border-subtle: #2d4a60;
  --caption: #94a3b8;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-surface: var(--surface);
  --color-border-subtle: var(--border-subtle);
  --color-caption: var(--caption);
  --font-sans: var(--font-arimo);
}

body {
  background-color: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-sans), Arial, Helvetica, sans-serif;
}
```

- [ ] **Step 3: Swap the layout's font from Geist to Arimo**

In `app/layout.tsx`, replace the `Geist`/`Geist_Mono` import and usage with:

```tsx
import { Arimo } from "next/font/google";

const arimo = Arimo({
  variable: "--font-arimo",
  subsets: ["latin"],
});
```

And change the `<html>` element's `className` to `` `${arimo.variable} h-full antialiased` ``. Leave the rest of `layout.tsx` as-is for now — it's fully rewritten in Task 11.

- [ ] **Step 4: Create `lib/utils.ts`**

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
```

- [ ] **Step 5: Verify the app still builds and boots**

Run: `npm run dev`
Visit `http://localhost:3000` — the default Next.js starter page should render with no console errors. Stop the dev server.

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add app/globals.css app/layout.tsx lib/utils.ts package.json package-lock.json
git commit -m "Add brand design tokens, Arimo font, and cn/getInitials utils"
```

---

### Task 2: Date and calendar (.ics) utilities

**Files:**
- Create: `lib/utils/dates.ts`
- Create: `lib/utils/dates.test.ts`
- Create: `lib/utils/ics.ts`
- Create: `lib/utils/ics.test.ts`
- Create: `vitest.config.ts`
- Modify: `package.json` (test script + Vitest dependency)

**Interfaces:**
- Produces: `formatDate(iso: string): string`, `formatDateTime(iso: string): string`, `isUpcoming(iso: string, now?: Date): boolean`, `isDeadlineSoon(iso: string, now?: Date): boolean` from `lib/utils/dates.ts` — used by Tasks 13, 14, 16, 19, 20, 24.
- Produces: `buildIcsContent(event: IcsEventInput): string`, `downloadIcs(filename: string, content: string): void`, and type `IcsEventInput` from `lib/utils/ics.ts` — used by Task 13.

- [ ] **Step 1: Install Vitest**

Run: `npm install -D vitest`

- [ ] **Step 2: Add `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
});
```

- [ ] **Step 3: Add the `test` script to `package.json`**

In the `"scripts"` block, add:

```json
"test": "vitest run"
```

- [ ] **Step 4: Write the failing tests for `lib/utils/dates.ts`**

```ts
// lib/utils/dates.test.ts
import { describe, expect, it } from "vitest";
import { formatDate, isDeadlineSoon, isUpcoming } from "./dates";

describe("formatDate", () => {
  it("formats an ISO date as a long-form US date", () => {
    expect(formatDate("2026-08-27T18:00:00Z")).toBe("August 27, 2026");
  });
});

describe("isUpcoming", () => {
  it("returns true for a date after now", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    expect(isUpcoming("2026-02-01T00:00:00Z", now)).toBe(true);
  });

  it("returns false for a date before now", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    expect(isUpcoming("2025-12-01T00:00:00Z", now)).toBe(false);
  });
});

describe("isDeadlineSoon", () => {
  const now = new Date("2026-01-01T00:00:00Z");

  it("returns true for a deadline 3 days away", () => {
    expect(isDeadlineSoon("2026-01-04T00:00:00Z", now)).toBe(true);
  });

  it("returns false for a deadline 10 days away", () => {
    expect(isDeadlineSoon("2026-01-11T00:00:00Z", now)).toBe(false);
  });

  it("returns false for a deadline that already passed", () => {
    expect(isDeadlineSoon("2025-12-30T00:00:00Z", now)).toBe(false);
  });
});
```

- [ ] **Step 5: Run the tests to verify they fail**

Run: `npx vitest run lib/utils/dates.test.ts`
Expected: FAIL — `./dates` has no exported members.

- [ ] **Step 6: Implement `lib/utils/dates.ts`**

```ts
const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
});

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function formatDate(iso: string): string {
  return DATE_FORMATTER.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return `${DATE_FORMATTER.format(date)} · ${TIME_FORMATTER.format(date)}`;
}

export function isUpcoming(iso: string, now: Date = new Date()): boolean {
  return new Date(iso).getTime() >= now.getTime();
}

export function isDeadlineSoon(iso: string, now: Date = new Date()): boolean {
  const deadline = new Date(iso).getTime();
  const nowMs = now.getTime();
  return deadline >= nowMs && deadline - nowMs <= SEVEN_DAYS_MS;
}
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npx vitest run lib/utils/dates.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 8: Write the failing tests for `lib/utils/ics.ts`**

```ts
// lib/utils/ics.test.ts
import { describe, expect, it } from "vitest";
import { buildIcsContent } from "./ics";

describe("buildIcsContent", () => {
  it("includes required VEVENT fields", () => {
    const content = buildIcsContent({
      uid: "fall-kickoff-gbm",
      title: "Fall Kickoff GBM",
      description: "First GBM of the semester.",
      location: "Student Union, Room 262",
      startsAt: "2026-08-27T18:00:00Z",
      endsAt: "2026-08-27T19:00:00Z",
    });

    expect(content).toContain("BEGIN:VCALENDAR");
    expect(content).toContain("BEGIN:VEVENT");
    expect(content).toContain("SUMMARY:Fall Kickoff GBM");
    expect(content).toContain("UID:fall-kickoff-gbm@nsbeutk.org");
    expect(content).toContain("DTSTART:20260827T180000Z");
    expect(content).toContain("DTEND:20260827T190000Z");
    expect(content).toContain("END:VEVENT");
    expect(content).toContain("END:VCALENDAR");
  });

  it("escapes commas and semicolons in text fields", () => {
    const content = buildIcsContent({
      uid: "test",
      title: "Workshop: Resumes, LinkedIn, & More",
      description: "Bring a laptop; bring questions.",
      location: "Room 1",
      startsAt: "2026-08-27T18:00:00Z",
      endsAt: "2026-08-27T19:00:00Z",
    });

    expect(content).toContain("SUMMARY:Workshop: Resumes\\, LinkedIn\\, & More");
    expect(content).toContain("DESCRIPTION:Bring a laptop\\; bring questions.");
  });
});
```

- [ ] **Step 9: Run the tests to verify they fail**

Run: `npx vitest run lib/utils/ics.test.ts`
Expected: FAIL — `./ics` has no exported members.

- [ ] **Step 10: Implement `lib/utils/ics.ts`**

```ts
export type IcsEventInput = {
  uid: string;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
};

function toIcsDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
}

export function buildIcsContent(event: IcsEventInput): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NSBE UTK//Website//EN",
    "BEGIN:VEVENT",
    `UID:${event.uid}@nsbeutk.org`,
    `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
    `DTSTART:${toIcsDate(event.startsAt)}`,
    `DTEND:${toIcsDate(event.endsAt)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

export function downloadIcs(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 11: Run the tests to verify they pass**

Run: `npx vitest run lib/utils/ics.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 12: Commit**

```bash
git add lib/utils/dates.ts lib/utils/dates.test.ts lib/utils/ics.ts lib/utils/ics.test.ts vitest.config.ts package.json package-lock.json
git commit -m "Add date formatting and .ics generation utilities with tests"
```

---

### Task 3: Sample content data layer

**Files:**
- Create: `lib/data/events.ts`
- Create: `lib/data/officers.ts`
- Create: `lib/data/sponsors.ts`
- Create: `lib/data/news.ts`
- Create: `lib/data/opportunities.ts`

**Interfaces:**
- Produces: `EVENT_TYPES`, `EventType`, `POINTS_BY_EVENT_TYPE`, `NsbeEvent`, `events` from `lib/data/events.ts` — used by Tasks 13, 16, 19.
- Produces: `Officer`, `officers` from `lib/data/officers.ts` — used by Task 17.
- Produces: `SponsorTier`, `Sponsor`, `sponsors` from `lib/data/sponsors.ts` — used by Tasks 16, 21.
- Produces: `NewsPost`, `newsPosts` from `lib/data/news.ts` — used by Tasks 16, 24.
- Produces: `OPPORTUNITY_CATEGORIES`, `OpportunityCategory`, `Opportunity`, `opportunities` from `lib/data/opportunities.ts` — used by Tasks 4, 5, 14, 20.

- [ ] **Step 1: Create `lib/data/events.ts`**

```ts
export const EVENT_TYPES = [
  "GBM",
  "Workshop",
  "Career Fair",
  "Hackathon",
  "Conference",
  "Social",
  "Community Service",
  "Study Hall",
  "Professional Development",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

// Source spec §4.3 only prices GBM, Social, Volunteer, Study Hall, Conference, and
// Professional Development. Workshop / Career Fair / Hackathon aren't priced there, so
// they're treated as Professional Development; "Community Service" is treated as the
// spec's "Volunteer" row.
export const POINTS_BY_EVENT_TYPE: Record<EventType, number> = {
  GBM: 5,
  Social: 10,
  "Community Service": 15,
  "Study Hall": 10,
  Conference: 15,
  "Professional Development": 15,
  Workshop: 15,
  "Career Fair": 15,
  Hackathon: 15,
};

export type NsbeEvent = {
  id: string;
  title: string;
  type: EventType;
  startsAt: string;
  endsAt: string;
  location: string;
  description: string;
  rsvpEnabled: boolean;
  volinkUrl?: string;
};

export const events: NsbeEvent[] = [
  {
    id: "fall-kickoff-gbm",
    title: "Fall Kickoff GBM",
    type: "GBM",
    startsAt: "2026-08-27T18:00:00Z",
    endsAt: "2026-08-27T19:00:00Z",
    location: "Student Union, Room 262",
    description:
      "Our first general body meeting of the fall semester — meet the new executive board, hear about this year's programming, and grab free food.",
    rsvpEnabled: true,
  },
  {
    id: "resume-linkedin-workshop",
    title: "Resume & LinkedIn Workshop",
    type: "Workshop",
    startsAt: "2026-09-09T17:30:00Z",
    endsAt: "2026-09-09T19:00:00Z",
    location: "Min Kao Building, Room 404",
    description:
      "Bring a laptop and your current resume for a hands-on workshop covering resume formatting, LinkedIn optimization, and recruiter red flags.",
    rsvpEnabled: true,
  },
  {
    id: "habitat-build-day",
    title: "Habitat for Humanity Build Day",
    type: "Community Service",
    startsAt: "2026-09-20T09:00:00Z",
    endsAt: "2026-09-20T13:00:00Z",
    location: "Knoxville Habitat for Humanity build site",
    description:
      "A full morning on-site with Knoxville Habitat for Humanity. Closed-toe shoes required; carpool details shared after RSVP.",
    rsvpEnabled: true,
  },
  {
    id: "career-fair-prep-social",
    title: "Career Fair Prep Social",
    type: "Social",
    startsAt: "2026-10-02T18:30:00Z",
    endsAt: "2026-10-02T20:00:00Z",
    location: "Student Union Ballroom",
    description:
      "A low-pressure social to practice your elevator pitch with fellow members before the engineering career fair.",
    rsvpEnabled: true,
  },
  {
    id: "nsbe-fall-regional-conference",
    title: "NSBE Fall Regional Conference",
    type: "Conference",
    startsAt: "2026-11-13T13:00:00Z",
    endsAt: "2026-11-15T18:00:00Z",
    location: "Atlanta, GA — Regional Conference Hotel",
    description:
      "Three days of workshops, the regional career fair, and networking with NSBE chapters across the region. Chapter funding available — see Resources.",
    rsvpEnabled: true,
  },
  {
    id: "spring-study-hall-kickoff",
    title: "Spring Study Hall Series Kickoff",
    type: "Study Hall",
    startsAt: "2026-02-05T18:00:00Z",
    endsAt: "2026-02-05T20:00:00Z",
    location: "Hodges Library, Group Study Room 2",
    description:
      "The first session of our weekly spring study hall series, open to members in any major.",
    rsvpEnabled: false,
  },
];
```

- [ ] **Step 2: Create `lib/data/officers.ts`**

```ts
export type Officer = {
  id: string;
  name: string;
  role: string;
  major: string;
  year: string;
};

export const officers: Officer[] = [
  { id: "president", name: "Jordan Williams", role: "President", major: "Electrical Engineering", year: "Senior" },
  { id: "vice-president", name: "Amara Chen", role: "Vice President", major: "Computer Science", year: "Senior" },
  { id: "treasurer", name: "Malik Johnson", role: "Treasurer", major: "Mechanical Engineering", year: "Junior" },
  { id: "secretary", name: "Simone Carter", role: "Secretary", major: "Chemical Engineering", year: "Junior" },
  { id: "programs-chair", name: "Devon Brooks", role: "Programs Chair", major: "Biomedical Engineering", year: "Senior" },
  { id: "corporate-relations-chair", name: "Nia Robinson", role: "Corporate Relations Chair", major: "Industrial Engineering", year: "Junior" },
  { id: "pr-historian-chair", name: "Elijah Turner", role: "PR & Historian Chair", major: "Computer Engineering", year: "Sophomore" },
];
```

- [ ] **Step 3: Create `lib/data/sponsors.ts`**

```ts
export const SPONSOR_TIERS = ["Gold", "Silver", "Bronze"] as const;

export type SponsorTier = (typeof SPONSOR_TIERS)[number];

export type Sponsor = {
  id: string;
  name: string;
  tier: SponsorTier;
  website: string;
  description: string;
};

export const sponsors: Sponsor[] = [
  {
    id: "meridian-systems",
    name: "Meridian Systems",
    tier: "Gold",
    website: "https://example.com",
    description: "Meridian Systems sponsors our fall recruiting events and funds two annual scholarships for chapter members.",
  },
  {
    id: "highland-robotics",
    name: "Highland Robotics",
    tier: "Gold",
    website: "https://example.com",
    description: "Highland Robotics hosts our spring plant tour and regularly hires chapter members as summer interns.",
  },
  {
    id: "bluepeak-energy",
    name: "Bluepeak Energy",
    tier: "Silver",
    website: "https://example.com",
    description: "Bluepeak Energy supports our professional development workshop series.",
  },
  {
    id: "cumberland-analytics",
    name: "Cumberland Analytics",
    tier: "Silver",
    website: "https://example.com",
    description: "Cumberland Analytics sends engineers to our resume review nights each semester.",
  },
  {
    id: "volunteer-ridge-foods",
    name: "Volunteer Ridge Foods",
    tier: "Bronze",
    website: "https://example.com",
    description: "Volunteer Ridge Foods provides catering for our GBMs throughout the year.",
  },
  {
    id: "foothills-manufacturing",
    name: "Foothills Manufacturing Co.",
    tier: "Bronze",
    website: "https://example.com",
    description: "Foothills Manufacturing Co. is a longtime supporter of our chapter's community service events.",
  },
];
```

- [ ] **Step 4: Create `lib/data/news.ts`**

```ts
export type NewsPost = {
  id: string;
  slug: string;
  title: string;
  publishedAt: string;
  author: string;
  excerpt: string;
  body: string;
};

export const newsPosts: NewsPost[] = [
  {
    id: "regional-chapter-of-the-year",
    slug: "regional-chapter-of-the-year",
    title: "NSBE UTK Named Regional Chapter of the Year",
    publishedAt: "2026-05-10T00:00:00Z",
    author: "NSBE UTK PR Committee",
    excerpt: "Our chapter was recognized at the NSBE Regional Conference for outstanding programming and member engagement this year.",
    body: "Our chapter was recognized at the NSBE Regional Conference for outstanding programming and member engagement this year.\n\nThe award reflects a full year of GBMs, workshops, community service, and record attendance at the national convention. Thank you to every member and officer who made this possible.\n\nWe're already planning an even bigger year ahead — stay tuned to the Events page for what's next.",
  },
  {
    id: "fall-recruitment-kickoff",
    slug: "fall-recruitment-kickoff-recap",
    title: "Fall 2026 Recruitment Kickoff Recap",
    publishedAt: "2026-08-28T00:00:00Z",
    author: "NSBE UTK Programs Committee",
    excerpt: "Our Fall Kickoff GBM drew one of our largest first-meeting crowds yet — here's a recap.",
    body: "Our Fall Kickoff GBM drew one of our largest first-meeting crowds yet.\n\nNew and returning members heard from the executive board about this semester's programming, met committee chairs, and signed up for our email list.\n\nIf you missed it, check the Events page for the next GBM and the Join page to get involved.",
  },
  {
    id: "member-spotlight-nsf-grfp",
    slug: "member-spotlight-nsf-grfp",
    title: "Member Spotlight: Junior Wins NSF GRFP",
    publishedAt: "2026-09-15T00:00:00Z",
    author: "NSBE UTK PR Committee",
    excerpt: "One of our chapter members was awarded the NSF Graduate Research Fellowship — read about their path to the award.",
    body: "One of our chapter members was awarded the NSF Graduate Research Fellowship, one of the most competitive graduate funding awards in the country.\n\nThey credit chapter study halls and the Graduate School Resources on our site for helping them put together a strong application.\n\nSee the Opportunities page for the next round of fellowship deadlines.",
  },
  {
    id: "meridian-systems-partnership",
    slug: "meridian-systems-partnership",
    title: "New Partnership Announcement: Meridian Systems",
    publishedAt: "2026-09-22T00:00:00Z",
    author: "NSBE UTK Corporate Relations Committee",
    excerpt: "We're excited to welcome Meridian Systems as a Gold-tier corporate partner for the 2026–2027 school year.",
    body: "We're excited to welcome Meridian Systems as a Gold-tier corporate partner for the 2026–2027 school year.\n\nMeridian Systems will be sponsoring our fall recruiting events and funding two annual scholarships for chapter members.\n\nSee the Corporate Partners page for details on all of our current partners.",
  },
];
```

- [ ] **Step 5: Create `lib/data/opportunities.ts`**

```ts
export const OPPORTUNITY_CATEGORIES = [
  "Internship",
  "Full-Time",
  "Scholarship",
  "Research",
  "Hackathon",
  "Conference",
  "Graduate School",
  "Leadership",
  "Volunteer",
  "Career Fair",
  "Study Session",
] as const;

export type OpportunityCategory = (typeof OPPORTUNITY_CATEGORIES)[number];

export type Opportunity = {
  id: string;
  title: string;
  company: string;
  category: OpportunityCategory;
  deadline: string;
  eligibility: string;
  description: string;
  url: string;
};

export const opportunities: Opportunity[] = [
  {
    id: "meridian-swe-intern",
    title: "Software Engineering Intern",
    company: "Meridian Systems",
    category: "Internship",
    deadline: "2026-09-15T00:00:00Z",
    eligibility: "Sophomore or above, any engineering or CS major",
    description: "Summer 2027 internship on Meridian's platform engineering team. Housing stipend included.",
    url: "https://example.com",
  },
  {
    id: "nsbe-convention-travel-scholarship",
    title: "NSBE National Convention Travel Scholarship",
    company: "NSBE National",
    category: "Scholarship",
    deadline: "2026-10-01T00:00:00Z",
    eligibility: "Active NSBE national members in good standing",
    description: "Covers flight and registration costs for members attending the NSBE National Convention.",
    url: "https://example.com",
  },
  {
    id: "sure-research-fellowship",
    title: "Summer Undergraduate Research Fellowship",
    company: "UTK College of Engineering",
    category: "Research",
    deadline: "2026-11-01T00:00:00Z",
    eligibility: "Junior or senior standing, 3.0 GPA or above",
    description: "A paid ten-week summer research fellowship working directly with a UTK Engineering faculty mentor.",
    url: "https://example.com",
  },
  {
    id: "hackknox-hackathon",
    title: "HackKnox Hackathon",
    company: "HackKnox Organizing Committee",
    category: "Hackathon",
    deadline: "2026-09-25T00:00:00Z",
    eligibility: "Open to all currently enrolled UTK students",
    description: "A 24-hour student hackathon with prizes for best overall hack and best use of open data.",
    url: "https://example.com",
  },
  {
    id: "gem-fellowship",
    title: "GEM Fellowship",
    company: "The GEM Consortium",
    category: "Graduate School",
    deadline: "2026-11-15T00:00:00Z",
    eligibility: "Seniors planning to pursue an MS or PhD in engineering or science",
    description: "Full funding for graduate study plus a paid summer internship with a GEM member employer.",
    url: "https://example.com",
  },
  {
    id: "chapter-programs-committee-lead",
    title: "Programs Committee Lead",
    company: "NSBE UTK",
    category: "Leadership",
    deadline: "2026-09-05T00:00:00Z",
    eligibility: "Active chapter members, any year",
    description: "Help plan GBMs, workshops, and socials for the spring semester as a Programs Committee lead.",
    url: "https://example.com",
  },
  {
    id: "habitat-volunteer-crew",
    title: "Habitat for Humanity Volunteer Crew",
    company: "Knoxville Habitat for Humanity",
    category: "Volunteer",
    deadline: "2026-09-18T00:00:00Z",
    eligibility: "Open to all members; closed-toe shoes required",
    description: "Join the chapter build crew for a morning on-site with Knoxville Habitat for Humanity.",
    url: "https://example.com",
  },
  {
    id: "fall-engineering-career-fair",
    title: "Fall Engineering Career Fair",
    company: "UTK Engineering Career Services",
    category: "Career Fair",
    deadline: "2026-10-05T00:00:00Z",
    eligibility: "Open to all UTK Engineering students",
    description: "Meet recruiters from over 100 companies at the college-wide fall career fair.",
    url: "https://example.com",
  },
  {
    id: "circuits-study-session",
    title: "Circuits Study Session",
    company: "NSBE UTK Academic Excellence Committee",
    category: "Study Session",
    deadline: "2026-09-30T00:00:00Z",
    eligibility: "Open to any member currently enrolled in a circuits course",
    description: "A peer-led review session ahead of the ECE 302 midterm, hosted by upperclassmen members.",
    url: "https://example.com",
  },
  {
    id: "highland-manufacturing-engineer",
    title: "Manufacturing Engineer (Full-Time)",
    company: "Highland Robotics",
    category: "Full-Time",
    deadline: "2026-12-01T00:00:00Z",
    eligibility: "Graduating seniors, Mechanical or Industrial Engineering",
    description: "Entry-level manufacturing engineering role on Highland Robotics' production line team.",
    url: "https://example.com",
  },
  {
    id: "nsf-grfp",
    title: "NSF Graduate Research Fellowship Program",
    company: "National Science Foundation",
    category: "Graduate School",
    deadline: "2026-10-20T00:00:00Z",
    eligibility: "Seniors or first-year graduate students in an NSF-supported field",
    description: "A five-year fellowship including three years of financial support for graduate study.",
    url: "https://example.com",
  },
];
```

- [ ] **Step 6: Verify the project still type-checks**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add lib/data
git commit -m "Add sample content data layer for events, officers, sponsors, news, opportunities"
```

---

### Task 4: Form validation schemas

**Files:**
- Create: `lib/schemas/rsvp.ts`
- Create: `lib/schemas/join-interest.ts`
- Create: `lib/schemas/sponsor-inquiry.ts`
- Create: `lib/schemas/contact.ts`
- Create: `lib/schemas/opportunity-submission.ts`
- Create: `lib/schemas/schemas.test.ts`

**Interfaces:**
- Consumes: `OPPORTUNITY_CATEGORIES` from `lib/data/opportunities.ts` (Task 3).
- Produces: `rsvpSchema`/`RsvpFormValues` — used by Task 13.
- Produces: `joinInterestSchema`/`JoinInterestFormValues` — used by Task 15.
- Produces: `SPONSOR_INTEREST_TYPES`, `sponsorInquirySchema`/`SponsorInquiryFormValues` — used by Task 15.
- Produces: `contactSchema`/`ContactFormValues` — used by Task 15.
- Produces: `opportunitySubmissionSchema`/`OpportunitySubmissionFormValues` — used by Task 15.

- [ ] **Step 1: Install form dependencies**

Run: `npm install zod@^3 react-hook-form @hookform/resolvers`

- [ ] **Step 2: Write the failing schema tests**

```ts
// lib/schemas/schemas.test.ts
import { describe, expect, it } from "vitest";
import { rsvpSchema } from "./rsvp";
import { joinInterestSchema } from "./join-interest";
import { sponsorInquirySchema } from "./sponsor-inquiry";
import { contactSchema } from "./contact";
import { opportunitySubmissionSchema } from "./opportunity-submission";

describe("rsvpSchema", () => {
  it("accepts a valid RSVP", () => {
    expect(rsvpSchema.safeParse({ name: "Jordan Williams", email: "jordan@example.com" }).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(rsvpSchema.safeParse({ name: "Jordan Williams", email: "not-an-email" }).success).toBe(false);
  });
});

describe("joinInterestSchema", () => {
  it("accepts a valid submission without the optional message", () => {
    const result = joinInterestSchema.safeParse({
      name: "Amara Chen",
      email: "amara@example.com",
      major: "Computer Science",
      gradYear: "2028",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-4-digit graduation year", () => {
    const result = joinInterestSchema.safeParse({
      name: "Amara Chen",
      email: "amara@example.com",
      major: "Computer Science",
      gradYear: "28",
    });
    expect(result.success).toBe(false);
  });
});

describe("sponsorInquirySchema", () => {
  it("accepts a valid inquiry", () => {
    const result = sponsorInquirySchema.safeParse({
      name: "Taylor Reed",
      company: "Example Corp",
      interestType: "Sponsorship",
      email: "taylor@example.com",
      message: "We'd like to learn more about sponsoring an event.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an interest type outside the enum", () => {
    const result = sponsorInquirySchema.safeParse({
      name: "Taylor Reed",
      company: "Example Corp",
      interestType: "Other Thing",
      email: "taylor@example.com",
      message: "We'd like to learn more about sponsoring an event.",
    });
    expect(result.success).toBe(false);
  });
});

describe("contactSchema", () => {
  it("accepts a valid message", () => {
    const result = contactSchema.safeParse({
      name: "Sam Lee",
      email: "sam@example.com",
      subject: "Question about events",
      message: "When is the next GBM?",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a message that's too short", () => {
    const result = contactSchema.safeParse({
      name: "Sam Lee",
      email: "sam@example.com",
      subject: "Hi",
      message: "?",
    });
    expect(result.success).toBe(false);
  });
});

describe("opportunitySubmissionSchema", () => {
  it("accepts a valid submission", () => {
    const result = opportunitySubmissionSchema.safeParse({
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
    expect(result.success).toBe(true);
  });

  it("rejects an invalid apply URL", () => {
    const result = opportunitySubmissionSchema.safeParse({
      title: "Data Analyst Intern",
      company: "Example Corp",
      category: "Internship",
      deadline: "2026-12-01",
      eligibility: "Sophomore or above",
      description: "A summer internship on the analytics team.",
      url: "not-a-url",
      submitterName: "Jordan Williams",
      submitterEmail: "jordan@example.com",
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npx vitest run lib/schemas/schemas.test.ts`
Expected: FAIL — none of the schema modules exist yet.

- [ ] **Step 4: Implement `lib/schemas/rsvp.ts`**

```ts
import { z } from "zod";

export const rsvpSchema = z.object({
  name: z.string().min(2, "Enter your full name."),
  email: z.string().email("Enter a valid email address."),
});

export type RsvpFormValues = z.infer<typeof rsvpSchema>;
```

- [ ] **Step 5: Implement `lib/schemas/join-interest.ts`**

```ts
import { z } from "zod";

export const joinInterestSchema = z.object({
  name: z.string().min(2, "Enter your full name."),
  email: z.string().email("Enter a valid email address."),
  major: z.string().min(2, "Enter your major."),
  gradYear: z.string().regex(/^\d{4}$/, "Enter a 4-digit graduation year."),
  message: z.string().optional(),
});

export type JoinInterestFormValues = z.infer<typeof joinInterestSchema>;
```

- [ ] **Step 6: Implement `lib/schemas/sponsor-inquiry.ts`**

```ts
import { z } from "zod";

export const SPONSOR_INTEREST_TYPES = ["Sponsorship", "Recruiting", "Donation", "Other"] as const;

export const sponsorInquirySchema = z.object({
  name: z.string().min(2, "Enter your name."),
  company: z.string().min(2, "Enter your company name."),
  interestType: z.enum(SPONSOR_INTEREST_TYPES),
  email: z.string().email("Enter a valid email address."),
  message: z.string().min(10, "Tell us a bit more about what you're looking for."),
});

export type SponsorInquiryFormValues = z.infer<typeof sponsorInquirySchema>;
```

- [ ] **Step 7: Implement `lib/schemas/contact.ts`**

```ts
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Enter your name."),
  email: z.string().email("Enter a valid email address."),
  subject: z.string().min(3, "Enter a subject."),
  message: z.string().min(10, "Enter a message."),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
```

- [ ] **Step 8: Implement `lib/schemas/opportunity-submission.ts`**

```ts
import { z } from "zod";
import { OPPORTUNITY_CATEGORIES } from "@/lib/data/opportunities";

export const opportunitySubmissionSchema = z.object({
  title: z.string().min(3, "Enter a title."),
  company: z.string().min(2, "Enter a company or organization."),
  category: z.enum(OPPORTUNITY_CATEGORIES),
  deadline: z.string().min(1, "Select a deadline."),
  eligibility: z.string().min(2, "Describe eligibility requirements."),
  description: z.string().min(10, "Add a short description."),
  url: z.string().url("Enter a valid URL."),
  submitterName: z.string().min(2, "Enter your name."),
  submitterEmail: z.string().email("Enter a valid email address."),
});

export type OpportunitySubmissionFormValues = z.infer<typeof opportunitySubmissionSchema>;
```

- [ ] **Step 9: Run the tests to verify they pass**

Run: `npx vitest run lib/schemas/schemas.test.ts`
Expected: PASS (10 tests).

- [ ] **Step 10: Commit**

```bash
git add lib/schemas package.json package-lock.json
git commit -m "Add Zod validation schemas for all five forms with tests"
```

---

### Task 5: Opportunities filter utility

**Files:**
- Create: `lib/utils/opportunities-filter.ts`
- Create: `lib/utils/opportunities-filter.test.ts`

**Interfaces:**
- Consumes: `Opportunity`, `OpportunityCategory` from `lib/data/opportunities.ts` (Task 3).
- Produces: `OpportunityFilters` type and `filterOpportunities(opportunities: Opportunity[], filters: OpportunityFilters): Opportunity[]` — used by Task 14.

- [ ] **Step 1: Write the failing test**

```ts
// lib/utils/opportunities-filter.test.ts
import { describe, expect, it } from "vitest";
import { filterOpportunities } from "./opportunities-filter";
import type { Opportunity } from "@/lib/data/opportunities";

const FIXTURES: Opportunity[] = [
  {
    id: "1",
    title: "Software Engineering Intern",
    company: "Meridian Systems",
    category: "Internship",
    deadline: "2026-09-15T00:00:00Z",
    eligibility: "Sophomore or above",
    description: "Summer internship on the platform team.",
    url: "https://example.com",
  },
  {
    id: "2",
    title: "GEM Fellowship",
    company: "The GEM Consortium",
    category: "Graduate School",
    deadline: "2026-11-15T00:00:00Z",
    eligibility: "Seniors",
    description: "Full funding for graduate study.",
    url: "https://example.com",
  },
  {
    id: "3",
    title: "Circuits Study Session",
    company: "NSBE UTK Academic Excellence Committee",
    category: "Study Session",
    deadline: "2026-09-30T00:00:00Z",
    eligibility: "Any member",
    description: "Peer-led review ahead of the midterm.",
    url: "https://example.com",
  },
];

describe("filterOpportunities", () => {
  it("returns everything when category is All and query is empty", () => {
    expect(filterOpportunities(FIXTURES, { category: "All", query: "" })).toHaveLength(3);
  });

  it("filters by category", () => {
    const result = filterOpportunities(FIXTURES, { category: "Internship", query: "" });
    expect(result.map((o) => o.id)).toEqual(["1"]);
  });

  it("filters by keyword in the title", () => {
    const result = filterOpportunities(FIXTURES, { category: "All", query: "fellowship" });
    expect(result.map((o) => o.id)).toEqual(["2"]);
  });

  it("filters by keyword in the company, case-insensitively", () => {
    const result = filterOpportunities(FIXTURES, { category: "All", query: "meridian" });
    expect(result.map((o) => o.id)).toEqual(["1"]);
  });

  it("combines category and keyword filters", () => {
    const result = filterOpportunities(FIXTURES, { category: "Study Session", query: "midterm" });
    expect(result.map((o) => o.id)).toEqual(["3"]);
  });

  it("returns an empty array when nothing matches", () => {
    const result = filterOpportunities(FIXTURES, { category: "All", query: "nonexistent" });
    expect(result).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/utils/opportunities-filter.test.ts`
Expected: FAIL — `./opportunities-filter` has no exported members.

- [ ] **Step 3: Implement `lib/utils/opportunities-filter.ts`**

```ts
import type { Opportunity, OpportunityCategory } from "@/lib/data/opportunities";

export type OpportunityFilters = {
  category: OpportunityCategory | "All";
  query: string;
};

export function filterOpportunities(opportunities: Opportunity[], filters: OpportunityFilters): Opportunity[] {
  const query = filters.query.trim().toLowerCase();

  return opportunities.filter((opportunity) => {
    const matchesCategory = filters.category === "All" || opportunity.category === filters.category;
    if (!matchesCategory) return false;
    if (query.length === 0) return true;

    const haystack = `${opportunity.title} ${opportunity.company} ${opportunity.description}`.toLowerCase();
    return haystack.includes(query);
  });
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run lib/utils/opportunities-filter.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/utils/opportunities-filter.ts lib/utils/opportunities-filter.test.ts
git commit -m "Add opportunities category/keyword filter utility with tests"
```

---

### Task 6: Base UI primitives (button, badge, card, input, textarea, field)

**Files:**
- Create: `components/ui/button.tsx`
- Create: `components/ui/badge.tsx`
- Create: `components/ui/card.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/textarea.tsx`
- Create: `components/ui/field.tsx`

**Interfaces:**
- Consumes: `cn` from `lib/utils.ts` (Task 1).
- Produces: `Button`, `buttonVariants`, `ButtonProps` from `components/ui/button.tsx` — used by Tasks 12, 13, 15, 16.
- Produces: `Badge`, `BadgeProps` from `components/ui/badge.tsx` — used by Tasks 13, 14, 21.
- Produces: `Card` from `components/ui/card.tsx` — used by Tasks 13, 14.
- Produces: `Input` from `components/ui/input.tsx` — used by Tasks 13, 14, 15.
- Produces: `Textarea` from `components/ui/textarea.tsx` — used by Task 15.
- Produces: `Field` from `components/ui/field.tsx` — used by Tasks 13, 15.

- [ ] **Step 1: Create `components/ui/button.tsx`**

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 min-h-11 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-secondary text-black hover:bg-secondary-hover",
        secondary:
          "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-white dark:border-secondary dark:text-secondary dark:hover:bg-secondary dark:hover:text-black",
        outlineOnPrimary: "border-2 border-white text-white bg-transparent hover:bg-white hover:text-primary",
      },
    },
    defaultVariants: { variant: "primary" },
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant }), className)} {...props} />
));
Button.displayName = "Button";
```

- [ ] **Step 2: Create `components/ui/badge.tsx`**

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded text-xs font-bold px-2 py-1", {
  variants: {
    variant: {
      secondary: "bg-secondary text-black",
      primary: "bg-primary text-white",
    },
  },
  defaultVariants: { variant: "secondary" },
});

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
```

- [ ] **Step 3: Create `components/ui/card.tsx`**

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-border-subtle bg-surface", className)} {...props} />;
}
```

- [ ] **Step 4: Create `components/ui/input.tsx`**

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full min-h-11 rounded-md border border-border-subtle bg-primary/5 px-3 py-2 text-sm text-foreground placeholder:text-caption focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
```

- [ ] **Step 5: Create `components/ui/textarea.tsx`**

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-md border border-border-subtle bg-primary/5 px-3 py-2 text-sm text-foreground placeholder:text-caption focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
```

- [ ] **Step 6: Create `components/ui/field.tsx`**

```tsx
import * as React from "react";

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  children: React.ReactElement<{
    id?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
  }>;
};

export function Field({ id, label, error, children }: FieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-bold text-foreground">
        {label}
      </label>
      {React.cloneElement(children, {
        id,
        "aria-describedby": error ? errorId : undefined,
        "aria-invalid": error ? true : undefined,
      })}
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 7: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add components/ui/button.tsx components/ui/badge.tsx components/ui/card.tsx components/ui/input.tsx components/ui/textarea.tsx components/ui/field.tsx
git commit -m "Add base UI primitives: button, badge, card, input, textarea, field"
```

---

### Task 7: Overlay primitives (dialog, accordion)

**Files:**
- Create: `components/ui/dialog.tsx`
- Create: `components/ui/accordion.tsx`

**Interfaces:**
- Consumes: `cn` from `lib/utils.ts` (Task 1).
- Produces: `Dialog`, `DialogTrigger`, `DialogContent` from `components/ui/dialog.tsx` — used by Task 13.
- Produces: `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` from `components/ui/accordion.tsx` — used by Tasks 18, 22.

- [ ] **Step 1: Install Radix primitives**

Run: `npm install @radix-ui/react-dialog @radix-ui/react-accordion`

- [ ] **Step 2: Create `components/ui/dialog.tsx`**

```tsx
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export function DialogContent({
  className,
  children,
  title,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { title: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-surface p-6 shadow-lg focus:outline-none",
          className
        )}
        {...props}
      >
        <div className="mb-4 flex items-center justify-between">
          <DialogPrimitive.Title className="text-lg font-bold text-primary dark:text-secondary">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Close
            className="rounded-md p-1 text-foreground hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            aria-label="Close"
          >
            <X className="size-5" />
          </DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
```

- [ ] **Step 3: Create `components/ui/accordion.tsx`**

```tsx
"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Accordion = AccordionPrimitive.Root;

export function AccordionItem({ className, ...props }: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item className={cn("border-b border-border-subtle", className)} {...props} />;
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          "flex flex-1 items-center justify-between py-4 text-left font-bold text-primary dark:text-secondary [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="size-4 shrink-0 transition-transform" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content className="overflow-hidden text-sm" {...props}>
      <div className={cn("pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}
```

- [ ] **Step 4: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/ui/dialog.tsx components/ui/accordion.tsx package.json package-lock.json
git commit -m "Add Radix-based dialog and accordion primitives"
```

---

### Task 8: Dark mode (theme provider + toggle)

**Files:**
- Create: `components/theme/theme-provider.tsx`
- Create: `components/theme/theme-toggle.tsx`

**Interfaces:**
- Produces: `ThemeProvider` from `components/theme/theme-provider.tsx` — used by Task 11.
- Produces: `ThemeToggle` from `components/theme/theme-toggle.tsx` — used by Task 9.

- [ ] **Step 1: Install next-themes**

Run: `npm install next-themes`

- [ ] **Step 2: Create `components/theme/theme-provider.tsx`**

```tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
```

- [ ] **Step 3: Create `components/theme/theme-toggle.tsx`**

```tsx
"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="size-11" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      className="flex size-11 items-center justify-center rounded-md hover:bg-white/10"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors. (Full behavior is verified visually in Task 11 once the provider is wired into the root layout.)

- [ ] **Step 5: Commit**

```bash
git add components/theme package.json package-lock.json
git commit -m "Add dark mode theme provider and toggle button"
```

---

### Task 9: Site header

**Files:**
- Create: `components/layout/site-header.tsx`

**Interfaces:**
- Consumes: `cn` (Task 1), `ThemeToggle` (Task 8).
- Produces: `SiteHeader` — used by Task 11.

- [ ] **Step 1: Create `components/layout/site-header.tsx`**

```tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/join", label: "Join NSBE" },
  { href: "/events", label: "Events" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/partners", label: "Corporate Partners" },
  { href: "/resources", label: "Resources" },
  { href: "/gallery", label: "Gallery" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-primary text-white">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold" onClick={() => setIsMenuOpen(false)}>
          NSBE UTK
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium hover:text-secondary",
                  isActive && "text-secondary underline underline-offset-4"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-md hover:bg-white/10 lg:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <nav id="mobile-nav" aria-label="Primary" className="border-t border-white/10 lg:hidden">
          <ul className="flex flex-col px-6 py-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "block min-h-11 py-3 text-base font-medium hover:text-secondary",
                    pathname === link.href && "text-secondary"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
```

- [ ] **Step 2: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/layout/site-header.tsx
git commit -m "Add site header with responsive nav and theme toggle"
```

---

### Task 10: Site footer

**Files:**
- Create: `components/layout/site-footer.tsx`

**Interfaces:**
- Produces: `SiteFooter` — used by Task 11.

- [ ] **Step 1: Create `components/layout/site-footer.tsx`**

```tsx
import Link from "next/link";
import { Instagram, Linkedin, Mail } from "lucide-react";

const FOOTER_LINKS = [
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/partners", label: "Corporate Partners" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 py-12 sm:flex-row sm:justify-between">
        <div>
          <p className="text-lg font-bold">NSBE UTK</p>
          <p className="mt-2 max-w-xs text-sm text-white/70">
            The University of Tennessee, Knoxville chapter of the National Society of Black Engineers.
          </p>
          <div className="mt-4 flex gap-4">
            <a href="https://example.com" className="hover:text-secondary" aria-label="Instagram">
              <Instagram className="size-5" />
            </a>
            <a href="https://example.com" className="hover:text-secondary" aria-label="LinkedIn">
              <Linkedin className="size-5" />
            </a>
            <a href="mailto:nsbe@utk.edu" className="hover:text-secondary" aria-label="Email">
              <Mail className="size-5" />
            </a>
          </div>
        </div>

        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-1">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-secondary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10 px-6 py-4 text-center text-xs text-white/60">
        © {year} NSBE UTK. All rights reserved.
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/layout/site-footer.tsx
git commit -m "Add site footer"
```

---

### Task 11: Root layout wiring, metadata, and OG image

**Files:**
- Modify: `app/layout.tsx`
- Create: `app/opengraph-image.tsx`

**Interfaces:**
- Consumes: `ThemeProvider` (Task 8), `SiteHeader` (Task 9), `SiteFooter` (Task 10).
- Produces: the wired root layout every page (Tasks 16–25) renders inside.

- [ ] **Step 1: Rewrite `app/layout.tsx`**

```tsx
import type { Metadata, Viewport } from "next";
import { Arimo } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

const arimo = Arimo({
  variable: "--font-arimo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nsbeutk.org"),
  title: {
    default: "NSBE UTK — National Society of Black Engineers, UT Knoxville",
    template: "%s · NSBE UTK",
  },
  description:
    "The University of Tennessee, Knoxville chapter of the National Society of Black Engineers: events, opportunities, and resources for our members.",
  openGraph: {
    title: "NSBE UTK",
    description: "The University of Tennessee, Knoxville chapter of the National Society of Black Engineers.",
    url: "https://nsbeutk.org",
    siteName: "NSBE UTK",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#173345" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1a29" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={arimo.variable} suppressHydrationWarning>
      <body className="flex min-h-full flex-col antialiased">
        <ThemeProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create `app/opengraph-image.tsx`**

```tsx
import { ImageResponse } from "next/og";

export const alt = "NSBE UTK — National Society of Black Engineers, UT Knoxville";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundColor: "#173345",
          padding: "80px",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, color: "#ffffff" }}>NSBE UTK</div>
        <div style={{ marginTop: 24, fontSize: 32, color: "#ffcf40", fontWeight: 700 }}>
          National Society of Black Engineers — UT Knoxville
        </div>
      </div>
    ),
    { ...size }
  );
}
```

- [ ] **Step 3: Manually verify in the browser**

Run: `npm run dev`
Visit `http://localhost:3000` — the primary-navy header with "NSBE UTK" and nav links should render, followed by the (still-default) home page content, then the footer. Resize the window below 1024px and confirm the nav collapses to a hamburger menu that opens/closes on click. Click the theme toggle and confirm the page switches between light and dark palettes. Stop the dev server.

- [ ] **Step 4: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/opengraph-image.tsx
git commit -m "Wire root layout with header, footer, theme provider, metadata, and OG image"
```

---

### Task 12: Shared feature components (form success, stat counter)

**Files:**
- Create: `components/shared/form-success.tsx`
- Create: `components/shared/stat-counter.tsx`

**Interfaces:**
- Produces: `FormSuccess` from `components/shared/form-success.tsx` — used by Tasks 13, 15.
- Produces: `StatCounter` from `components/shared/stat-counter.tsx` — used by Task 16.

- [ ] **Step 1: Install Framer Motion**

Run: `npm install framer-motion`

- [ ] **Step 2: Create `components/shared/form-success.tsx`**

```tsx
import * as React from "react";
import { CheckCircle2 } from "lucide-react";

type FormSuccessProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function FormSuccess({ title, description, children }: FormSuccessProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg bg-secondary/20 p-6 text-center">
      <CheckCircle2 className="size-8 text-primary dark:text-secondary" aria-hidden="true" />
      <p className="text-base font-bold text-primary dark:text-secondary">{title}</p>
      <p className="text-sm text-foreground">{description}</p>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Create `components/shared/stat-counter.tsx`**

```tsx
"use client";

import * as React from "react";
import { animate, useInView } from "framer-motion";

type StatCounterProps = {
  value: number;
  label: string;
  suffix?: string;
};

export function StatCounter({ value, label, suffix = "" }: StatCounterProps) {
  const ref = React.useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    if (!isInView) return;

    const controls = animate(0, value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });

    return () => controls.stop();
  }, [isInView, value]);

  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <p ref={ref} className="text-4xl font-bold text-primary dark:text-secondary">
        {display}
        {suffix}
      </p>
      <p className="text-sm font-medium text-caption">{label}</p>
    </div>
  );
}
```

- [ ] **Step 4: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/shared package.json package-lock.json
git commit -m "Add FormSuccess and animated StatCounter shared components"
```

---

### Task 13: Event card, RSVP dialog, and RSVP form

**Files:**
- Create: `components/events/event-card.tsx`
- Create: `components/events/rsvp-dialog.tsx`
- Create: `components/events/rsvp-form.tsx`

**Interfaces:**
- Consumes: `NsbeEvent`, `POINTS_BY_EVENT_TYPE` (Task 3); `formatDateTime`, `isUpcoming` (Task 2); `buildIcsContent`, `downloadIcs` (Task 2); `Badge`, `Card`, `Button`, `Input`, `Field` (Task 6); `Dialog`, `DialogTrigger`, `DialogContent` (Task 7); `FormSuccess` (Task 12); `rsvpSchema`, `RsvpFormValues` (Task 4).
- Produces: `EventCard` — used by Tasks 16, 19.

- [ ] **Step 1: Create `components/events/rsvp-form.tsx`**

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { rsvpSchema, type RsvpFormValues } from "@/lib/schemas/rsvp";

export function RsvpForm({ onSuccess }: { onSuccess: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RsvpFormValues>({ resolver: zodResolver(rsvpSchema) });

  return (
    <form onSubmit={handleSubmit(() => onSuccess())} className="flex flex-col gap-4" noValidate>
      <Field id="rsvp-name" label="Full name" error={errors.name?.message}>
        <Input {...register("name")} />
      </Field>
      <Field id="rsvp-email" label="Email" error={errors.email?.message}>
        <Input type="email" {...register("email")} />
      </Field>
      <Button type="submit" disabled={isSubmitting}>
        Confirm RSVP
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Create `components/events/rsvp-dialog.tsx`**

```tsx
"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormSuccess } from "@/components/shared/form-success";
import { buildIcsContent, downloadIcs } from "@/lib/utils/ics";
import type { NsbeEvent } from "@/lib/data/events";
import { RsvpForm } from "./rsvp-form";

export function RsvpDialog({ event }: { event: NsbeEvent }) {
  const [open, setOpen] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  function handleAddToCalendar() {
    const content = buildIcsContent({
      uid: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
    });
    downloadIcs(`${event.id}.ics`, content);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSubmitted(false);
      }}
    >
      <DialogTrigger asChild>
        <Button type="button">RSVP</Button>
      </DialogTrigger>
      <DialogContent title={`RSVP — ${event.title}`}>
        {submitted ? (
          <FormSuccess
            title="You're on the list!"
            description="We've recorded your RSVP. Add the event to your calendar so you don't miss it."
          >
            <Button type="button" variant="secondary" onClick={handleAddToCalendar}>
              Add to calendar
            </Button>
          </FormSuccess>
        ) : (
          <RsvpForm onSuccess={() => setSubmitted(true)} />
        )}
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Create `components/events/event-card.tsx`**

```tsx
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDateTime, isUpcoming } from "@/lib/utils/dates";
import { POINTS_BY_EVENT_TYPE, type NsbeEvent } from "@/lib/data/events";
import { RsvpDialog } from "./rsvp-dialog";

export function EventCard({ event }: { event: NsbeEvent }) {
  const upcoming = isUpcoming(event.endsAt);

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="h-1.5 bg-secondary" />
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary">{event.type}</Badge>
          <span className="text-sm font-bold text-primary dark:text-secondary">
            +{POINTS_BY_EVENT_TYPE[event.type]} pts
          </span>
        </div>
        <h3 className="text-lg font-bold text-primary dark:text-secondary">{event.title}</h3>
        <p className="text-sm text-caption">{formatDateTime(event.startsAt)}</p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary underline hover:text-secondary dark:text-secondary"
        >
          {event.location}
        </a>
        <p className="text-sm text-foreground">{event.description}</p>

        <div className="mt-auto flex flex-wrap gap-3 pt-2">
          {upcoming && event.rsvpEnabled ? (
            <RsvpDialog event={event} />
          ) : (
            <span className="text-sm font-medium text-caption">
              {upcoming ? "RSVP closed" : "This event has passed"}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Step 4: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/events
git commit -m "Add event card, RSVP dialog, RSVP form, and .ics download"
```

---

### Task 14: Opportunity card and filterable browser

**Files:**
- Create: `components/opportunities/opportunity-card.tsx`
- Create: `components/opportunities/opportunities-browser.tsx`

**Interfaces:**
- Consumes: `Opportunity`, `OPPORTUNITY_CATEGORIES` (Task 3); `formatDate`, `isDeadlineSoon` (Task 2); `filterOpportunities` (Task 5); `Badge`, `Card`, `Input`, `cn` (Task 6).
- Produces: `OpportunityCard`, `OpportunitiesBrowser` — used by Task 20.

- [ ] **Step 1: Create `components/opportunities/opportunity-card.tsx`**

```tsx
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate, isDeadlineSoon } from "@/lib/utils/dates";
import type { Opportunity } from "@/lib/data/opportunities";
import { cn } from "@/lib/utils";

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const deadlineSoon = isDeadlineSoon(opportunity.deadline);

  return (
    <Card className="flex flex-col gap-3 border-l-4 border-l-secondary p-6">
      <Badge variant="primary">{opportunity.category}</Badge>
      <h3 className="text-lg font-bold text-primary dark:text-secondary">{opportunity.title}</h3>
      <p className="text-sm font-medium text-foreground">{opportunity.company}</p>
      <p className={cn("text-sm font-medium", deadlineSoon ? "text-red-600 dark:text-red-400" : "text-caption")}>
        Deadline: {formatDate(opportunity.deadline)}
      </p>
      <p className="text-sm text-caption">Eligibility: {opportunity.eligibility}</p>
      <p className="text-sm text-foreground">{opportunity.description}</p>
      <a
        href={opportunity.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto text-sm font-bold text-primary underline hover:text-secondary dark:text-secondary"
      >
        Apply / Learn more
      </a>
    </Card>
  );
}
```

- [ ] **Step 2: Create `components/opportunities/opportunities-browser.tsx`**

```tsx
"use client";

import * as React from "react";
import { OPPORTUNITY_CATEGORIES, type Opportunity } from "@/lib/data/opportunities";
import { filterOpportunities } from "@/lib/utils/opportunities-filter";
import { Input } from "@/components/ui/input";
import { OpportunityCard } from "./opportunity-card";

export function OpportunitiesBrowser({ opportunities }: { opportunities: Opportunity[] }) {
  const [category, setCategory] = React.useState<"All" | Opportunity["category"]>("All");
  const [query, setQuery] = React.useState("");

  const results = filterOpportunities(opportunities, { category, query });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="opportunities-search" className="text-sm font-bold text-foreground">
            Search
          </label>
          <Input
            id="opportunities-search"
            type="search"
            placeholder="Search by title or company"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:w-64">
          <label htmlFor="opportunities-category" className="text-sm font-bold text-foreground">
            Category
          </label>
          <select
            id="opportunities-category"
            className="min-h-11 rounded-md border border-border-subtle bg-primary/5 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            value={category}
            onChange={(event) => setCategory(event.target.value as "All" | Opportunity["category"])}
          >
            <option value="All">All categories</option>
            {OPPORTUNITY_CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {results.length === 0 ? (
        <p className="text-sm text-caption">No opportunities match your search.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/opportunities
git commit -m "Add opportunity card and filterable opportunities browser"
```

---

### Task 15: Stub-submit forms (join, sponsor inquiry, contact, opportunity submission)

**Files:**
- Create: `components/forms/join-interest-form.tsx`
- Create: `components/forms/sponsor-inquiry-form.tsx`
- Create: `components/forms/contact-form.tsx`
- Create: `components/forms/opportunity-submission-form.tsx`

**Interfaces:**
- Consumes: schemas from Task 4; `OPPORTUNITY_CATEGORIES` (Task 3); `Button`, `Input`, `Textarea`, `Field` (Task 6); `FormSuccess` (Task 12).
- Produces: `JoinInterestForm`, `SponsorInquiryForm`, `ContactForm`, `OpportunitySubmissionForm` — used by Tasks 18, 20, 21, 25.

- [ ] **Step 1: Create `components/forms/join-interest-form.tsx`**

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
import { joinInterestSchema, type JoinInterestFormValues } from "@/lib/schemas/join-interest";

export function JoinInterestForm() {
  const [submitted, setSubmitted] = React.useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<JoinInterestFormValues>({ resolver: zodResolver(joinInterestSchema) });

  if (submitted) {
    return (
      <FormSuccess title="Thanks for your interest!" description="An officer will follow up with next steps for joining NSBE UTK.">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            reset();
            setSubmitted(false);
          }}
        >
          Submit another response
        </Button>
      </FormSuccess>
    );
  }

  return (
    <form onSubmit={handleSubmit(() => setSubmitted(true))} className="flex flex-col gap-4" noValidate>
      <Field id="join-name" label="Full name" error={errors.name?.message}>
        <Input {...register("name")} />
      </Field>
      <Field id="join-email" label="Email" error={errors.email?.message}>
        <Input type="email" {...register("email")} />
      </Field>
      <Field id="join-major" label="Major" error={errors.major?.message}>
        <Input {...register("major")} />
      </Field>
      <Field id="join-grad-year" label="Expected graduation year" error={errors.gradYear?.message}>
        <Input inputMode="numeric" placeholder="2028" {...register("gradYear")} />
      </Field>
      <Field id="join-message" label="Anything you'd like us to know? (optional)" error={errors.message?.message}>
        <Textarea rows={4} {...register("message")} />
      </Field>
      <Button type="submit" disabled={isSubmitting}>
        Submit interest form
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Create `components/forms/sponsor-inquiry-form.tsx`**

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
import { SPONSOR_INTEREST_TYPES, sponsorInquirySchema, type SponsorInquiryFormValues } from "@/lib/schemas/sponsor-inquiry";

export function SponsorInquiryForm() {
  const [submitted, setSubmitted] = React.useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SponsorInquiryFormValues>({ resolver: zodResolver(sponsorInquirySchema) });

  if (submitted) {
    return (
      <FormSuccess title="Thanks for reaching out!" description="Our Corporate Relations Chair will follow up within a few business days.">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            reset();
            setSubmitted(false);
          }}
        >
          Submit another inquiry
        </Button>
      </FormSuccess>
    );
  }

  return (
    <form onSubmit={handleSubmit(() => setSubmitted(true))} className="flex flex-col gap-4" noValidate>
      <Field id="sponsor-name" label="Your name" error={errors.name?.message}>
        <Input {...register("name")} />
      </Field>
      <Field id="sponsor-company" label="Company" error={errors.company?.message}>
        <Input {...register("company")} />
      </Field>
      <Field id="sponsor-email" label="Email" error={errors.email?.message}>
        <Input type="email" {...register("email")} />
      </Field>
      <Field id="sponsor-interest" label="Interest type" error={errors.interestType?.message}>
        <select
          className="min-h-11 w-full rounded-md border border-border-subtle bg-primary/5 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          {...register("interestType")}
        >
          {SPONSOR_INTEREST_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </Field>
      <Field id="sponsor-message" label="Message" error={errors.message?.message}>
        <Textarea rows={4} {...register("message")} />
      </Field>
      <Button type="submit" disabled={isSubmitting}>
        Send inquiry
      </Button>
    </form>
  );
}
```

- [ ] **Step 3: Create `components/forms/contact-form.tsx`**

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
import { contactSchema, type ContactFormValues } from "@/lib/schemas/contact";

export function ContactForm() {
  const [submitted, setSubmitted] = React.useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema) });

  if (submitted) {
    return (
      <FormSuccess title="Message sent" description="Thanks for reaching out — we'll get back to you soon.">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            reset();
            setSubmitted(false);
          }}
        >
          Send another message
        </Button>
      </FormSuccess>
    );
  }

  return (
    <form onSubmit={handleSubmit(() => setSubmitted(true))} className="flex flex-col gap-4" noValidate>
      <Field id="contact-name" label="Name" error={errors.name?.message}>
        <Input {...register("name")} />
      </Field>
      <Field id="contact-email" label="Email" error={errors.email?.message}>
        <Input type="email" {...register("email")} />
      </Field>
      <Field id="contact-subject" label="Subject" error={errors.subject?.message}>
        <Input {...register("subject")} />
      </Field>
      <Field id="contact-message" label="Message" error={errors.message?.message}>
        <Textarea rows={5} {...register("message")} />
      </Field>
      <Button type="submit" disabled={isSubmitting}>
        Send message
      </Button>
    </form>
  );
}
```

- [ ] **Step 4: Create `components/forms/opportunity-submission-form.tsx`**

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

export function OpportunitySubmissionForm() {
  const [submitted, setSubmitted] = React.useState(false);
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

  return (
    <form onSubmit={handleSubmit(() => setSubmitted(true))} className="flex flex-col gap-4" noValidate>
      <Field id="opp-title" label="Title" error={errors.title?.message}>
        <Input {...register("title")} />
      </Field>
      <Field id="opp-company" label="Company / organization" error={errors.company?.message}>
        <Input {...register("company")} />
      </Field>
      <Field id="opp-category" label="Category" error={errors.category?.message}>
        <select
          className="min-h-11 w-full rounded-md border border-border-subtle bg-primary/5 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
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
      <Button type="submit" disabled={isSubmitting}>
        Submit opportunity
      </Button>
    </form>
  );
}
```

- [ ] **Step 5: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add components/forms
git commit -m "Add join, sponsor inquiry, contact, and opportunity submission forms"
```

---

### Task 16: Home page

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `EventCard` (Task 13), `StatCounter` (Task 12), `buttonVariants` (Task 6), `events` (Task 3), `sponsors` (Task 3), `newsPosts` (Task 3), `isUpcoming` (Task 2).

- [ ] **Step 1: Replace `app/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { EventCard } from "@/components/events/event-card";
import { StatCounter } from "@/components/shared/stat-counter";
import { events } from "@/lib/data/events";
import { sponsors } from "@/lib/data/sponsors";
import { newsPosts } from "@/lib/data/news";
import { isUpcoming } from "@/lib/utils/dates";

export const metadata: Metadata = {
  title: "NSBE UTK — National Society of Black Engineers, UT Knoxville",
};

const STATS = [
  { value: 48, label: "Active members this semester" },
  { value: 9, label: "Events hosted this semester" },
  { value: 11, label: "Opportunities posted" },
  { value: 6, label: "Corporate partners" },
] as const;

export default function HomePage() {
  const upcomingEvents = events
    .filter((event) => isUpcoming(event.endsAt))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, 3);

  const spotlight = newsPosts.find((post) => post.slug === "member-spotlight-nsf-grfp");

  return (
    <div className="flex flex-col">
      <section className="bg-primary text-white">
        <div className="mx-auto flex max-w-[1280px] flex-col items-start gap-6 px-6 py-20">
          <h1 className="max-w-2xl text-4xl font-bold sm:text-5xl">
            Building the next generation of Black engineering leaders at UT Knoxville
          </h1>
          <p className="max-w-xl text-lg text-white/80">
            NSBE UTK connects members with events, opportunities, and a community committed to
            academic and professional excellence.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/join" className={buttonVariants({ variant: "primary" })}>
              Join NSBE
            </Link>
            <Link href="/events" className={buttonVariants({ variant: "outlineOnPrimary" })}>
              See upcoming events
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1280px] px-6 py-16">
        <h2 className="text-2xl font-bold text-primary dark:text-secondary">Upcoming events</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
        <div className="mt-8">
          <Link href="/events" className="text-sm font-bold text-primary underline hover:text-secondary dark:text-secondary">
            View all events
          </Link>
        </div>
      </section>

      <section className="bg-secondary/20 py-16">
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-8 px-6 sm:grid-cols-4">
          {STATS.map((stat) => (
            <StatCounter key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </div>
      </section>

      {spotlight ? (
        <section className="mx-auto w-full max-w-[1280px] px-6 py-16">
          <h2 className="text-2xl font-bold text-primary dark:text-secondary">Member spotlight</h2>
          <div className="mt-6 rounded-lg border border-border-subtle bg-surface p-6">
            <p className="text-lg font-bold text-primary dark:text-secondary">{spotlight.title}</p>
            <p className="mt-2 text-sm text-foreground">{spotlight.excerpt}</p>
            <Link
              href={`/news/${spotlight.slug}`}
              className="mt-4 inline-block text-sm font-bold text-primary underline hover:text-secondary dark:text-secondary"
            >
              Read more
            </Link>
          </div>
        </section>
      ) : null}

      <section className="mx-auto w-full max-w-[1280px] px-6 py-16">
        <h2 className="text-2xl font-bold text-primary dark:text-secondary">Our partners</h2>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className="flex h-16 items-center rounded-md border border-border-subtle bg-surface px-6 text-sm font-bold text-primary dark:text-secondary"
            >
              {sponsor.name}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Manually verify in the browser**

Run: `npm run dev`
Visit `http://localhost:3000` — confirm the hero, three upcoming event cards, the animated stat band (scroll to trigger it), the member spotlight card, and the partner strip all render. Click "RSVP" on an event card, submit the dialog form, and confirm the success state with a working "Add to calendar" download. Stop the dev server.

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "Build home page: hero, upcoming events, stats, spotlight, partners"
```

---

### Task 17: About page

**Files:**
- Create: `app/about/page.tsx`

**Interfaces:**
- Consumes: `officers` (Task 3), `getInitials` (Task 1).

- [ ] **Step 1: Create `app/about/page.tsx`**

```tsx
import type { Metadata } from "next";
import { officers } from "@/lib/data/officers";
import { getInitials } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about NSBE UTK's mission, history, and executive board.",
};

const COMMITTEES = ["Programs", "Corporate Relations", "Academic Excellence", "Public Relations & Historian", "Community Service"] as const;

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-16 px-6 py-16">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold text-primary dark:text-secondary sm:text-4xl">About NSBE UTK</h1>
        <p className="mt-4 text-base text-foreground">
          The University of Tennessee, Knoxville chapter of the National Society of Black Engineers
          exists to increase the number of culturally responsible Black engineers who excel
          academically, succeed professionally, and positively impact our community.
        </p>
        <p className="mt-4 text-base text-foreground">
          NSBE UTK has grown into one of the College of Engineering&apos;s most active student
          organizations, hosting professional development workshops, GBMs, social events, and
          community service projects each semester.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary dark:text-secondary">Executive board</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {officers.map((officer) => (
            <div key={officer.id} className="flex items-center gap-4 rounded-lg border border-border-subtle bg-surface p-6">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white dark:bg-secondary dark:text-black">
                {getInitials(officer.name)}
              </div>
              <div>
                <p className="font-bold text-primary dark:text-secondary">{officer.name}</p>
                <p className="text-sm text-caption">{officer.role}</p>
                <p className="text-sm text-caption">
                  {officer.major} · {officer.year}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary dark:text-secondary">Committees</h2>
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {COMMITTEES.map((committee) => (
            <li key={committee} className="rounded-md bg-primary/10 px-4 py-3 text-sm font-medium text-foreground">
              {committee}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Manually verify in the browser**

Run: `npm run dev`
Visit `http://localhost:3000/about` — confirm the mission text, a card per officer with initials avatar, and the committee list render. Stop the dev server.

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/about/page.tsx
git commit -m "Build About page"
```

---

### Task 18: Join NSBE page

**Files:**
- Create: `app/join/page.tsx`

**Interfaces:**
- Consumes: `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` (Task 7); `JoinInterestForm` (Task 15).

- [ ] **Step 1: Create `app/join/page.tsx`**

```tsx
import type { Metadata } from "next";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { JoinInterestForm } from "@/components/forms/join-interest-form";

export const metadata: Metadata = {
  title: "Join NSBE",
  description: "How to join NSBE UTK: national and local membership, benefits, and FAQ.",
};

const BENEFITS = [
  "Access to national NSBE conferences, career fairs, and scholarships",
  "Mentorship from upperclassmen and alumni in your major",
  "Resume reviews, mock interviews, and technical workshops",
  "A built-in community of Black engineering students at UTK",
];

const FAQS = [
  {
    question: "Do I need to be a Black or African American student to join?",
    answer:
      "No. NSBE welcomes members of all backgrounds who support our mission of increasing the number of culturally responsible Black engineers who excel academically, succeed professionally, and positively impact the community.",
  },
  {
    question: "What's the difference between national and local membership?",
    answer:
      "National membership is paid directly to NSBE National and unlocks conferences, scholarships, and the national job board. Local (chapter) membership covers UTK chapter events and is required to earn points toward stole eligibility.",
  },
  {
    question: "Is there a minimum GPA to join?",
    answer: "No minimum GPA is required to join. Some scholarships and opportunities posted through the chapter may have their own eligibility requirements.",
  },
  {
    question: "How do I earn a graduation stole?",
    answer:
      "Members earn points by attending GBMs, socials, volunteer events, study halls, conferences, and professional development events throughout the year. Reach 250 points to become stole-eligible.",
  },
];

export default function JoinPage() {
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-16 px-6 py-16">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold text-primary dark:text-secondary sm:text-4xl">Join NSBE UTK</h1>
        <p className="mt-4 text-base text-foreground">
          Joining NSBE UTK starts with national membership through NSBE National, then getting
          involved at the chapter level here at UTK.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary dark:text-secondary">Member benefits</h2>
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="rounded-md bg-primary/10 px-4 py-3 text-sm text-foreground">
              {benefit}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary dark:text-secondary">FAQ</h2>
        <Accordion type="single" collapsible className="mt-6 max-w-3xl">
          {FAQS.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="max-w-xl">
        <h2 className="text-2xl font-bold text-primary dark:text-secondary">Interest form</h2>
        <p className="mt-2 text-sm text-caption">Tell us a bit about yourself and an officer will reach out with next steps.</p>
        <div className="mt-6">
          <JoinInterestForm />
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Manually verify in the browser**

Run: `npm run dev`
Visit `http://localhost:3000/join` — confirm benefits list, FAQ accordion (click to expand/collapse), and the interest form render. Submit the form with valid data and confirm the success state. Stop the dev server.

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/join/page.tsx
git commit -m "Build Join NSBE page"
```

---

### Task 19: Events page

**Files:**
- Create: `app/events/page.tsx`

**Interfaces:**
- Consumes: `EventCard` (Task 13), `events` (Task 3), `isUpcoming` (Task 2).

- [ ] **Step 1: Create `app/events/page.tsx`**

```tsx
import type { Metadata } from "next";
import { EventCard } from "@/components/events/event-card";
import { events } from "@/lib/data/events";
import { isUpcoming } from "@/lib/utils/dates";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming and past NSBE UTK events, RSVPs, and points earned per event.",
};

export default function EventsPage() {
  const upcoming = events.filter((event) => isUpcoming(event.endsAt)).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const past = events.filter((event) => !isUpcoming(event.endsAt)).sort((a, b) => b.startsAt.localeCompare(a.startsAt));

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-16 px-6 py-16">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold text-primary dark:text-secondary sm:text-4xl">Events</h1>
        <p className="mt-4 text-base text-foreground">
          RSVP to upcoming events and add them to your calendar. Attendance is tracked toward
          stole eligibility once QR check-in launches.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary dark:text-secondary">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="mt-6 text-sm text-caption">No upcoming events posted yet — check back soon.</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 ? (
        <section>
          <h2 className="text-2xl font-bold text-primary dark:text-secondary">Past events</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {past.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Manually verify in the browser**

Run: `npm run dev`
Visit `http://localhost:3000/events` — confirm upcoming events show an RSVP button and the past event shows "This event has passed" with no RSVP button. Stop the dev server.

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/events/page.tsx
git commit -m "Build Events page"
```

---

### Task 20: Opportunities page

**Files:**
- Create: `app/opportunities/page.tsx`

**Interfaces:**
- Consumes: `OpportunitiesBrowser` (Task 14), `OpportunitySubmissionForm` (Task 15), `opportunities` (Task 3).

- [ ] **Step 1: Create `app/opportunities/page.tsx`**

```tsx
import type { Metadata } from "next";
import { OpportunitiesBrowser } from "@/components/opportunities/opportunities-browser";
import { OpportunitySubmissionForm } from "@/components/forms/opportunity-submission-form";
import { opportunities } from "@/lib/data/opportunities";

export const metadata: Metadata = {
  title: "Opportunities",
  description: "Internships, scholarships, research, and more submitted by the NSBE UTK community.",
};

export default function OpportunitiesPage() {
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

- [ ] **Step 2: Manually verify in the browser**

Run: `npm run dev`
Visit `http://localhost:3000/opportunities` — type into the search box and confirm results filter live; change the category select and confirm results filter; confirm a deadline within the next 7 days (if any, relative to today) renders in red. Submit the opportunity form and confirm the success state. Stop the dev server.

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/opportunities/page.tsx
git commit -m "Build Opportunities page"
```

---

### Task 21: Corporate Partners page

**Files:**
- Create: `app/partners/page.tsx`

**Interfaces:**
- Consumes: `Badge` (Task 6), `sponsors`, `SponsorTier`, `SPONSOR_TIERS` (Task 3), `SponsorInquiryForm` (Task 15).

- [ ] **Step 1: Create `app/partners/page.tsx`**

```tsx
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { sponsors, SPONSOR_TIERS } from "@/lib/data/sponsors";
import { SponsorInquiryForm } from "@/components/forms/sponsor-inquiry-form";

export const metadata: Metadata = {
  title: "Corporate Partners",
  description: "NSBE UTK sponsor tiers, partnership packet, and sponsor inquiry form.",
};

export default function PartnersPage() {
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-16 px-6 py-16">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold text-primary dark:text-secondary sm:text-4xl">Corporate Partners</h1>
        <p className="mt-4 text-base text-foreground">
          Our corporate partners make NSBE UTK&apos;s programming possible. Partner with us to
          connect your organization with talented Black engineering students at UT Knoxville.
        </p>
        <a
          href="https://example.com"
          className="mt-4 inline-block text-sm font-bold text-primary underline hover:text-secondary dark:text-secondary"
        >
          Download partnership packet (PDF)
        </a>
      </section>

      {SPONSOR_TIERS.map((tier) => {
        const tierSponsors = sponsors.filter((sponsor) => sponsor.tier === tier);
        if (tierSponsors.length === 0) return null;

        return (
          <section key={tier}>
            <h2 className="text-2xl font-bold text-primary dark:text-secondary">{tier} partners</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tierSponsors.map((sponsor) => (
                <a
                  key={sponsor.id}
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-surface p-6 transition-colors hover:border-secondary"
                >
                  <Badge variant="primary">{sponsor.tier}</Badge>
                  <p className="text-lg font-bold text-primary dark:text-secondary">{sponsor.name}</p>
                  <p className="text-sm text-foreground">{sponsor.description}</p>
                </a>
              ))}
            </div>
          </section>
        );
      })}

      <section className="max-w-xl">
        <h2 className="text-2xl font-bold text-primary dark:text-secondary">Sponsor inquiry</h2>
        <p className="mt-2 text-sm text-caption">
          Interested in sponsoring NSBE UTK? Send us a message and our Corporate Relations Chair
          will follow up.
        </p>
        <div className="mt-6">
          <SponsorInquiryForm />
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Manually verify in the browser**

Run: `npm run dev`
Visit `http://localhost:3000/partners` — confirm Gold/Silver/Bronze sections render with the right sponsors, and the inquiry form works end-to-end (submit → success state). Stop the dev server.

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/partners/page.tsx
git commit -m "Build Corporate Partners page"
```

---

### Task 22: Resources page

**Files:**
- Create: `app/resources/page.tsx`

**Interfaces:**
- Consumes: `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` (Task 7).

- [ ] **Step 1: Create `app/resources/page.tsx`**

```tsx
import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Resources",
  description: "Chapter documents: constitution, bylaws, resume templates, and more.",
};

type ResourceFile = {
  name: string;
  updatedAt: string;
  sizeLabel: string;
};

const RESOURCE_FOLDERS: { name: string; files: ResourceFile[] }[] = [
  {
    name: "General Members",
    files: [
      { name: "NSBE UTK Constitution.pdf", updatedAt: "August 2026", sizeLabel: "412 KB" },
      { name: "NSBE UTK Bylaws.pdf", updatedAt: "August 2026", sizeLabel: "298 KB" },
      { name: "Member Handbook.pdf", updatedAt: "August 2026", sizeLabel: "1.1 MB" },
    ],
  },
  {
    name: "Professional Development",
    files: [
      { name: "Resume Template.docx", updatedAt: "July 2026", sizeLabel: "54 KB" },
      { name: "Interview Prep Guide.pdf", updatedAt: "July 2026", sizeLabel: "680 KB" },
      { name: "LinkedIn Optimization Guide.pdf", updatedAt: "July 2026", sizeLabel: "520 KB" },
    ],
  },
  {
    name: "Conference",
    files: [
      { name: "National Convention Guide.pdf", updatedAt: "June 2026", sizeLabel: "890 KB" },
      { name: "Travel Reimbursement Form.pdf", updatedAt: "June 2026", sizeLabel: "210 KB" },
      { name: "Conference Funding Application.pdf", updatedAt: "June 2026", sizeLabel: "180 KB" },
    ],
  },
  {
    name: "Officer Resources",
    files: [
      { name: "Officer Transition Guide.pdf", updatedAt: "May 2026", sizeLabel: "1.4 MB" },
      { name: "Meeting Minutes Template.docx", updatedAt: "May 2026", sizeLabel: "38 KB" },
      { name: "Chapter Budget Template.xlsx", updatedAt: "May 2026", sizeLabel: "62 KB" },
    ],
  },
  {
    name: "Sponsors",
    files: [
      { name: "Partnership Packet.pdf", updatedAt: "July 2026", sizeLabel: "2.2 MB" },
      { name: "Sponsor One-Pager.pdf", updatedAt: "July 2026", sizeLabel: "410 KB" },
      { name: "Chapter Logo Assets.zip", updatedAt: "July 2026", sizeLabel: "3.8 MB" },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 py-16">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold text-primary dark:text-secondary sm:text-4xl">Resources</h1>
        <p className="mt-4 text-base text-foreground">
          Chapter documents, organized the same way they&apos;re stored in Microsoft Teams. In a
          later phase these will pull live from SharePoint via Microsoft Graph — for now, sample
          files below show the structure.
        </p>
      </section>

      <Accordion type="multiple" className="max-w-3xl">
        {RESOURCE_FOLDERS.map((folder) => (
          <AccordionItem key={folder.name} value={folder.name}>
            <AccordionTrigger>{folder.name}</AccordionTrigger>
            <AccordionContent>
              <ul className="flex flex-col gap-3">
                {folder.files.map((file) => (
                  <li key={file.name} className="flex items-center justify-between gap-4 rounded-md bg-primary/5 px-4 py-3">
                    <span className="flex items-center gap-3 text-sm text-foreground">
                      <FileText className="size-4 shrink-0 text-primary dark:text-secondary" aria-hidden="true" />
                      {file.name}
                    </span>
                    <span className="shrink-0 text-xs text-caption">
                      {file.updatedAt} · {file.sizeLabel}
                    </span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
```

- [ ] **Step 2: Manually verify in the browser**

Run: `npm run dev`
Visit `http://localhost:3000/resources` — confirm all five folders expand/collapse and list their sample files. Stop the dev server.

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/resources/page.tsx
git commit -m "Build Resources page"
```

---

### Task 23: Gallery page

**Files:**
- Create: `app/gallery/page.tsx`

**Interfaces:** None (static page, no shared component dependencies beyond `lucide-react`).

- [ ] **Step 1: Create `app/gallery/page.tsx`**

```tsx
import type { Metadata } from "next";
import { ImageIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos from NSBE UTK events and conferences.",
};

const GALLERY_ITEMS = [
  "Fall Kickoff GBM",
  "Resume & LinkedIn Workshop",
  "Habitat for Humanity Build Day",
  "Career Fair Prep Social",
  "NSBE Fall Regional Conference",
  "Spring Study Hall Series",
] as const;

export default function GalleryPage() {
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 py-16">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold text-primary dark:text-secondary sm:text-4xl">Gallery</h1>
        <p className="mt-4 text-base text-foreground">
          Photos and videos from past NSBE UTK events. Officers will add real event photos here
          after each event.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {GALLERY_ITEMS.map((caption) => (
          <figure
            key={caption}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-subtle bg-primary/5 p-4 text-center"
          >
            <ImageIcon className="size-8 text-caption" aria-hidden="true" />
            <figcaption className="text-xs text-caption">{caption}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Manually verify in the browser**

Run: `npm run dev`
Visit `http://localhost:3000/gallery` — confirm the placeholder photo grid renders and reflows at narrower widths. Stop the dev server.

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/gallery/page.tsx
git commit -m "Build Gallery page"
```

---

### Task 24: News list and detail pages

**Files:**
- Create: `app/news/page.tsx`
- Create: `app/news/[slug]/page.tsx`

**Interfaces:**
- Consumes: `newsPosts`, `NewsPost` (Task 3); `formatDate` (Task 2).

- [ ] **Step 1: Create `app/news/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { newsPosts } from "@/lib/data/news";
import { formatDate } from "@/lib/utils/dates";

export const metadata: Metadata = {
  title: "News",
  description: "Announcements, member spotlights, and recap posts from NSBE UTK.",
};

export default function NewsPage() {
  const posts = [...newsPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 py-16">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold text-primary dark:text-secondary sm:text-4xl">News</h1>
        <p className="mt-4 text-base text-foreground">Announcements and stories from the chapter.</p>
      </section>

      <div className="flex flex-col divide-y divide-border-subtle">
        {posts.map((post) => (
          <article key={post.slug} className="flex flex-col gap-2 py-6">
            <p className="text-xs text-caption">
              {formatDate(post.publishedAt)} · {post.author}
            </p>
            <h2 className="text-xl font-bold text-primary dark:text-secondary">
              <Link href={`/news/${post.slug}`} className="hover:text-secondary dark:hover:text-white">
                {post.title}
              </Link>
            </h2>
            <p className="text-sm text-foreground">{post.excerpt}</p>
            <Link href={`/news/${post.slug}`} className="text-sm font-bold text-primary underline hover:text-secondary dark:text-secondary">
              Read more
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/news/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { newsPosts } from "@/lib/data/news";
import { formatDate } from "@/lib/utils/dates";

type NewsPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return newsPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: NewsPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = newsPosts.find((item) => item.slug === slug);

  if (!post) {
    return { title: "Post not found" };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function NewsPostPage({ params }: NewsPostPageProps) {
  const { slug } = await params;
  const post = newsPosts.find((item) => item.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16">
      <div>
        <p className="text-xs text-caption">
          {formatDate(post.publishedAt)} · {post.author}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-primary dark:text-secondary sm:text-4xl">{post.title}</h1>
      </div>
      <div className="flex flex-col gap-4 text-base text-foreground">
        {post.body.split("\n\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
```

- [ ] **Step 3: Manually verify in the browser**

Run: `npm run dev`
Visit `http://localhost:3000/news` — confirm all posts list, newest first. Click "Read more" on one and confirm the detail page renders its full body. Visit `http://localhost:3000/news/does-not-exist` and confirm the default Next.js not-found page renders. Stop the dev server.

- [ ] **Step 4: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add app/news
git commit -m "Build News list and detail pages"
```

---

### Task 25: Contact page

**Files:**
- Create: `app/contact/page.tsx`

**Interfaces:**
- Consumes: `ContactForm` (Task 15).

- [ ] **Step 1: Create `app/contact/page.tsx`**

```tsx
import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with NSBE UTK officers and find our social links.",
};

const OFFICER_CONTACTS = [
  { role: "President", email: "nsbe-president@utk.edu" },
  { role: "Corporate Relations Chair", email: "nsbe-corporate@utk.edu" },
  { role: "General inquiries", email: "nsbe@utk.edu" },
] as const;

export default function ContactPage() {
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-16 px-6 py-16 lg:flex-row lg:gap-24">
      <section className="max-w-xl flex-1">
        <h1 className="text-3xl font-bold text-primary dark:text-secondary sm:text-4xl">Contact</h1>
        <p className="mt-4 text-base text-foreground">
          Have a question, sponsorship interest, or general inquiry? Send us a message or reach
          out directly.
        </p>

        <ul className="mt-8 flex flex-col gap-3">
          {OFFICER_CONTACTS.map((contact) => (
            <li key={contact.role} className="flex flex-col">
              <span className="text-sm font-bold text-foreground">{contact.role}</span>
              <a href={`mailto:${contact.email}`} className="text-sm text-primary underline hover:text-secondary dark:text-secondary">
                {contact.email}
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex gap-4">
          <a href="https://example.com" className="text-sm font-bold text-primary underline hover:text-secondary dark:text-secondary">
            Instagram
          </a>
          <a href="https://example.com" className="text-sm font-bold text-primary underline hover:text-secondary dark:text-secondary">
            LinkedIn
          </a>
        </div>
      </section>

      <section className="max-w-xl flex-1">
        <ContactForm />
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Manually verify in the browser**

Run: `npm run dev`
Visit `http://localhost:3000/contact` — confirm officer contact links and the contact form render, and submitting the form shows the success state. Stop the dev server.

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/contact/page.tsx
git commit -m "Build Contact page"
```

---

### Task 26: Final verification pass

**Files:**
- Modify: `README.md`
- Delete: `public/next.svg`, `public/vercel.svg`, `public/file.svg`, `public/globe.svg`, `public/window.svg` (unused starter assets)

**Interfaces:** None — this task verifies the whole site, not a new unit.

- [ ] **Step 1: Remove unused starter assets**

Run: `git rm public/next.svg public/vercel.svg public/file.svg public/globe.svg public/window.svg`

- [ ] **Step 2: Full verification suite**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no errors or warnings.

Run: `npm run test`
Expected: all Vitest suites pass (dates, ics, schemas, opportunities-filter).

Run: `npm run build`
Expected: production build succeeds with no errors, all 12 routes (`/`, `/about`, `/join`, `/events`, `/opportunities`, `/partners`, `/resources`, `/gallery`, `/news`, `/news/[slug]` × 4 static params, `/contact`) listed in the build output.

- [ ] **Step 3: Full manual walkthrough**

Run: `npm run build && npm run start`
Visit every route listed above in the browser. For each: confirm it renders with no console errors, confirm the header/footer/nav are present, and toggle dark mode once per page to confirm no unstyled/invisible text. Resize to a 375px-wide viewport and confirm the mobile nav and all card grids reflow to a single column. Stop the server.

- [ ] **Step 4: Update `README.md`**

Replace the default `create-next-app` README content with:

```markdown
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
```

- [ ] **Step 5: Commit**

```bash
git add README.md public
git commit -m "Remove unused starter assets, update README for Phase 1 site"
```
