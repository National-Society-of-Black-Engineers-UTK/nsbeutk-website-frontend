import type { Metadata } from "next";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { chapter } from "@/lib/data/chapter";

export const metadata: Metadata = {
  title: "Join NSBE",
  description: "How to join NSBE UTK: national and local membership, benefits, and FAQ.",
  openGraph: {
    title: "Join NSBE",
    description: "How to join NSBE UTK: national and local membership, benefits, and FAQ.",
  },
};

const BENEFITS = [
  "Access to national NSBE conferences, career fairs, and scholarships",
  "Mentorship from upperclassmen and alumni in your major",
  "Resume reviews, mock interviews, and technical workshops",
  "A built-in community of Black engineering students at UTK",
];

const FAQS = [
  {
    question: "Do I need to be a Black or African American student to join?",
    answer:
      "No. NSBE welcomes members of all backgrounds who support our mission of increasing the number of culturally responsible Black engineers who excel academically, succeed professionally, and positively impact the community.",
  },
  {
    question: "What's the difference between national and local membership?",
    answer:
      "National membership is paid directly to NSBE National and unlocks conferences, scholarships, and the national job board. Local (chapter) membership covers UTK chapter events and is required to earn points toward stole eligibility.",
  },
  {
    question: "Is there a minimum GPA to join?",
    answer: "No minimum GPA is required to join. Some scholarships and opportunities posted through the chapter may have their own eligibility requirements.",
  },
  {
    question: "How do I earn a graduation stole?",
    answer:
      "Members earn points by attending GBMs, socials, volunteer events, study halls, conferences, and professional development events throughout the year. Reach 250 points to become stole-eligible.",
  },
];

export default function JoinPage() {
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-16 px-6 py-16">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold text-primary dark:text-secondary sm:text-4xl">Join NSBE UTK</h1>
        <p className="mt-4 text-base text-foreground">
          Joining NSBE UTK starts with national membership through NSBE National, then getting
          involved at the chapter level here at UTK.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary dark:text-secondary">Member benefits</h2>
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="rounded-md bg-fill-subtle px-4 py-3 text-sm text-foreground">
              {benefit}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary dark:text-secondary">FAQ</h2>
        <Accordion type="single" collapsible className="mt-6 max-w-3xl">
          {FAQS.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {chapter.joinLink ? (
        <a href={chapter.joinLink.href} className="font-bold text-primary underline dark:text-secondary">
          {chapter.joinLink.label}
        </a>
      ) : null}
    </div>
  );
}
