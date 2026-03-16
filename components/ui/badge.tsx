import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/65 bg-white/62 px-2.5 py-1 text-xs font-semibold text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] backdrop-blur-xl",
        className
      )}
      {...props}
    />
  );
}
