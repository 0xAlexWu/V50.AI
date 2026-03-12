import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { AssistantInstallPrompt } from "@/components/assistant-install-prompt";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { MetadataPanel } from "@/components/metadata-panel";
import { SafetyNotice } from "@/components/safety-notice";
import { SectionHeader } from "@/components/section-header";
import { SkillCard } from "@/components/skill-card";
import { getRequestI18n } from "@/lib/i18n-server";
import { localizeSkillsForLocale } from "@/lib/skill-localization";
import { getAllSkills, getSkillBySlug, pickRelatedSkills } from "@/lib/skills";

interface SkillDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SkillDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const skill = await getSkillBySlug(slug);

  if (!skill) {
    return {
      title: "Skill Not Found"
    };
  }

  return {
    title: `${skill.name}`,
    description: skill.summary,
    alternates: {
      canonical: `/skills/${skill.slug}`
    },
    openGraph: {
      title: `${skill.name} | V50.ai`,
      description: skill.summary,
      type: "article"
    }
  };
}

export default async function SkillDetailPage({ params }: SkillDetailPageProps) {
  const { locale, messages } = await getRequestI18n();
  const { slug } = await params;
  const skill = await getSkillBySlug(slug);

  if (!skill) {
    notFound();
  }

  const allSkills = await getAllSkills();
  const related = pickRelatedSkills(allSkills, skill, 3);
  const [localizedSkill] = await localizeSkillsForLocale([skill], locale, {
    includeDescription: true,
    includeMarkdown: true,
    includeSafetyNote: true
  });
  const localizedRelated = await localizeSkillsForLocale(related, locale, {
    includeDescription: false
  });
  const sourceLinkLabel =
    localizedSkill.sourceType === "registry_source" ? messages.detail.openRegistryRecord : messages.detail.openInGithub;
  const rawInstallSlug = (localizedSkill.registrySlug ?? localizedSkill.slug).trim();
  const installNamespace = (localizedSkill.namespace ?? localizedSkill.author ?? "").trim();
  const installTarget =
    installNamespace && !rawInstallSlug.startsWith(`${installNamespace}/`)
      ? `${installNamespace}/${rawInstallSlug}`
      : rawInstallSlug;

  return (
    <div className="space-y-8">
      <SectionHeader title={localizedSkill.name} description={localizedSkill.summary} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] xl:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]">
        <div className="space-y-6">
          <SafetyNotice note={localizedSkill.safetyNote} title={messages.safety.title} />
          <AssistantInstallPrompt
            skillName={localizedSkill.name}
            installTarget={installTarget}
            markdownBody={skill.markdownBody || localizedSkill.markdownBody}
            locale={locale}
          />
          {localizedSkill.markdownBody ? (
            <MarkdownRenderer markdown={localizedSkill.markdownBody} />
          ) : (
            <EmptyState title={messages.detail.noMarkdownTitle} description={messages.detail.noMarkdownDesc} />
          )}
        </div>

        <div className="w-full justify-self-end">
          <MetadataPanel skill={localizedSkill} locale={locale} messages={messages} />
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-[var(--font-serif)] text-2xl text-slate-900">{messages.detail.sourceTransparencyTitle}</h2>
        <p className="mt-2 text-sm text-slate-600">{messages.detail.sourceTransparencyDesc}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={localizedSkill.sourceUrl}
            target="_blank"
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-muted"
          >
            {sourceLinkLabel}
          </Link>
          {localizedSkill.installationUrl ? (
            <Link
              href={localizedSkill.installationUrl}
              target="_blank"
              className="rounded-xl border border-border bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-muted"
            >
              {messages.detail.openInClawHub}
            </Link>
          ) : null}
        </div>
      </section>

      {localizedRelated.length > 0 ? (
        <section>
          <SectionHeader title={messages.detail.relatedTitle} description={messages.detail.relatedDesc} />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {localizedRelated.map((relatedSkill) => (
              <SkillCard key={relatedSkill.id} skill={relatedSkill} locale={locale} messages={messages} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
