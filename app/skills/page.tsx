import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { SearchBar } from "@/components/search-bar";
import { SectionHeader } from "@/components/section-header";
import { SkillCard } from "@/components/skill-card";
import { SkillRow } from "@/components/skill-row";
import { getRequestI18n } from "@/lib/i18n-server";
import { localizeSkillsForLocale } from "@/lib/skill-localization";
import { getAllSkills, getCategories, querySkills } from "@/lib/skills";

export const metadata: Metadata = {
  title: "Skills",
  description: "Search and filter real OpenClaw skills fetched from public sources."
};

const DEFAULT_PAGE_SIZE = Number(process.env.SKILLS_PAGE_SIZE ?? "48");
const MAX_PAGE_SIZE = Number(process.env.SKILLS_PAGE_SIZE_MAX ?? "120");

interface SkillsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export default async function SkillsPage({ searchParams }: SkillsPageProps) {
  const { locale, messages } = await getRequestI18n();
  const params = await searchParams;
  const q = first(params.q);
  const category = first(params.category) ?? "All";
  const source = first(params.source) ?? "all";
  const signal = first(params.signal) ?? "all";
  const sort = first(params.sort) ?? "recent";
  const view = first(params.view) ?? "grid";
  const page = parsePositiveInt(first(params.page), 1);
  const pageSize = clamp(parsePositiveInt(first(params.pageSize), DEFAULT_PAGE_SIZE), 12, MAX_PAGE_SIZE);

  const allSkills = await getAllSkills();
  const categories = getCategories(allSkills);

  const filtered = querySkills(allSkills, {
    q,
    category,
    source: source as "all" | "archived_source" | "registry_source" | "repository_source",
    signal: signal as "all" | "with_stars" | "with_downloads" | "with_both",
    sort: sort as "recent" | "name" | "source" | "stars" | "downloads"
  });

  const totalResults = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const currentPage = clamp(page, 1, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, totalResults);
  const pagedSkills = filtered.slice(pageStart, pageEnd);

  const localizedPagedSkills = await localizeSkillsForLocale(pagedSkills, locale, {
    includeDescription: false
  });

  const buildPageHref = (targetPage: number): string => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (category !== "All") next.set("category", category);
    if (source !== "all") next.set("source", source);
    if (signal !== "all") next.set("signal", signal);
    if (sort !== "recent") next.set("sort", sort);
    if (view !== "grid") next.set("view", view);
    if (pageSize !== DEFAULT_PAGE_SIZE) next.set("pageSize", String(pageSize));
    if (targetPage > 1) next.set("page", String(targetPage));
    const query = next.toString();
    return query ? `/skills?${query}` : "/skills";
  };

  return (
    <div className="space-y-8">
      <SectionHeader title={messages.skills.directoryTitle} description={messages.skills.directoryDesc} />

      <SearchBar
        defaultQuery={q}
        categories={categories}
        activeCategory={category}
        activeSource={source}
        activeSignal={signal}
        activeSort={sort}
        activeView={view}
        messages={messages}
      />

      {totalResults === 0 ? (
        <EmptyState title={messages.skills.noMatchTitle} description={messages.skills.noMatchDesc} />
      ) : null}

      {totalResults > 0 ? (
        <div className="surface-card-subtle flex flex-col gap-2 rounded-[1.4rem] px-4 py-3 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing {pageStart + 1}-{pageEnd} of {totalResults.toLocaleString(locale)} skills
          </p>
          {totalPages > 1 ? (
            <p>
              Page {currentPage} / {totalPages}
            </p>
          ) : null}
        </div>
      ) : null}

      {view === "list" ? (
        <div className="space-y-3">
          {localizedPagedSkills.map((skill) => (
            <SkillRow key={skill.id} skill={skill} locale={locale} messages={messages} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {localizedPagedSkills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} locale={locale} messages={messages} />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <nav className="glass-panel flex flex-wrap items-center justify-center gap-2 rounded-[1.4rem] px-3 py-3">
          <Link
            href={buildPageHref(currentPage - 1)}
            aria-disabled={currentPage <= 1}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
              currentPage <= 1
                ? "pointer-events-none border-white/40 text-slate-400"
                : "border-white/62 bg-white/64 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] hover:bg-white/82"
            }`}
          >
            Previous
          </Link>
          <span className="px-2 text-sm text-slate-600">
            {currentPage} / {totalPages}
          </span>
          <Link
            href={buildPageHref(currentPage + 1)}
            aria-disabled={currentPage >= totalPages}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
              currentPage >= totalPages
                ? "pointer-events-none border-white/40 text-slate-400"
                : "border-white/62 bg-white/64 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] hover:bg-white/82"
            }`}
          >
            Next
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
