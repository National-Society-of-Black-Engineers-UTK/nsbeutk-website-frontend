import type { Metadata } from "next";
import { chapter } from "@/lib/data/chapter";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos from NSBE UTK events and conferences.",
};

export default function GalleryPage() {
  const links = chapter.galleryLink ? [chapter.galleryLink] : [];

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-16">
      <h1 className="text-3xl font-bold text-primary dark:text-secondary sm:text-4xl">Gallery</h1>
      {links.length > 0 ? (
        <ul className="mt-6 flex flex-col gap-3">
          {links.map((link) => (
            <li key={link.href}><a href={link.href} className="underline">{link.label}</a></li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-foreground">No photos have been posted yet.</p>
      )}
    </div>
  );
}
