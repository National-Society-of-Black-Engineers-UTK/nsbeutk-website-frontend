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
