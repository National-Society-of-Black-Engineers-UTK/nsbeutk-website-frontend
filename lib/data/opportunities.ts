export const OPPORTUNITY_CATEGORIES = [
  "Internship",
  "Full-Time",
  "Scholarship",
  "Research",
  "Hackathon",
  "Conference",
  "Graduate School",
  "Leadership",
  "Volunteer",
  "Career Fair",
  "Study Session",
] as const;

export type OpportunityCategory = (typeof OPPORTUNITY_CATEGORIES)[number];

export type Opportunity = {
  id: string;
  title: string;
  company: string;
  category: OpportunityCategory;
  deadline: string;
  eligibility: string;
  description: string;
  url: string;
};
