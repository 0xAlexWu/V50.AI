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
      className="inline-flex h-11 items-center gap-1.5 rounded-2xl border border-border bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Sparkles className="h-4 w-4" />
      {pending ? loadingLabel : buttonLabel}
    </button>
  );
}
