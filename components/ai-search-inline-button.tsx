"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AiSearchInlineButtonProps {
  formId: string;
  buttonLabel: string;
  loadingLabel: string;
  errorLabel: string;
}

interface AiSearchResponse {
  ok: boolean;
  filters?: {
    q?: string;
    category?: string;
    source?: string;
    signal?: string;
    sort?: string;
  };
  error?: string;
}

export function AiSearchInlineButton({
  formId,
  buttonLabel,
  loadingLabel,
  errorLabel
}: AiSearchInlineButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function runAiSearch() {
    if (pending) return;

    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;

    const formData = new FormData(form);
    const prompt = String(formData.get("q") ?? "").trim();
    if (!prompt) return;

    const category = String(formData.get("category") ?? "All");
    const source = String(formData.get("source") ?? "all");
    const signal = String(formData.get("signal") ?? "all");
    const sort = String(formData.get("sort") ?? "recent");
    const view = String(formData.get("view") ?? "grid");

    setPending(true);

    try {
      const response = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt,
          current: { category, source, signal, sort, view }
        })
      });

      const data = (await response.json()) as AiSearchResponse;
      if (!response.ok || !data.ok || !data.filters) {
        throw new Error(data.error || errorLabel);
      }

      const params = new URLSearchParams();
      params.set("q", data.filters.q ?? prompt);
      params.set("category", data.filters.category ?? category);
      params.set("source", data.filters.source ?? source);
      params.set("signal", data.filters.signal ?? signal);
      params.set("sort", data.filters.sort ?? sort);
      params.set("view", view);

      router.push(`/skills?${params.toString()}`);
      router.refresh();
    } catch {
      window.alert(errorLabel);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void runAiSearch()}
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[1.35rem] border border-slate-950 bg-[linear-gradient(180deg,rgba(30,41,59,1),rgba(15,23,42,1))] px-4 text-sm font-semibold text-white shadow-[0_18px_30px_-22px_rgba(15,23,42,0.95),inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:brightness-[1.03] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      <Sparkles className="h-4 w-4" />
      {pending ? loadingLabel : buttonLabel}
    </button>
  );
}
