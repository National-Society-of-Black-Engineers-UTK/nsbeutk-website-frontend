export type IcsEventInput = {
  uid: string;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
};

function toIcsUtcTimestamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\r\n|\r|\n/g, "\\n");
}

export function buildIcsContent(event: IcsEventInput): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NSBE UTK//Website//EN",
    "BEGIN:VEVENT",
    `UID:${event.uid}@nsbeutk.org`,
    `DTSTAMP:${toIcsUtcTimestamp(new Date().toISOString())}`,
    `DTSTART:${toIcsUtcTimestamp(event.startsAt)}`,
    `DTEND:${toIcsUtcTimestamp(event.endsAt)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

export function downloadIcs(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
