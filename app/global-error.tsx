"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center text-black">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-sm text-gray-600">We hit an unexpected error. Please try again.</p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-secondary px-6 py-3 text-sm font-bold text-black"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
