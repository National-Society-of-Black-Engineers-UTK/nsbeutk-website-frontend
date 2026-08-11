import { describe, expect, it } from "vitest";
import { buildDigestMessage, buildSingleOpportunityMessage } from "./groupme-messages";

const sampleOpportunity = {
  title: "Software Engineering Intern",
  company: "Meridian Systems",
  deadline: "2026-09-15T00:00:00Z",
  url: "https://example.com",
};

describe("buildSingleOpportunityMessage", () => {
  it("formats a single opportunity announcement", () => {
    const message = buildSingleOpportunityMessage(sampleOpportunity);

    expect(message).toBe(
      "📢 New Opportunity\n" +
        "💼 Software Engineering Intern — Meridian Systems\n" +
        "📅 Deadline: September 15, 2026\n" +
        "🔗 https://example.com\n" +
        "Submit yours: nsbeutk.org/opportunities/submit"
    );
  });
});

describe("buildDigestMessage", () => {
  it("formats multiple opportunities into one digest", () => {
    const message = buildDigestMessage([
      sampleOpportunity,
      {
        title: "GEM Fellowship",
        company: "The GEM Consortium",
        deadline: "2026-11-15T00:00:00Z",
        url: "https://example.com/gem",
      },
    ]);

    expect(message).toBe(
      "📢 Opportunities Digest\n" +
        "💼 Software Engineering Intern — Meridian Systems\n📅 Deadline: September 15, 2026\n🔗 https://example.com\n\n" +
        "💼 GEM Fellowship — The GEM Consortium\n📅 Deadline: November 15, 2026\n🔗 https://example.com/gem\n\n" +
        "View all: nsbeutk.org/opportunities"
    );
  });
});
