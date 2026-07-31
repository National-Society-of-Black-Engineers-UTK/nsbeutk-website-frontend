import type { Metadata } from "next";
import { ImageIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos from NSBE UTK events and conferences.",
  openGraph: {
    title: "Gallery",
    description: "Photos from NSBE UTK events and conferences.",
  },
};

const GALLERY_ITEMS = [
  "Fall Kickoff GBM",
  "Resume & LinkedIn Workshop",
  "Habitat for Humanity Build Day",
  "Career Fair Prep Social",
  "NSBE Fall Regional Conference",
  "Spring Study Hall Series",
] as const;

export default function GalleryPage() {
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 py-16">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold text-primary dark:text-secondary sm:text-4xl">Gallery</h1>
        <p className="mt-4 text-base text-foreground">
          Photos and videos from past NSBE UTK events. Officers will add real event photos here
          after each event.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {GALLERY_ITEMS.map((caption) => (
          <figure
            key={caption}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-subtle bg-primary/5 p-4 text-center"
          >
            <ImageIcon className="size-8 text-caption" aria-hidden="true" />
            <figcaption className="text-xs text-caption">{caption}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
