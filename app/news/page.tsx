import type { Metadata } from "next";
import Link from "next/link";
import { newsPosts } from "@/lib/data/news";
import { formatDate } from "@/lib/utils/dates";

export const metadata: Metadata = {
  title: "News",
  description: "Announcements, member spotlights, and recap posts from NSBE UTK.",
  openGraph: {
    title: "News",
    description: "Announcements, member spotlights, and recap posts from NSBE UTK.",
  },
};

export default function NewsPage() {
  const posts = [...newsPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 py-16">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold text-primary dark:text-secondary sm:text-4xl">News</h1>
        <p className="mt-4 text-base text-foreground">Announcements and stories from the chapter.</p>
      </section>

      <div className="flex flex-col divide-y divide-border-subtle">
        {posts.map((post) => (
          <article key={post.slug} className="flex flex-col gap-2 py-6">
            <p className="text-xs text-caption">
              {formatDate(post.publishedAt)} · {post.author}
            </p>
            <h2 className="text-xl font-bold text-primary dark:text-secondary">
              <Link href={`/news/${post.slug}`} className="hover:text-secondary dark:hover:text-white">
                {post.title}
              </Link>
            </h2>
            <p className="text-sm text-foreground">{post.excerpt}</p>
            <Link href={`/news/${post.slug}`} className="text-sm font-bold text-primary underline hover:text-secondary dark:text-secondary">
              Read more
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
