import Link from "next/link";

import { CollectionCard } from "@/components/collection-card";
import { EmptyState } from "@/components/empty-state";
import { Hero } from "@/components/hero";
import { SectionHeader } from "@/components/section-header";
import { SkillCard } from "@/components/skill-card";
import { CategoryChip } from "@/components/category-chip";
import { buildCollections } from "@/lib/collections";
import { getCategoryLabel } from "@/lib/i18n";
import { getRequestI18n } from "@/lib/i18n-server";
import { localizeCollectionForLocale } from "@/lib/skill-collections-localization";
import { localizeSkillsForLocale } from "@/lib/skill-localization";
import { getAllSkills, getCategories } from "@/lib/skills";

export default async function HomePage() {
  const { locale, messages } = await getRequestI18n();
  const skills = await getAllSkills();
  const categories = getCategories(skills).filter((category) => category !== "All").slice(0, 10);

  const featured = skills.filter((skill) => !skill.trustLabels.includes("Needs Review")).slice(0, 6);
  const recentlyUpdated = [...skills].slice(0, 6);
  const saferChoices = skills
    .filter(
      (skill) =>
        !skill.trustLabels.includes("Needs Review") &&
        (skill.markdownBody.length > 120 || skill.summary.length > 80)
    )
    .slice(0, 6);

  const collections = buildCollections(skills).slice(0, 3);
  const [featuredLocalized, recentlyUpdatedLocalized, saferChoicesLocalized, collectionsLocalized] = await Promise.all([
    localizeSkillsForLocale(featured, locale, { includeDescription: false }),
    localizeSkillsForLocale(recentlyUpdated, locale, { includeDescription: false }),
    localizeSkillsForLocale(saferChoices, locale, { includeDescription: false }),
    Promise.all(collections.map((collection) => localizeCollectionForLocale(collection, locale, messages)))
  ]);

  return (
    <div className="space-y-14">
      <Hero totalSkills={skills.length} locale={locale} messages={messages} />

      {skills.length === 0 ? (
        <EmptyState title={messages.home.noLiveTitle} description={messages.home.noLiveDesc} />
      ) : null}

      {featured.length > 0 ? (
        <section>
          <SectionHeader title={messages.home.featuredTitle} description={messages.home.featuredDesc} />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredLocalized.map((skill) => (
              <SkillCard key={skill.id} skill={skill} locale={locale} messages={messages} />
            ))}
          </div>
        </section>
      ) : null}

      {recentlyUpdated.length > 0 ? (
        <section>
          <SectionHeader title={messages.home.recentlyUpdatedTitle} description={messages.home.recentlyUpdatedDesc} />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentlyUpdatedLocalized.map((skill) => (
              <SkillCard key={skill.id} skill={skill} locale={locale} messages={messages} />
            ))}
          </div>
        </section>
      ) : null}

      {collections.length > 0 ? (
        <section>
          <SectionHeader title={messages.home.editorialTitle} description={messages.home.editorialDesc} />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collectionsLocalized.map((collection) => (
              <CollectionCard key={collection.slug} collection={collection} locale={locale} messages={messages} />
            ))}
          </div>
        </section>
      ) : null}

      {categories.length > 0 ? (
        <section>
          <SectionHeader title={messages.home.browseCategoryTitle} description={messages.home.browseCategoryDesc} />
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <CategoryChip
                key={category}
                category={category}
                label={getCategoryLabel(category, messages)}
                href={`/skills?category=${encodeURIComponent(category)}`}
              />
            ))}
          </div>
        </section>
      ) : null}

      {saferChoices.length > 0 ? (
        <section>
          <SectionHeader title={messages.home.saferTitle} description={messages.home.saferDesc} />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {saferChoicesLocalized.map((skill) => (
              <SkillCard key={skill.id} skill={skill} locale={locale} messages={messages} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-[1.5rem] border border-border bg-card p-6 shadow-soft">
        <h2 className="font-[var(--font-serif)] text-3xl text-slate-900">{messages.home.topPicksTitle}</h2>
        <p className="mt-2 text-sm text-slate-600">{messages.home.topPicksDesc}</p>
        <Link
          href="/skills"
          className="mt-5 inline-flex rounded-2xl border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-muted"
        >
          {messages.home.exploreAllSkills}
        </Link>
      </section>
    </div>
  );
}
