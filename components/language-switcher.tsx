"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { LANGUAGE_OPTIONS, type Locale } from "@/lib/i18n";

interface LanguageSwitcherProps {
  currentLocale: Locale;
  label: string;
}

export function LanguageSwitcher({ currentLocale, label }: LanguageSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onChange(locale: string) {
    document.cookie = `v50_locale=${locale}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <label className="inline-flex items-center" aria-label={label}>
      <span className="sr-only">{label}</span>
      <select
        value={currentLocale}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-xl border border-border bg-white/90 px-2 text-xs font-medium text-slate-700 outline-none transition focus:border-slate-400"
        disabled={isPending}
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
