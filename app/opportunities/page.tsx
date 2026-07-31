import type { Metadata } from "next";
import { OpportunitiesBrowser } from "@/components/opportunities/opportunities-browser";
import { OpportunitySubmissionForm } from "@/components/forms/opportunity-submission-form";
import { opportunities } from "@/lib/data/opportunities";

export const metadata: Metadata = {
  title: "Opportunities",
  description: "Internships, scholarships, research, and more submitted by the NSBE UTK community.",
  openGraph: {
    title: "Opportunities",
    description: "Internships, scholarships, research, and more submitted by the NSBE UTK community.",
  },
};

export default function OpportunitiesPage() {
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-16 px-6 py-16">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold text-primary dark:text-secondary sm:text-4xl">Opportunities</h1>
        <p className="mt-4 text-base text-foreground">
          Browse internships, scholarships, research positions, and more. Anyone can submit an
          opportunity below — submissions are reviewed by an officer before they&apos;re published.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary dark:text-secondary">Browse opportunities</h2>
        <OpportunitiesBrowser opportunities={opportunities} />
      </section>

      <section className="max-w-xl">
        <h2 className="text-2xl font-bold text-primary dark:text-secondary">Submit an opportunity</h2>
        <div className="mt-6">
          <OpportunitySubmissionForm />
        </div>
      </section>
    </div>
  );
}
