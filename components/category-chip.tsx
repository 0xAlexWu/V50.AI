import Link from "next/link";

import { cn } from "@/lib/utils";

interface CategoryChipProps {
  category: string;
  href: string;
  active?: boolean;
  label?: string;
}

export function CategoryChip({ category, href, active = false, label }: CategoryChipProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-full border px-3 text-sm font-semibold transition",
        active
          ? "border-accent bg-accent text-white"
          : "border-border bg-white/80 text-slate-700 hover:border-slate-400 hover:bg-white"
      )}
    >
      {label ?? category}
    </Link>
  );
}
