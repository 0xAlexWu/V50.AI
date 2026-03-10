import type { Metadata } from "next";

import { CollectionCard } from "@/components/collection-card";
import { EmptyState } from "@/components/empty-state";
import { SectionHeader } from "@/components/section-header";
import { SkillRow } from "@/components/skill-row";
import { buildCollections } from "@/lib/collections";
import { getRequestI18n } from "@/lib/i18n-server";
import { localizeCollectionForLocale } from "@/lib/skill-collections-localization";
import { getAllSkills } from "@/lib/skills";

export const metadata: Metadata = {
  title: "Collections",
  description: "Dynamic editorial collections built from real OpenClaw skill metadata."
};

export default async function CollectionsPage() {
  const { locale, messages } = await getRequestI18n();
  const skills = await getAllSkills();
  const collections = await Promise.all(
    buildCollections(skills).map((collection) => localizeCollectionForLocale(collection, locale, messages))
  );

  return (
    <div className="space-y-10">
      <SectionHeader title={messages.collections.title} description={messages.collections.desc} />

      {collections.length === 0 ? (
        <EmptyState title={messages.collections.noCollectionsTitle} description={messages.collections.noCollectionsDesc} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard key={collection.slug} collection={collection} locale={locale} messages={messages} />
          ))}
        </div>
      )}

      {collections[0]?.skills?.length ? (
        <section className="space-y-4">
          <SectionHeader title={`${collections[0].title} ${messages.collections.previewSuffix}`} />
          <div className="space-y-3">
            {collections[0].skills.slice(0, 5).map((skill) => (
              <SkillRow key={skill.id} skill={skill} locale={locale} messages={messages} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
