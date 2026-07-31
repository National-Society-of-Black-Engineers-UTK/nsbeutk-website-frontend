import { describe, expect, it } from "vitest";
import { filterOpportunities } from "./opportunities-filter";
import type { Opportunity } from "@/lib/data/opportunities";

const FIXTURES: Opportunity[] = [
  {
    id: "1",
    title: "Software Engineering Intern",
    company: "Meridian Systems",
    category: "Internship",
    deadline: "2026-09-15T00:00:00Z",
    eligibility: "Sophomore or above",
    description: "Summer internship on the platform team.",
    url: "https://example.com",
  },
  {
    id: "2",
    title: "GEM Fellowship",
    company: "The GEM Consortium",
    category: "Graduate School",
    deadline: "2026-11-15T00:00:00Z",
    eligibility: "Seniors",
    description: "Full funding for graduate study.",
    url: "https://example.com",
  },
  {
    id: "3",
    title: "Circuits Study Session",
    company: "NSBE UTK Academic Excellence Committee",
    category: "Study Session",
    deadline: "2026-09-30T00:00:00Z",
    eligibility: "Any member",
    description: "Peer-led review ahead of the midterm.",
    url: "https://example.com",
  },
];

describe("filterOpportunities", () => {
  it("returns everything when category is All and query is empty", () => {
    expect(filterOpportunities(FIXTURES, { category: "All", query: "" })).toHaveLength(3);
  });

  it("filters by category", () => {
    const result = filterOpportunities(FIXTURES, { category: "Internship", query: "" });
    expect(result.map((o) => o.id)).toEqual(["1"]);
  });

  it("filters by keyword in the title", () => {
    const result = filterOpportunities(FIXTURES, { category: "All", query: "fellowship" });
    expect(result.map((o) => o.id)).toEqual(["2"]);
  });

  it("filters by keyword in the company, case-insensitively", () => {
    const result = filterOpportunities(FIXTURES, { category: "All", query: "meridian" });
    expect(result.map((o) => o.id)).toEqual(["1"]);
  });

  it("combines category and keyword filters", () => {
    const result = filterOpportunities(FIXTURES, { category: "Study Session", query: "midterm" });
    expect(result.map((o) => o.id)).toEqual(["3"]);
  });

  it("returns an empty array when nothing matches", () => {
    const result = filterOpportunities(FIXTURES, { category: "All", query: "nonexistent" });
    expect(result).toHaveLength(0);
  });
});
