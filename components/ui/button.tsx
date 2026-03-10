import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = {
  default:
    "inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90",
  outline:
    "inline-flex items-center justify-center rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted",
  ghost:
    "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
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
