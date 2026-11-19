import { z } from "zod";
import { OPPORTUNITY_CATEGORIES } from "@/lib/data/opportunities";

export const opportunitySubmissionSchema = z.object({
  title: z.string().trim().min(3, "Enter a title.").max(120),
  company: z.string().trim().min(2, "Enter a company or organization.").max(120),
  category: z.enum(OPPORTUNITY_CATEGORIES),
  deadline: z.string().date("Select a valid deadline."),
  eligibility: z.string().trim().min(2, "Describe eligibility requirements.").max(500),
  description: z.string().trim().min(10, "Add a short description.").max(3000),
  url: z
    .string()
    .trim()
    .max(2048)
    .url("Enter a valid URL.")
    .refine((value) => /^https?:\/\//i.test(value), "Enter an http(s) URL."),
  submitterName: z.string().trim().min(2, "Enter your name.").max(120),
  submitterEmail: z.string().trim().max(254).email("Enter a valid email address."),
});

export type OpportunitySubmissionFormValues = z.infer<typeof opportunitySubmissionSchema>;
