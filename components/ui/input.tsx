import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-[1.35rem] border border-white/62 bg-white/68 px-4 text-sm text-foreground shadow-[0_18px_30px_-24px_rgba(20,34,56,0.5),inset_0_1px_0_rgba(255,255,255,0.84)] outline-none backdrop-blur-xl transition placeholder:text-slate-500 focus:border-[#7aa8cf] focus:bg-white/82 focus:shadow-[0_22px_34px_-24px_rgba(20,34,56,0.42),inset_0_1px_0_rgba(255,255,255,0.88)]",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";
