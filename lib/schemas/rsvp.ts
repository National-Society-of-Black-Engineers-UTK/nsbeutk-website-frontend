import { z } from "zod";

export const rsvpSchema = z.object({
  name: z.string().min(2, "Enter your full name."),
  email: z.string().email("Enter a valid email address."),
});

export type RsvpFormValues = z.infer<typeof rsvpSchema>;
