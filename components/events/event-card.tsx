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
