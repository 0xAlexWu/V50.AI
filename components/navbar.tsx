"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";

import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale, Messages } from "@/lib/i18n";

interface NavbarProps {
  locale: Locale;
  messages: Messages;
}

export function Navbar({ locale, messages }: NavbarProps) {
  const [logoBroken, setLogoBroken] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/", label: messages.nav.home },
    { href: "/skills", label: messages.nav.skills },
    { href: "/studio", label: messages.nav.studio },
    { href: "/collections", label: messages.nav.collections },
    { href: "/about", label: messages.nav.about }
  ];

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="pt-2.5 md:pt-3">
      <div
        className="relative overflow-hidden rounded-[1.7rem] border border-white/30 bg-[rgba(255,255,255,0.24)] transition-all duration-500 backdrop-blur-lg"
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),transparent_62%)]" />

        <nav className="relative z-10 flex h-14 items-center justify-between px-3 sm:px-4 md:grid md:h-[4.4rem] md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:px-5 lg:px-6">
          <Link href="/" className="group flex min-w-0 items-center gap-2.5 sm:gap-3">
            {!logoBroken ? (
              <Image
                src="/v50-logo.png"
                alt="V50.AI"
                width={38}
                height={38}
                className="h-8 w-8 rounded-full object-cover shadow-[0_10px_24px_-16px_rgba(17,40,68,0.8)] sm:h-9 sm:w-9"
                onError={() => setLogoBroken(true)}
                priority
              />
            ) : null}
            <div className="min-w-0">
              {logoBroken ? (
                <span className="relative block text-[0.92rem] font-black tracking-[0.06em] text-[#103247] sm:text-[1.02rem] md:text-[1.06rem]">
                  V50.AI
                </span>
              ) : null}
              <span className="hidden truncate text-xs text-slate-600 md:flex md:items-baseline md:gap-1.5">
                <strong className="font-black tracking-[0.03em] text-slate-900">V50.AI</strong>
                <span>{messages.nav.storeTagline}</span>
              </span>
            </div>
          </Link>

          <div className="hidden items-center justify-center md:flex">
            <div className="hidden items-center gap-1 rounded-full border border-white/55 bg-white/38 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] md:flex">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative inline-flex w-[7.2rem] items-center justify-center rounded-full px-3.5 py-2 text-sm font-semibold transition lg:w-[7.4rem] ${
                    isActiveLink(link.href)
                      ? "text-slate-950"
                      : "text-slate-700 hover:bg-white/78 hover:text-slate-900"
                  }`}
                >
                  {isActiveLink(link.href) ? (
                    <span className="pointer-events-none absolute inset-x-4 bottom-[0.18rem] h-[2px] rounded-full bg-[linear-gradient(90deg,rgba(15,23,42,0),rgba(15,23,42,0.9)_18%,rgba(57,106,214,0.82)_50%,rgba(15,23,42,0.9)_82%,rgba(15,23,42,0))]" />
                  ) : null}
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-1 md:gap-2">
            <LanguageSwitcher currentLocale={locale} label={messages.nav.language} />

            <Link
              href="/skills"
              aria-label={messages.nav.searchAria}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/55 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition hover:bg-white/82 hover:text-slate-900 sm:h-10 sm:w-10"
            >
              <Search className="h-4 w-4" />
            </Link>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/55 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition hover:bg-white/82 hover:text-slate-900 sm:h-10 sm:w-10 md:hidden"
              aria-label="Toggle navigation"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((value) => !value)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        {mobileMenuOpen ? (
          <div className="relative z-10 border-t border-white/40 px-3 pb-3 pt-2 md:hidden">
            <div className="grid gap-2 rounded-[1.35rem] border border-white/55 bg-[rgba(255,255,255,0.46)] p-2 backdrop-blur-xl">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-[1rem] px-3 py-2.5 text-sm font-semibold transition ${
                    isActiveLink(link.href)
                      ? "bg-white/78 text-slate-950 shadow-[inset_0_-1px_0_rgba(15,23,42,0.16)]"
                      : "text-slate-700 hover:bg-white/78 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
