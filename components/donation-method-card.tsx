"use client";

import { useMemo, useState } from "react";

interface DonationMethodCardProps {
  symbol: "BTC" | "ETH" | "DOGE" | "LTC";
  uri: string;
  address?: string;
  addressMissingLabel: string;
  showQrLabel: string;
  hideQrLabel: string;
}

const logoBySymbol = {
  BTC: "https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=040",
  ETH: "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=040",
  DOGE: "https://cryptologos.cc/logos/dogecoin-doge-logo.svg?v=040",
  LTC: "https://cryptologos.cc/logos/litecoin-ltc-logo.svg?v=040"
} as const;

export function DonationMethodCard({
  symbol,
  uri,
  address,
  addressMissingLabel,
  showQrLabel,
  hideQrLabel
}: DonationMethodCardProps) {
  const [showQr, setShowQr] = useState(false);

  const walletUri = address ? `${uri}:${address}` : undefined;
  const qrSrc = useMemo(() => {
    if (!walletUri) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(walletUri)}`;
  }, [walletUri]);

  return (
    <article className="rounded-xl border border-border bg-white/85 p-4">
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
        <img
          src={logoBySymbol[symbol]}
          alt={`${symbol} logo`}
          className="h-6 w-6 object-contain"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
        {symbol}
      </p>
      <p className="mt-1 break-all rounded-lg bg-muted/45 px-2 py-1.5 font-mono text-xs text-slate-700">
        {address || addressMissingLabel}
      </p>

      {walletUri ? (
        <>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowQr((current) => !current)}
              className="inline-flex rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-muted"
              aria-expanded={showQr}
            >
              {showQr ? hideQrLabel : showQrLabel}
            </button>
          </div>
          {showQr ? (
            <div className="mt-3 rounded-lg border border-border bg-white p-3">
              <img
                src={qrSrc}
                alt={`${symbol} wallet QR code`}
                className="h-44 w-44 max-w-full rounded-md object-contain"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : null}
        </>
      ) : null}
    </article>
  );
}
