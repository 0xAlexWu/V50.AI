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
    <article className="surface-card-subtle rounded-[1.45rem] p-4">
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
      <p className="mt-2 break-all rounded-[1rem] border border-white/62 bg-white/62 px-2.5 py-2 font-mono text-xs text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
        {address || addressMissingLabel}
      </p>

      {walletUri ? (
        <>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowQr((current) => !current)}
              className="inline-flex rounded-full border border-white/62 bg-white/64 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] transition hover:bg-white/82"
              aria-expanded={showQr}
            >
              {showQr ? hideQrLabel : showQrLabel}
            </button>
          </div>
          {showQr ? (
            <div className="mt-3 rounded-[1.1rem] border border-white/62 bg-white/68 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
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
