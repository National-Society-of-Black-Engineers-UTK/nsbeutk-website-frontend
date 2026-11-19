import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime, isDeadlineSoon, isUpcoming, opportunityDeadlineCutoff } from "./dates";

describe("formatDate", () => {
  it("formats an ISO date as a long-form US date", () => {
    expect(formatDate("2026-08-27T18:00:00Z")).toBe("August 27, 2026");
  });
});

describe("isUpcoming", () => {
  it("returns true for a date after now", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    expect(isUpcoming("2026-02-01T00:00:00Z", now)).toBe(true);
  });

  it("returns false for a date before now", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    expect(isUpcoming("2025-12-01T00:00:00Z", now)).toBe(false);
  });
});

describe("isDeadlineSoon", () => {
  const now = new Date("2026-01-01T00:00:00Z");

  it("returns true for a deadline 3 days away", () => {
    expect(isDeadlineSoon("2026-01-04T00:00:00Z", now)).toBe(true);
  });

  it("returns false for a deadline 10 days away", () => {
    expect(isDeadlineSoon("2026-01-11T00:00:00Z", now)).toBe(false);
  });

  it("returns false for a deadline that already passed", () => {
    expect(isDeadlineSoon("2025-12-30T00:00:00Z", now)).toBe(false);
  });
});

describe("formatDateTime", () => {
  it("shows Eastern daylight time and the local date across UTC midnight", () => {
    expect(formatDateTime("2026-08-28T01:00:00Z")).toBe("August 27, 2026 · 9:00 PM EDT");
  });

  it("shows Eastern standard time in winter", () => {
    expect(formatDateTime("2026-01-10T23:00:00Z")).toBe("January 10, 2026 · 6:00 PM EST");
  });
});

describe("opportunityDeadlineCutoff", () => {
  it("keeps same-day deadlines active until midnight in Knoxville", () => {
    expect(opportunityDeadlineCutoff(new Date("2026-08-28T03:59:59Z"))).toBe("2026-08-27T00:00:00.000Z");
    expect(opportunityDeadlineCutoff(new Date("2026-08-28T04:00:00Z"))).toBe("2026-08-28T00:00:00.000Z");
  });
});
