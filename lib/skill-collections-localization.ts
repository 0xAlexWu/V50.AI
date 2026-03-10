import type { Messages, Locale } from "@/lib/i18n";
import { localizeSkillsForLocale } from "@/lib/skill-localization";
import type { SkillCollection } from "@/types/skill";

function localizeCollectionText(collection: SkillCollection, messages: Messages): SkillCollection {
  const bySlug: Record<string, { title: string; description: string }> = {
    "recently-updated": {
      title: messages.collections.recentlyUpdatedTitle,
      description: messages.collections.recentlyUpdatedDesc
    },
    research: {
      title: messages.collections.researchTitle,
      description: messages.collections.researchDesc
    },
    coding: {
      title: messages.collections.codingTitle,
      description: messages.collections.codingDesc
    },
    automation: {
      title: messages.collections.automationTitle,
      description: messages.collections.automationDesc
    },
    security: {
      title: messages.collections.securityTitle,
      description: messages.collections.securityDesc
    },
    web3: {
      title: messages.collections.web3Title,
      description: messages.collections.web3Desc
    }
  };

  const localized = bySlug[collection.slug];
  if (!localized) return collection;

  return {
    ...collection,
    title: localized.title,
    description: localized.description
  };
}

export async function localizeCollectionForLocale(
  collection: SkillCollection,
  locale: Locale,
  messages: Messages
): Promise<SkillCollection> {
  const localizedText = localizeCollectionText(collection, messages);
  const localizedSkills = await localizeSkillsForLocale(localizedText.skills, locale, {
    includeDescription: false
  });

  return {
    ...localizedText,
    skills: localizedSkills
  };
}
