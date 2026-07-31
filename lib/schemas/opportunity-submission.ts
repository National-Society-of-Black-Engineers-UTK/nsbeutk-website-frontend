import { z } from "zod";
import { OPPORTUNITY_CATEGORIES } from "@/lib/data/opportunities";

export const opportunitySubmissionSchema = z.object({
  title: z.string().min(3, "Enter a title."),
  company: z.string().min(2, "Enter a company or organization."),
  category: z.enum(OPPORTUNITY_CATEGORIES),
  deadline: z.string().min(1, "Select a deadline."),
  eligibility: z.string().min(2, "Describe eligibility requirements."),
  description: z.string().min(10, "Add a short description."),
  url: z.string().url("Enter a valid URL."),
  submitterName: z.string().min(2, "Enter your name."),
  submitterEmail: z.string().email("Enter a valid email address."),
});

export type OpportunitySubmissionFormValues = z.infer<typeof opportunitySubmissionSchema>;
