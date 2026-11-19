const CHAPTER_TIME_ZONE = "America/New_York";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const EVENT_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: CHAPTER_TIME_ZONE,
});

const TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: CHAPTER_TIME_ZONE,
  timeZoneName: "short",
});

const DEADLINE_DATE_FORMATTER = new Intl.DateTimeFormat("sv-SE", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: CHAPTER_TIME_ZONE,
});

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function formatDate(iso: string): string {
  return DATE_FORMATTER.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return `${EVENT_DATE_FORMATTER.format(date)} · ${TIME_FORMATTER.format(date)}`;
}

// Date-only opportunity deadlines are stored as midnight UTC. Use the chapter's
// current calendar date with the same encoding to include the entire deadline day.
export function opportunityDeadlineCutoff(now: Date = new Date()): string {
  return `${DEADLINE_DATE_FORMATTER.format(now)}T00:00:00.000Z`;
}

export function isUpcoming(iso: string, now: Date = new Date()): boolean {
  return new Date(iso).getTime() >= now.getTime();
}

export function isDeadlineSoon(iso: string, now: Date = new Date()): boolean {
  const deadline = new Date(iso).getTime();
  const nowMs = now.getTime();
  return deadline >= nowMs && deadline - nowMs <= SEVEN_DAYS_MS;
}
