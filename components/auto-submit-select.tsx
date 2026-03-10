"use client";

import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface AutoSubmitSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  options: SelectOption[];
}

export function AutoSubmitSelect({
  options,
  className,
  onChange,
  ...props
}: AutoSubmitSelectProps) {
  return (
    <select
      {...props}
      className={cn(className)}
      onChange={(event) => {
        onChange?.(event);
        event.currentTarget.form?.requestSubmit();
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
