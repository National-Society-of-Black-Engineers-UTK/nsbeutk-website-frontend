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
