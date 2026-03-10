import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  description?: ReactNode;
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="mb-4 md:mb-6">
      <h2 className="font-[var(--font-serif)] text-3xl text-slate-900 md:text-4xl">{title}</h2>
      {description ? <p className="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">{description}</p> : null}
    </div>
  );
}
