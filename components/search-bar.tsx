import { Search } from "lucide-react";

import { AiSearchInlineButton } from "@/components/ai-search-inline-button";
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
  return (
    <form id="skills-search-form" className="space-y-4 rounded-[1.4rem] border border-border bg-white/82 p-5 shadow-soft" method="get">
      {activeCategory && activeCategory !== "All" ? <input type="hidden" name="category" value={activeCategory} /> : null}
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            name="q"
            placeholder={messages.skills.searchPlaceholder}
            defaultValue={defaultQuery}
            className="pl-9"
          />
        </div>
        <AiSearchInlineButton
          formId="skills-search-form"
          buttonLabel={messages.skills.aiSearchButton}
          loadingLabel={messages.skills.aiSearching}
          errorLabel={messages.skills.aiSearchError}
        />
      </div>

      <div className="rounded-2xl border border-border/80 bg-white/70 p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2 lg:max-w-[58%]">
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
                />
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <AutoSubmitSelect
              name="source"
              defaultValue={activeSource}
              aria-label="Source filter"
              className="h-10 min-w-[132px] shrink-0 rounded-xl border border-border bg-white px-3 text-sm text-slate-700"
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
              className="h-10 min-w-[120px] shrink-0 rounded-xl border border-border bg-white px-3 text-sm text-slate-700"
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
              className="h-10 min-w-[150px] shrink-0 rounded-xl border border-border bg-white px-3 text-sm text-slate-700"
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
              className="h-10 min-w-[96px] shrink-0 rounded-xl border border-border bg-white px-3 text-sm text-slate-700"
              options={[
                { value: "grid", label: messages.skills.viewGrid },
                { value: "list", label: messages.skills.viewList }
              ]}
            />
            <button
              type="submit"
              className="h-10 shrink-0 rounded-xl bg-accent px-4 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {messages.skills.apply}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
