import { describe, expect, it } from "vitest";
import { buildOpportunityInsertPayload } from "./opportunities-payload";

describe("buildOpportunityInsertPayload", () => {
  it("maps form values to the opportunities table's column names", () => {
    const payload = buildOpportunityInsertPayload({
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

    expect(payload).toEqual({
      title: "Data Analyst Intern",
      company: "Example Corp",
      category: "Internship",
      deadline: "2026-12-01",
      eligibility: "Sophomore or above",
      description: "A summer internship on the analytics team.",
      url: "https://example.com",
      submitted_by_name: "Jordan Williams",
      submitted_by_email: "jordan@example.com",
      status: "pending",
    });
  });
});
