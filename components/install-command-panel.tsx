"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type Runner = "skills.sh" | "npx" | "bunx" | "pnpm";

const RUNNERS: Runner[] = ["skills.sh", "npx", "bunx", "pnpm"];

interface InstallCommandPanelProps {
  installTarget: string;
}

function commandByRunner(runner: Runner, target: string): string {
  if (runner === "npx") return `npx skills add ${target}`;
  if (runner === "bunx") return `bunx skills add ${target}`;
  if (runner === "pnpm") return `pnpm dlx skills add ${target}`;
  return `skills.sh add ${target}`;
}

export function InstallCommandPanel({ installTarget }: InstallCommandPanelProps) {
  const [runner, setRunner] = useState<Runner>("npx");
  const [copied, setCopied] = useState(false);

  const command = useMemo(() => commandByRunner(runner, installTarget), [runner, installTarget]);

  return (
    <section className="space-y-3 border-t border-border pt-4">
      <h3 className="text-sm font-semibold text-slate-900">Install</h3>
      <p className="rounded-lg border border-border/80 bg-white px-3 py-2 font-mono text-xs text-slate-700">
        $ install --global skills.sh npx bunx pnpm
      </p>

      <div className="flex flex-wrap gap-2">
        {RUNNERS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setRunner(item)}
            className={cn(
              "rounded-lg border px-2.5 py-1 text-xs font-semibold transition",
              runner === item
                ? "border-accent bg-accent text-white"
                : "border-border bg-white text-slate-700 hover:bg-muted"
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="space-y-2 rounded-xl border border-border bg-white p-3">
        <p className="font-mono text-xs text-slate-800">{command}</p>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-slate-500">Example: npx skills add openclaw/openclaw</p>
          <button
            type="button"
            className="rounded-lg border border-border bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-muted"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(command);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1200);
              } catch {
                setCopied(false);
              }
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </section>
  );
}
