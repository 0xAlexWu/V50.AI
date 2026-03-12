import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { getRequestI18n } from "@/lib/i18n-server";

import "./globals.css";

const siteDescription =
  "V50.AI is a trust-aware storefront for discovering real OpenClaw skills from public sources.";

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
      <body className="font-[var(--font-sans)] antialiased">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 md:px-8">
          <Navbar locale={locale} messages={messages} />
          <main className="flex-1 py-8 md:py-12">{children}</main>
          <Footer messages={messages} />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
