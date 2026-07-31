import { z } from "zod";

export const SPONSOR_INTEREST_TYPES = ["Sponsorship", "Recruiting", "Donation", "Other"] as const;

export const sponsorInquirySchema = z.object({
  name: z.string().min(2, "Enter your name."),
  company: z.string().min(2, "Enter your company name."),
  interestType: z.enum(SPONSOR_INTEREST_TYPES),
  email: z.string().email("Enter a valid email address."),
  message: z.string().min(10, "Tell us a bit more about what you're looking for."),
});

export type SponsorInquiryFormValues = z.infer<typeof sponsorInquirySchema>;
