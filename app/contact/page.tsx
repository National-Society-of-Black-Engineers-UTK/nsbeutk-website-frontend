import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with NSBE UTK officers and find our social links.",
  openGraph: {
    title: "Contact",
    description: "Get in touch with NSBE UTK officers and find our social links.",
  },
};

const OFFICER_CONTACTS = [
  { role: "President", email: "nsbe-president@utk.edu" },
  { role: "Corporate Relations Chair", email: "nsbe-corporate@utk.edu" },
  { role: "General inquiries", email: "nsbe@utk.edu" },
] as const;

export default function ContactPage() {
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-16 px-6 py-16 lg:flex-row lg:gap-24">
      <section className="max-w-xl flex-1">
        <h1 className="text-3xl font-bold text-primary dark:text-secondary sm:text-4xl">Contact</h1>
        <p className="mt-4 text-base text-foreground">
          Have a question, sponsorship interest, or general inquiry? Send us a message or reach
          out directly.
        </p>

        <ul className="mt-8 flex flex-col gap-3">
          {OFFICER_CONTACTS.map((contact) => (
            <li key={contact.role} className="flex flex-col">
              <span className="text-sm font-bold text-foreground">{contact.role}</span>
              <a href={`mailto:${contact.email}`} className="text-sm text-primary underline hover:text-secondary dark:text-secondary">
                {contact.email}
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex gap-4">
          <a href="https://example.com" className="text-sm font-bold text-primary underline hover:text-secondary dark:text-secondary">
            Instagram
          </a>
          <a href="https://example.com" className="text-sm font-bold text-primary underline hover:text-secondary dark:text-secondary">
            LinkedIn
          </a>
        </div>
      </section>

      <section className="max-w-xl flex-1">
        <ContactForm />
      </section>
    </div>
  );
}
