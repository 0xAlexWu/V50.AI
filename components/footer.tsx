import Link from "next/link";
import { Mail } from "lucide-react";

import type { Messages } from "@/lib/i18n";

interface FooterProps {
  messages: Messages;
}

export function Footer({ messages }: FooterProps) {
  return (
    <footer className="mt-8 pb-4 pt-6 text-sm text-slate-600">
      <div className="glass-panel rounded-[1.7rem] px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600">{messages.footer.description}</p>
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-700">
            <Link
              href="https://x.com/V50AI"
              target="_blank"
              rel="noreferrer"
              aria-label={messages.footer.clawhubRepo}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/58 bg-white/50 transition hover:bg-white/78 hover:text-slate-900"
            >
              <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 fill-current">
                <path d="M18.901 1.154h3.68l-8.04 9.188 9.458 12.504h-7.406l-5.8-7.584-6.637 7.584H.476l8.6-9.828L0 1.154h7.594l5.243 6.932 6.064-6.932Zm-1.291 19.49h2.04L6.486 3.24H4.298L17.61 20.644Z" />
              </svg>
            </Link>
            <Link
              href="mailto:Hi@V50.AI"
              aria-label={messages.footer.skillsArchive}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/58 bg-white/50 transition hover:bg-white/78 hover:text-slate-900"
            >
              <Mail className="h-4.5 w-4.5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
