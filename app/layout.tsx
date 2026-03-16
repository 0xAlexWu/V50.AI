import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { getRequestI18n } from "@/lib/i18n-server";

import "./globals.css";

const siteDescription =
  "V50.AI is the largest trust-aware storefront for discovering real OpenClaw skills from public sources.";

export const metadata: Metadata = {
  metadataBase: new URL("https://v50.ai"),
  title: {
    default: "V50.AI | The Largest Skills Store for OpenClaw",
    template: "%s | V50.AI"
  },
  description: siteDescription,
  openGraph: {
    title: "V50.AI | The Largest Skills Store for OpenClaw",
    description: siteDescription,
    siteName: "V50.AI",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "V50.AI",
    description: siteDescription
  },
  alternates: {
    canonical: "/"
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, messages } = await getRequestI18n();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="relative font-[var(--font-sans)] antialiased text-foreground">
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-24">
          <div className="ambient-orb animate-drift-slow left-[-7rem] top-[-8rem] h-[22rem] w-[22rem] bg-[#ffd7c6]/58" />
          <div className="ambient-orb animate-drift-alt right-[-7rem] top-[4rem] h-[24rem] w-[24rem] bg-[#d4e2ff]/52" />
          <div className="ambient-orb animate-pulse-soft bottom-[-8rem] left-[28%] h-[20rem] w-[20rem] bg-[#f8dfaa]/38" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.86),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.42),transparent_62%)]" />
        </div>

        <div className="relative mx-auto flex min-h-screen w-full max-w-[1720px] flex-col px-4 pb-6 sm:px-6 md:px-8 xl:px-10">
          <Navbar locale={locale} messages={messages} />
          <main className="flex-1 py-7 sm:py-9 md:py-11">{children}</main>
          <Footer messages={messages} />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
