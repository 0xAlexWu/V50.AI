import Link from "next/link";
import { Search } from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale, Messages } from "@/lib/i18n";

interface NavbarProps {
  locale: Locale;
  messages: Messages;
}

export function Navbar({ locale, messages }: NavbarProps) {
  const links = [
    { href: "/", label: messages.nav.home },
    { href: "/skills", label: messages.nav.skills },
    { href: "/collections", label: messages.nav.collections },
    { href: "/about", label: messages.nav.about }
  ];

  return (
    <header className="sticky top-0 z-40 -mx-4 border-b border-white/40 bg-background/85 px-4 backdrop-blur-md md:-mx-8 md:px-8">
      <nav className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="rounded-xl bg-accent px-2.5 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white">
            V50.ai
          </span>
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
