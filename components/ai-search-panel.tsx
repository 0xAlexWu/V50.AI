"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Messages } from "@/lib/i18n";

interface AiSearchPanelProps {
  messages: Messages;
  defaultQuery?: string;
  activeCategory?: string;
  activeSource?: string;
  activeSignal?: string;
  activeSort?: string;
  activeView?: string;
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

export function AiSearchPanel({
  messages,
  defaultQuery,
  activeCategory = "All",
  activeSource = "all",
  activeSignal = "all",
  activeSort = "recent",
  activeView = "grid"
}: AiSearchPanelProps) {
  const router = useRouter();
  const [prompt, setPrompt] = useState(defaultQuery ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runAiSearch() {
    const text = prompt.trim();
    if (!text || pending) return;

    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/ai-search", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          prompt: text,
          current: {
            category: activeCategory,
            source: activeSource,
            signal: activeSignal,
            sort: activeSort,
            view: activeView
          }
        })
      });

      const data = (await response.json()) as AiSearchResponse;

      if (!response.ok || !data.ok || !data.filters) {
        throw new Error(data.error || messages.skills.aiSearchError);
      }

      const params = new URLSearchParams();
      if (data.filters.q) params.set("q", data.filters.q);
      params.set("category", data.filters.category ?? activeCategory);
      params.set("source", data.filters.source ?? activeSource);
      params.set("signal", data.filters.signal ?? activeSignal);
      params.set("sort", data.filters.sort ?? activeSort);
      params.set("view", activeView);

      router.push(`/skills?${params.toString()}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : messages.skills.aiSearchError);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2 rounded-2xl border border-border/80 bg-white/90 p-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Sparkles className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-accent" />
          <input
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder={messages.skills.aiSearchPlaceholder}
            className="h-10 w-full rounded-xl border border-border bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-slate-400"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void runAiSearch();
              }
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => void runAiSearch()}
          disabled={pending || !prompt.trim()}
          className="h-10 rounded-xl bg-accent px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? messages.skills.aiSearching : messages.skills.aiSearchButton}
        </button>
      </div>
      <p className="text-xs text-slate-600">{error ?? messages.skills.aiSearchHint}</p>
    </div>
  );
}
