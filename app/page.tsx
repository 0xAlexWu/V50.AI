import { CollectionCard } from "@/components/collection-card";
import { EmptyState } from "@/components/empty-state";
import { HomeStorefront } from "@/components/home-storefront";
import { SectionHeader } from "@/components/section-header";
import { SkillCard } from "@/components/skill-card";
import { buildCollections } from "@/lib/collections";
import {
  pickDailyRecommendations,
  pickFeaturedSkills,
  pickLatestSkills,
  pickRecentlyUpdatedSkills,
  pickSaferChoices,
  pickTopDownloadedSkills,
  pickTopStarredSkills
} from "@/lib/home-curation";
import { getRequestI18n } from "@/lib/i18n-server";
import { localizeCollectionForLocale } from "@/lib/skill-collections-localization";
import { localizeSkillsForLocale } from "@/lib/skill-localization";
import { getAllSkills } from "@/lib/skills";

export default async function HomePage() {
  const { locale, messages } = await getRequestI18n();
  const skills = await getAllSkills();
  const dailyPicks = pickDailyRecommendations(skills, 5);
  const trendingByDownloads = pickTopDownloadedSkills(skills, 5);
  const trendingByStars = pickTopStarredSkills(skills, 5);
  const trendingLatest = pickLatestSkills(skills, 5);

  const featured = pickFeaturedSkills(skills, 8);
  const recentlyUpdated = pickRecentlyUpdatedSkills(skills, 8);
  const saferChoices = pickSaferChoices(skills, 8);

  const collections = buildCollections(skills).slice(0, 4);
  const [
    dailyPicksLocalized,
    trendingByDownloadsLocalized,
    trendingByStarsLocalized,
    trendingLatestLocalized,
    featuredLocalized,
    recentlyUpdatedLocalized,
    saferChoicesLocalized,
    collectionsLocalized
  ] = await Promise.all([
    localizeSkillsForLocale(dailyPicks, locale, { includeDescription: false }),
    localizeSkillsForLocale(trendingByDownloads, locale, { includeDescription: false }),
    localizeSkillsForLocale(trendingByStars, locale, { includeDescription: false }),
    localizeSkillsForLocale(trendingLatest, locale, { includeDescription: false }),
    localizeSkillsForLocale(featured, locale, { includeDescription: false }),
    localizeSkillsForLocale(recentlyUpdated, locale, { includeDescription: false }),
    localizeSkillsForLocale(saferChoices, locale, { includeDescription: false }),
    Promise.all(collections.map((collection) => localizeCollectionForLocale(collection, locale, messages)))
  ]);

  return (
    <div className="space-y-18">
      <HomeStorefront
        dailyPicks={dailyPicksLocalized}
        trendingByDownloads={trendingByDownloadsLocalized}
        trendingByStars={trendingByStarsLocalized}
        trendingLatest={trendingLatestLocalized}
        totalSkills={skills.length}
        locale={locale}
        messages={messages}
      />

      {skills.length === 0 ? (
        <EmptyState title={messages.home.noLiveTitle} description={messages.home.noLiveDesc} />
      ) : null}

      {featured.length > 0 ? (
        <section className="space-y-5">
          <SectionHeader title={messages.home.featuredTitle} description={messages.home.featuredDesc} />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {featuredLocalized.map((skill) => (
              <SkillCard key={skill.id} skill={skill} locale={locale} messages={messages} />
            ))}
          </div>
        </section>
      ) : null}

      {recentlyUpdated.length > 0 ? (
        <section className="space-y-5">
          <SectionHeader title={messages.home.recentlyUpdatedTitle} description={messages.home.recentlyUpdatedDesc} />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {recentlyUpdatedLocalized.map((skill) => (
              <SkillCard key={skill.id} skill={skill} locale={locale} messages={messages} />
            ))}
          </div>
        </section>
      ) : null}

      {saferChoices.length > 0 ? (
        <section className="space-y-5">
          <SectionHeader title={messages.home.saferTitle} description={messages.home.saferDesc} />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {saferChoicesLocalized.map((skill) => (
              <SkillCard key={skill.id} skill={skill} locale={locale} messages={messages} />
            ))}
          </div>
        </section>
      ) : null}

      {collections.length > 0 ? (
        <section className="space-y-5">
          <SectionHeader title={messages.home.editorialTitle} description={messages.home.editorialDesc} />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {collectionsLocalized.map((collection) => (
              <CollectionCard key={collection.slug} collection={collection} locale={locale} messages={messages} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
