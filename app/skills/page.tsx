import type { Metadata } from "next";

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

interface SkillsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
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

  const allSkills = await getAllSkills();
  const categories = getCategories(allSkills);

  const filtered = querySkills(allSkills, {
    q,
    category,
    source: source as "all" | "archived_source" | "registry_source" | "repository_source",
    signal: signal as "all" | "with_stars" | "with_downloads" | "with_both",
    sort: sort as "recent" | "name" | "source" | "stars" | "downloads"
  });
  const localizedFiltered = await localizeSkillsForLocale(filtered, locale, {
    includeDescription: false
  });

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

      {filtered.length === 0 ? (
        <EmptyState title={messages.skills.noMatchTitle} description={messages.skills.noMatchDesc} />
      ) : null}

      {view === "list" ? (
        <div className="space-y-3">
          {localizedFiltered.map((skill) => (
            <SkillRow key={skill.id} skill={skill} locale={locale} messages={messages} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {localizedFiltered.map((skill) => (
            <SkillCard key={skill.id} skill={skill} locale={locale} messages={messages} />
          ))}
        </div>
      )}
    </div>
  );
}
