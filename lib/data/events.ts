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
