import type { Metadata } from "next";
import { chapter } from "@/lib/data/chapter";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { EventCard } from "@/components/events/event-card";
import { StatCounter } from "@/components/shared/stat-counter";
import { isUpcoming } from "@/lib/utils/dates";

export const metadata: Metadata = {
  title: "NSBE UTK — National Society of Black Engineers, UT Knoxville",
  openGraph: {
    title: "NSBE UTK — National Society of Black Engineers, UT Knoxville",
  },
};

export default function HomePage() {
  const { events, sponsors, newsPosts, stats, spotlightSlug } = chapter;
  const upcomingEvents = events
    .filter((event) => isUpcoming(event.endsAt))
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
    .slice(0, 3);

  const spotlight = newsPosts.find((post) => post.slug === spotlightSlug);

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
            {upcomingEvents.length > 0 ? (
              <Link href="/events" className={buttonVariants({ variant: "outlineOnPrimary" })}>
                See upcoming events
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {upcomingEvents.length > 0 ? (
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
      ) : null}

      {stats.length > 0 ? (
        <section className="bg-secondary/20 py-16">
          <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-8 px-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <StatCounter key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>
        </section>
      ) : null}

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

      {sponsors.length > 0 ? (
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
      ) : null}
    </div>
  );
}
