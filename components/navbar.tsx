"use client";

import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale, Messages } from "@/lib/i18n";

interface NavbarProps {
  locale: Locale;
  messages: Messages;
}

export function Navbar({ locale, messages }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [logoBroken, setLogoBroken] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 18);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/", label: messages.nav.home },
    { href: "/skills", label: messages.nav.skills },
    { href: "/collections", label: messages.nav.collections },
    { href: "/about", label: messages.nav.about }
  ];

  return (
    <header
      className={`sticky top-0 z-40 -mx-4 border-b px-4 transition-[border-color,backdrop-filter] duration-500 md:-mx-8 md:px-8 ${
        scrolled ? "border-[#d8d1c6] backdrop-blur-md" : "border-transparent backdrop-blur-0"
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-[rgba(244,238,227,0.92)] transition-opacity duration-500 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
      />

      <nav className="relative z-10 flex h-16 items-center justify-between">
        <Link href="/" className="group flex items-center gap-2">
          {!logoBroken ? (
            <Image
              src="/v50-logo.png"
              alt="V50.AI"
              width={34}
              height={34}
              className="h-8 w-8 rounded-md object-cover"
              onError={() => setLogoBroken(true)}
              priority
            />
          ) : (
            <span className="relative text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-[#163540] after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-[#163540] after:transition-transform after:duration-300 group-hover:after:scale-x-100">
              V50.AI
            </span>
          )}
          <span className="hidden text-sm text-slate-600 md:inline">{messages.nav.storeTagline}</span>
        </Link>

        <div className="flex items-center gap-1 md:gap-2">
          <LanguageSwitcher currentLocale={locale} label={messages.nav.language} />
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white/80"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/skills"
            aria-label={messages.nav.searchAria}
            className="ml-1 rounded-xl border border-border bg-white/90 p-2 text-slate-700 transition hover:bg-white"
          >
            <Search className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
