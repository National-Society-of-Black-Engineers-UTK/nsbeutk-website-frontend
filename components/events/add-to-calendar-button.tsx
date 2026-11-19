"use client";

import { Button } from "@/components/ui/button";
import { buildIcsContent, downloadIcs } from "@/lib/utils/ics";
import type { NsbeEvent } from "@/lib/data/events";

export function AddToCalendarButton({ event }: { event: NsbeEvent }) {

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
    <Button type="button" variant="secondary" onClick={handleAddToCalendar}>
      Add to calendar
    </Button>
  );
}
