import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Enter your name."),
  email: z.string().email("Enter a valid email address."),
  subject: z.string().min(3, "Enter a subject."),
  message: z.string().min(10, "Enter a message."),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
