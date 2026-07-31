import type { Metadata } from "next";
import { EventCard } from "@/components/events/event-card";
import { events } from "@/lib/data/events";
import { isUpcoming } from "@/lib/utils/dates";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming and past NSBE UTK events, RSVPs, and points earned per event.",
  openGraph: {
    title: "Events",
    description: "Upcoming and past NSBE UTK events, RSVPs, and points earned per event.",
  },
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
