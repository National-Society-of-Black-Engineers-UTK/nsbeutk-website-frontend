import { z } from "zod";

export const joinInterestSchema = z.object({
  name: z.string().min(2, "Enter your full name."),
  email: z.string().email("Enter a valid email address."),
  major: z.string().min(2, "Enter your major."),
  gradYear: z.string().regex(/^\d{4}$/, "Enter a 4-digit graduation year."),
  message: z.string().optional(),
});

export type JoinInterestFormValues = z.infer<typeof joinInterestSchema>;
