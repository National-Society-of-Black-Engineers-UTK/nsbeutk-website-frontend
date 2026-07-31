import { describe, expect, it } from "vitest";
import { rsvpSchema } from "./rsvp";
import { joinInterestSchema } from "./join-interest";
import { sponsorInquirySchema } from "./sponsor-inquiry";
import { contactSchema } from "./contact";
import { opportunitySubmissionSchema } from "./opportunity-submission";

describe("rsvpSchema", () => {
  it("accepts a valid RSVP", () => {
    expect(rsvpSchema.safeParse({ name: "Jordan Williams", email: "jordan@example.com" }).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(rsvpSchema.safeParse({ name: "Jordan Williams", email: "not-an-email" }).success).toBe(false);
  });
});

describe("joinInterestSchema", () => {
  it("accepts a valid submission without the optional message", () => {
    const result = joinInterestSchema.safeParse({
      name: "Amara Chen",
      email: "amara@example.com",
      major: "Computer Science",
      gradYear: "2028",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-4-digit graduation year", () => {
    const result = joinInterestSchema.safeParse({
      name: "Amara Chen",
      email: "amara@example.com",
      major: "Computer Science",
      gradYear: "28",
    });
    expect(result.success).toBe(false);
  });
});

describe("sponsorInquirySchema", () => {
  it("accepts a valid inquiry", () => {
    const result = sponsorInquirySchema.safeParse({
      name: "Taylor Reed",
      company: "Example Corp",
      interestType: "Sponsorship",
      email: "taylor@example.com",
      message: "We'd like to learn more about sponsoring an event.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an interest type outside the enum", () => {
    const result = sponsorInquirySchema.safeParse({
      name: "Taylor Reed",
      company: "Example Corp",
      interestType: "Other Thing",
      email: "taylor@example.com",
      message: "We'd like to learn more about sponsoring an event.",
    });
    expect(result.success).toBe(false);
  });
});

describe("contactSchema", () => {
  it("accepts a valid message", () => {
    const result = contactSchema.safeParse({
      name: "Sam Lee",
      email: "sam@example.com",
      subject: "Question about events",
      message: "When is the next GBM?",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a message that's too short", () => {
    const result = contactSchema.safeParse({
      name: "Sam Lee",
      email: "sam@example.com",
      subject: "Hi",
      message: "?",
    });
    expect(result.success).toBe(false);
  });
});

describe("opportunitySubmissionSchema", () => {
  it("accepts a valid submission", () => {
    const result = opportunitySubmissionSchema.safeParse({
      title: "Data Analyst Intern",
      company: "Example Corp",
      category: "Internship",
      deadline: "2026-12-01",
      eligibility: "Sophomore or above",
      description: "A summer internship on the analytics team.",
      url: "https://example.com",
      submitterName: "Jordan Williams",
      submitterEmail: "jordan@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid apply URL", () => {
    const result = opportunitySubmissionSchema.safeParse({
      title: "Data Analyst Intern",
      company: "Example Corp",
      category: "Internship",
      deadline: "2026-12-01",
      eligibility: "Sophomore or above",
      description: "A summer internship on the analytics team.",
      url: "not-a-url",
      submitterName: "Jordan Williams",
      submitterEmail: "jordan@example.com",
    });
    expect(result.success).toBe(false);
  });
});
