import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { sponsors, SPONSOR_TIERS } from "@/lib/data/sponsors";
import { SponsorInquiryForm } from "@/components/forms/sponsor-inquiry-form";

export const metadata: Metadata = {
  title: "Corporate Partners",
  description: "NSBE UTK sponsor tiers, partnership packet, and sponsor inquiry form.",
  openGraph: {
    title: "Corporate Partners",
    description: "NSBE UTK sponsor tiers, partnership packet, and sponsor inquiry form.",
  },
};

export default function PartnersPage() {
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-16 px-6 py-16">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold text-primary dark:text-secondary sm:text-4xl">Corporate Partners</h1>
        <p className="mt-4 text-base text-foreground">
          Our corporate partners make NSBE UTK&apos;s programming possible. Partner with us to
          connect your organization with talented Black engineering students at UT Knoxville.
        </p>
        <a
          href="https://example.com"
          className="mt-4 inline-block text-sm font-bold text-primary underline hover:text-secondary dark:text-secondary"
        >
          Download partnership packet (PDF)
        </a>
      </section>

      {SPONSOR_TIERS.map((tier) => {
        const tierSponsors = sponsors.filter((sponsor) => sponsor.tier === tier);
        if (tierSponsors.length === 0) return null;

        return (
          <section key={tier}>
            <h2 className="text-2xl font-bold text-primary dark:text-secondary">{tier} partners</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tierSponsors.map((sponsor) => (
                <a
                  key={sponsor.id}
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-surface p-6 transition-colors hover:border-secondary"
                >
                  <Badge variant="primary">{sponsor.tier}</Badge>
                  <p className="text-lg font-bold text-primary dark:text-secondary">{sponsor.name}</p>
                  <p className="text-sm text-foreground">{sponsor.description}</p>
                </a>
              ))}
            </div>
          </section>
        );
      })}

      <section className="max-w-xl">
        <h2 className="text-2xl font-bold text-primary dark:text-secondary">Sponsor inquiry</h2>
        <p className="mt-2 text-sm text-caption">
          Interested in sponsoring NSBE UTK? Send us a message and our Corporate Relations Chair
          will follow up.
        </p>
        <div className="mt-6">
          <SponsorInquiryForm />
        </div>
      </section>
    </div>
  );
}
