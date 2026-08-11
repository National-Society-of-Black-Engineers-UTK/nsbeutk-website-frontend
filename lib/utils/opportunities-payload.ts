import type { OpportunitySubmissionFormValues } from "@/lib/schemas/opportunity-submission";

export type OpportunityInsertPayload = {
  title: string;
  company: string;
  category: string;
  deadline: string;
  eligibility: string;
  description: string;
  url: string;
  submitted_by_name: string;
  submitted_by_email: string;
  status: "pending";
};

export function buildOpportunityInsertPayload(
  values: OpportunitySubmissionFormValues
): OpportunityInsertPayload {
  return {
    title: values.title,
    company: values.company,
    category: values.category,
    deadline: values.deadline,
    eligibility: values.eligibility,
    description: values.description,
    url: values.url,
    submitted_by_name: values.submitterName,
    submitted_by_email: values.submitterEmail,
    status: "pending",
  };
}
