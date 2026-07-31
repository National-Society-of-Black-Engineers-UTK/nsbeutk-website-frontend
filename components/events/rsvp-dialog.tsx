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
