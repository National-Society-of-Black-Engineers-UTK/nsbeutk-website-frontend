import type { Metadata } from "next";
import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to the NSBE UTK member portal with your UTK email.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-3xl font-bold text-primary dark:text-secondary sm:text-4xl">Log in</h1>
        <p className="mt-4 text-base text-foreground">
          Enter your UTK email and we&apos;ll send you a one-time login link. No password needed.
        </p>
      </div>
      {error ? (
        <p
          role="alert"
          className="rounded-md bg-secondary/20 px-4 py-3 text-sm font-bold text-primary dark:text-secondary"
        >
          That link is invalid or expired. Request a new one below.
        </p>
      ) : null}
      <LoginForm next={next ?? "/portal"} />
    </div>
  );
}
