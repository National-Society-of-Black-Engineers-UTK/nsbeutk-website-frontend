import type { Metadata } from "next";
import { chapter } from "@/lib/data/chapter";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils/dates";

type NewsPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: NewsPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = chapter.newsPosts.find((item) => item.slug === slug);

  if (!post) {
    return { title: "Post not found" };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function NewsPostPage({ params }: NewsPostPageProps) {
  const { slug } = await params;
  const post = chapter.newsPosts.find((item) => item.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16">
      <div>
        <p className="text-xs text-caption">
          {formatDate(post.publishedAt)} · {post.author}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-primary dark:text-secondary sm:text-4xl">{post.title}</h1>
      </div>
      <div className="flex flex-col gap-4 text-base text-foreground">
        {post.body.split("\n\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
