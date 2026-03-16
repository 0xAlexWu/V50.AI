import Link from "next/link";

import { cn } from "@/lib/utils";

interface CategoryChipProps {
  category: string;
  href: string;
  active?: boolean;
  label?: string;
  className?: string;
}

export function CategoryChip({ category, href, active = false, label, className }: CategoryChipProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-11 min-w-0 items-center whitespace-nowrap rounded-full border px-4 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl transition",
        active
          ? "border-slate-950 bg-[linear-gradient(180deg,rgba(30,41,59,1),rgba(15,23,42,1))] text-white shadow-[0_18px_30px_-22px_rgba(15,23,42,0.95),inset_0_1px_0_rgba(255,255,255,0.08)]"
          : "border-white/58 bg-white/58 text-slate-700 hover:border-white/72 hover:bg-white/82 hover:text-slate-900",
        className
      )}
    >
      {label ?? category}
    </Link>
  );
}
