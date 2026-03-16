import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = {
  default:
    "inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#123f63,#1d6f81)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_20px_34px_-22px_rgba(18,63,99,0.95)] transition hover:brightness-[1.04] active:translate-y-px",
  outline:
    "inline-flex items-center justify-center rounded-full border border-white/60 bg-white/62 px-4 py-2.5 text-sm font-semibold text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] backdrop-blur-xl transition hover:bg-white/82",
  ghost:
    "inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-white/54"
} as const;

type Variant = keyof typeof buttonVariants;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return <button className={cn(buttonVariants[variant], className)} ref={ref} {...props} />;
  }
);

Button.displayName = "Button";
