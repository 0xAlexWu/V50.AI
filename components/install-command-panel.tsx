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
      <p className="rounded-[1rem] border border-white/62 bg-white/62 px-3 py-2 font-mono text-xs text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
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
                ? "border-slate-950 bg-[linear-gradient(180deg,rgba(30,41,59,1),rgba(15,23,42,1))] text-white shadow-[0_18px_30px_-22px_rgba(15,23,42,0.95),inset_0_1px_0_rgba(255,255,255,0.08)]"
                : "border-white/62 bg-white/62 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] hover:bg-white/82"
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="space-y-2 rounded-[1.2rem] border border-white/62 bg-white/62 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
        <p className="max-w-full break-words font-mono text-xs text-slate-800 [overflow-wrap:anywhere]">{command}</p>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-slate-500">Example: npx skills add openclaw/openclaw</p>
          <button
            type="button"
            className="rounded-full border border-slate-950 bg-[linear-gradient(180deg,rgba(30,41,59,1),rgba(15,23,42,1))] px-2.5 py-1 text-xs font-semibold text-white shadow-[0_18px_30px_-22px_rgba(15,23,42,0.95),inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:brightness-[1.03]"
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
