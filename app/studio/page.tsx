import type { Metadata } from "next";

import { SectionHeader } from "@/components/section-header";
import { SkillStudio } from "@/components/skill-studio";
import { getRequestI18n } from "@/lib/i18n-server";
import { getStudioCopy } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Studio",
  description: "Build and export a real OpenClaw SKILL.md draft directly from V50.AI."
};

export default async function StudioPage() {
  const { locale, messages } = await getRequestI18n();
  const copy = getStudioCopy(locale);

  return (
    <div className="space-y-8">
      <SectionHeader title={copy.title} description={copy.description} />
      <SkillStudio locale={locale} messages={messages} />
    </div>
  );
}
