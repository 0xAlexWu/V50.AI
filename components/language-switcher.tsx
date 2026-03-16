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
        className="h-9 w-[4.6rem] rounded-full border border-white/60 bg-white/55 px-2.5 text-[11px] font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] outline-none backdrop-blur-xl transition focus:border-[#7aa8cf] focus:bg-white/78 sm:h-10 sm:w-auto sm:px-3 sm:text-xs"
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
