import { describe, expect, it } from "vitest";
import { formatDate, isDeadlineSoon, isUpcoming } from "./dates";

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
