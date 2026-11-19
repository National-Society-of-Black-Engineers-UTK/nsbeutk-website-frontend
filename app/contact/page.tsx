import type { Metadata } from "next";
import { chapter } from "@/lib/data/chapter";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with NSBE UTK officers and find our social links.",
  openGraph: {
    title: "Contact",
    description: "Get in touch with NSBE UTK officers and find our social links.",
  },
};

export default function ContactPage() {
  const { contacts, email, socials } = chapter;
  const hasContact = contacts.length > 0 || email || socials.length > 0;

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-16">
      <h1 className="text-3xl font-bold text-primary dark:text-secondary sm:text-4xl">Contact</h1>
      {hasContact ? (
        <ul className="mt-8 flex flex-col gap-3">
          {email ? <li><a href={`mailto:${email}`} className="underline">{email}</a></li> : null}
          {contacts.map((contact) => (
            <li key={contact.role} className="flex flex-col">
              <span className="text-sm font-bold">{contact.role}</span>
              <a href={`mailto:${contact.email}`} className="underline">{contact.email}</a>
            </li>
          ))}
          {socials.map((social) => (
            <li key={social.href}><a href={social.href} className="underline">{social.label}</a></li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-foreground">Chapter contact details will be posted here when available.</p>
      )}
    </div>
  );
}
