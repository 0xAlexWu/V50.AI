import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  description?: ReactNode;
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="mb-5 md:mb-7">
      <div className="h-px w-20 rounded-full bg-[linear-gradient(90deg,#f1c97c,#7db1ff)]" />
      <h2 className="mt-4 font-[var(--font-serif)] text-[2rem] tracking-[-0.045em] text-slate-950 md:text-[2.65rem]">
        {title}
      </h2>
      {description ? <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600 md:text-base">{description}</p> : null}
    </div>
  );
}
