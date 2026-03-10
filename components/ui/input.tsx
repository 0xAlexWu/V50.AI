import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-2xl border border-border bg-white/95 px-4 text-sm text-foreground shadow-sm outline-none transition placeholder:text-slate-500 focus:border-accent",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";
