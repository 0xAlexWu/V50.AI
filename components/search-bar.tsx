"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";

import { AutoSubmitSelect } from "@/components/auto-submit-select";
import { CategoryChip } from "@/components/category-chip";
import { Input } from "@/components/ui/input";
import { getCategoryLabel, type Messages } from "@/lib/i18n";

interface SearchBarProps {
  defaultQuery?: string;
  categories: string[];
  activeCategory?: string;
  activeSource?: string;
  activeSignal?: string;
  activeSort?: string;
  activeView?: string;
  messages: Messages;
}

export function SearchBar({
  defaultQuery,
  categories,
  activeCategory,
  activeSource = "all",
  activeSignal = "all",
  activeSort = "recent",
  activeView = "grid",
  messages
}: SearchBarProps) {
  const hasAdvancedSelection =
    (activeCategory && activeCategory !== "All") ||
    activeSource !== "all" ||
    activeSignal !== "all" ||
    activeSort !== "recent" ||
    activeView !== "grid";
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(Boolean(hasAdvancedSelection));

  useEffect(() => {
    if (hasAdvancedSelection) {
      setIsAdvancedOpen(true);
    }
  }, [hasAdvancedSelection]);

  const selectClassName =
    "h-11 w-full min-w-0 rounded-[1.15rem] border border-white/60 bg-white/68 px-3 text-sm text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.84)] backdrop-blur-xl transition hover:bg-white/82 focus:bg-white/82";

  return (
    <form
      id="skills-search-form"
      className="glass-panel space-y-4 overflow-hidden rounded-[1.95rem] p-4 sm:space-y-5 sm:p-5 lg:p-6"
      method="get"
    >
      {activeCategory && activeCategory !== "All" ? <input type="hidden" name="category" value={activeCategory} /> : null}

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-slate-400" />
          <Input
            name="q"
            placeholder={messages.skills.searchPlaceholder}
            defaultValue={defaultQuery}
            className="pl-10"
          />
        </div>

        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center rounded-[1.35rem] border border-slate-950 bg-[linear-gradient(180deg,rgba(30,41,59,1),rgba(15,23,42,1))] px-5 text-sm font-semibold text-white shadow-[0_18px_30px_-22px_rgba(15,23,42,0.95),inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:brightness-[1.03]"
        >
          {messages.skills.apply}
        </button>
      </div>

      <div className="pt-1">
        <button
          type="button"
          onClick={() => setIsAdvancedOpen((value) => !value)}
          aria-expanded={isAdvancedOpen}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-950"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Advanced Search</span>
          <ChevronDown
            className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${
              isAdvancedOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {isAdvancedOpen ? (
            <motion.div
              key="advanced-search-panel"
              initial={{ height: 0, opacity: 0, y: -8 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -8 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-4 surface-card-subtle rounded-[1.6rem] p-3 sm:p-4">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(420px,460px)] xl:items-start">
                  <div className="rounded-[1.4rem] border border-white/45 bg-white/40 p-3 sm:p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {messages.home.browseCategoryTitle}
                      </p>
                    </div>

                    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
                      {categories.map((category) => {
                        const params = new URLSearchParams();
                        if (defaultQuery) params.set("q", defaultQuery);
                        params.set("category", category);
                        if (activeSource) params.set("source", activeSource);
                        if (activeSignal) params.set("signal", activeSignal);
                        if (activeSort) params.set("sort", activeSort);
                        if (activeView) params.set("view", activeView);
                        const href = `/skills?${params.toString()}`;
                        return (
                          <CategoryChip
                            key={category}
                            category={category}
                            label={getCategoryLabel(category, messages)}
                            href={href}
                            active={activeCategory === category}
                            className="shrink-0 justify-center sm:justify-start"
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-[1.4rem] border border-white/45 bg-white/40 p-3 sm:p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Refine
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <AutoSubmitSelect
                        name="source"
                        defaultValue={activeSource}
                        aria-label="Source filter"
                        className={selectClassName}
                        options={[
                          { value: "all", label: messages.skills.allSources },
                          { value: "archived_source", label: messages.skills.archivedSource },
                          { value: "registry_source", label: messages.skills.registrySource },
                          { value: "repository_source", label: messages.skills.repositorySource }
                        ]}
                      />
                      <AutoSubmitSelect
                        name="signal"
                        defaultValue={activeSignal}
                        aria-label="Signals filter"
                        className={selectClassName}
                        options={[
                          { value: "all", label: messages.skills.signalAll },
                          { value: "with_stars", label: messages.skills.signalWithStars },
                          { value: "with_downloads", label: messages.skills.signalWithDownloads },
                          { value: "with_both", label: messages.skills.signalWithBoth }
                        ]}
                      />
                      <AutoSubmitSelect
                        name="sort"
                        defaultValue={activeSort}
                        aria-label="Sort skills"
                        className={selectClassName}
                        options={[
                          { value: "recent", label: messages.skills.sortRecent },
                          { value: "name", label: messages.skills.sortName },
                          { value: "source", label: messages.skills.sortSource },
                          { value: "stars", label: messages.skills.sortStars },
                          { value: "downloads", label: messages.skills.sortDownloads }
                        ]}
                      />
                      <AutoSubmitSelect
                        name="view"
                        defaultValue={activeView}
                        aria-label="View mode"
                        className={selectClassName}
                        options={[
                          { value: "grid", label: messages.skills.viewGrid },
                          { value: "list", label: messages.skills.viewList }
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </form>
  );
}
