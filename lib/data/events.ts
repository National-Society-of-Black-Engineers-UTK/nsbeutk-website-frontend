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
  volinkUrl?: string;
};
