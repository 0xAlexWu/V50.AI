import type { Metadata } from "next";

import { DonationMethodCard } from "@/components/donation-method-card";
import { SectionHeader } from "@/components/section-header";
import { getRequestI18n } from "@/lib/i18n-server";











export const metadata: Metadata = {
  title: "About",
  description: "About V50.ai and the trust-aware approach to OpenClaw skill discovery."
};

export default async function AboutPage() {
  const { messages } = await getRequestI18n();
  const donationMethods: Array<{
    symbol: "BTC" | "ETH" | "DOGE" | "LTC";
    uri: string;
    address: string | undefined;
  }> = [
    { symbol: "BTC", uri: "bitcoin", address: process.env.DONATION_BTC_ADDRESS },
    { symbol: "ETH", uri: "ethereum", address: process.env.DONATION_ETH_ADDRESS },
    { symbol: "DOGE", uri: "dogecoin", address: process.env.DONATION_DOGE_ADDRESS },
    { symbol: "LTC", uri: "litecoin", address: process.env.DONATION_LTC_ADDRESS }
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        title={messages.about.title}
        description={
          <>
            {messages.about.desc} by{" "}
            <a
              href="https://x.com/0xAlexWu"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-accent underline underline-offset-4"
            >
              @0xAlexWu
            </a>
            .
          </>
        }
      />

      <section className="space-y-4 rounded-[1.4rem] border border-border bg-card p-6 shadow-soft">
        <h2 className="font-[var(--font-serif)] text-2xl text-slate-900">{messages.about.whyTitle}</h2>
        <p className="text-sm leading-relaxed text-slate-700">
          Open ecosystems grow fast. Discoverability and trust context often lag.
          V50.ai surfaces real skills with clear source attribution and trust-aware labels.
        </p>
        <p className="text-sm leading-relaxed text-slate-700">
          We do not assume any listed skill is safe. Review source files and permissions before running.
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-700">
          <li>Real source data only. No mock skills.</li>
          <li>No fabricated installs, ratings, reviews, or popularity.</li>
          <li>Missing upstream fields stay missing.</li>
          <li>Ranking signals are explicit and source-based.</li>
        </ul>
      </section>

      <section className="space-y-4 rounded-[1.4rem] border border-border bg-card p-6 shadow-soft">
        <h2 className="font-[var(--font-serif)] text-2xl text-slate-900">{messages.about.donationTitle}</h2>
        <p className="text-sm leading-relaxed text-slate-700">{messages.about.donationBody}</p>
        <div className="grid gap-3 md:grid-cols-2">
          {donationMethods.map((method) => (
            <DonationMethodCard
              key={method.symbol}
              symbol={method.symbol}
              uri={method.uri}
              address={method.address}
              addressMissingLabel={messages.about.donationAddressMissing}
              showQrLabel={messages.about.donationShowQr}
              hideQrLabel={messages.about.donationHideQr}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
