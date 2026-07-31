import type { Metadata, Viewport } from "next";
import { Arimo } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

const arimo = Arimo({
  variable: "--font-arimo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nsbeutk.org"),
  title: {
    default: "NSBE UTK — National Society of Black Engineers, UT Knoxville",
    template: "%s · NSBE UTK",
  },
  description:
    "The University of Tennessee, Knoxville chapter of the National Society of Black Engineers: events, opportunities, and resources for our members.",
  openGraph: {
    title: "NSBE UTK",
    description: "The University of Tennessee, Knoxville chapter of the National Society of Black Engineers.",
    url: "https://nsbeutk.org",
    siteName: "NSBE UTK",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#173345" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1a29" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={arimo.variable} suppressHydrationWarning>
      <body className="flex min-h-full flex-col antialiased">
        <ThemeProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
