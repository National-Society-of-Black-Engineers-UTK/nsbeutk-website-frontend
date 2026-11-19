import Link from "next/link";
import { chapter } from "@/lib/data/chapter";

const FOOTER_LINKS = [
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/partners", label: "Corporate Partners" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 py-12 sm:flex-row sm:justify-between">
        <div>
          <p className="text-lg font-bold">NSBE UTK</p>
          <p className="mt-2 max-w-xs text-sm text-white/70">
            The University of Tennessee, Knoxville chapter of the National Society of Black Engineers.
          </p>
          {chapter.socials.length > 0 || chapter.email ? (
            <div className="mt-4 flex flex-wrap items-center gap-4">
              {chapter.socials.map((social) => (
                <a key={social.href} href={social.href} className="text-sm font-bold hover:text-secondary">
                  {social.label}
                </a>
              ))}
              {chapter.email ? (
                <a href={`mailto:${chapter.email}`} className="text-sm font-bold hover:text-secondary">
                  Email
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-1">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-secondary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10 px-6 py-4 text-center text-xs text-white/60">
        © {year} NSBE UTK. All rights reserved.
      </div>
    </footer>
  );
}
