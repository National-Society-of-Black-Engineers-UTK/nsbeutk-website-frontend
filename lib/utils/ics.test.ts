import { describe, expect, it } from "vitest";
import { buildIcsContent } from "./ics";

describe("buildIcsContent", () => {
  it("includes required VEVENT fields", () => {
    const content = buildIcsContent({
      uid: "fall-kickoff-gbm",
      title: "Fall Kickoff GBM",
      description: "First GBM of the semester.",
      location: "Student Union, Room 262",
      startsAt: "2026-08-27T18:00:00Z",
      endsAt: "2026-08-27T19:00:00Z",
    });

    expect(content).toContain("BEGIN:VCALENDAR");
    expect(content).toContain("BEGIN:VEVENT");
    expect(content).toContain("SUMMARY:Fall Kickoff GBM");
    expect(content).toContain("UID:fall-kickoff-gbm@nsbeutk.org");
    expect(content).toContain("DTSTART:20260827T180000");
    expect(content).toContain("DTEND:20260827T190000");
    expect(content).toContain("END:VEVENT");
    expect(content).toContain("END:VCALENDAR");
  });

  it("escapes commas and semicolons in text fields", () => {
    const content = buildIcsContent({
      uid: "test",
      title: "Workshop: Resumes, LinkedIn, & More",
      description: "Bring a laptop; bring questions.",
      location: "Room 1",
      startsAt: "2026-08-27T18:00:00Z",
      endsAt: "2026-08-27T19:00:00Z",
    });

    expect(content).toContain("SUMMARY:Workshop: Resumes\\, LinkedIn\\, & More");
    expect(content).toContain("DESCRIPTION:Bring a laptop\\; bring questions.");
  });
});
