import type { Metadata } from "next";
import { chapter } from "@/lib/data/chapter";
import { getInitials } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about NSBE UTK's mission, history, and executive board.",
  openGraph: {
    title: "About",
    description: "Learn about NSBE UTK's mission, history, and executive board.",
  },
};

export default function AboutPage() {
  const { officers, committees } = chapter;

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-16 px-6 py-16">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold text-primary dark:text-secondary sm:text-4xl">About NSBE UTK</h1>
        <p className="mt-4 text-base text-foreground">
          The University of Tennessee, Knoxville chapter of the National Society of Black Engineers
          exists to increase the number of culturally responsible Black engineers who excel
          academically, succeed professionally, and positively impact our community.
        </p>
        <p className="mt-4 text-base text-foreground">
          NSBE UTK has grown into one of the College of Engineering&apos;s most active student
          organizations, hosting professional development workshops, GBMs, social events, and
          community service projects each semester.
        </p>
      </section>

      {officers.length > 0 ? (
        <section>
          <h2 className="text-2xl font-bold text-primary dark:text-secondary">Executive board</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {officers.map((officer) => (
              <div key={officer.id} className="flex items-center gap-4 rounded-lg border border-border-subtle bg-surface p-6">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white dark:bg-secondary dark:text-black">
                  {getInitials(officer.name)}
                </div>
                <div>
                  <p className="font-bold text-primary dark:text-secondary">{officer.name}</p>
                  <p className="text-sm text-caption">{officer.role}</p>
                  <p className="text-sm text-caption">
                    {officer.major} · {officer.year}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {committees.length > 0 ? (
        <section>
          <h2 className="text-2xl font-bold text-primary dark:text-secondary">Committees</h2>
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {committees.map((committee) => (
              <li key={committee} className="rounded-md bg-fill-subtle px-4 py-3 text-sm font-medium text-foreground">
                {committee}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
