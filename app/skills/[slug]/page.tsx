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
  const related = pickRelatedSkills(allSkills, skill, 4);
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

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] xl:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]">
        <div className="order-2 min-w-0 space-y-5 sm:space-y-6 lg:order-1">
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

        <div className="order-1 min-w-0 w-full justify-self-stretch lg:order-2 lg:justify-self-end">
          <MetadataPanel skill={localizedSkill} locale={locale} messages={messages} />
        </div>
      </div>

      <section className="surface-card rounded-[1.5rem] p-5 sm:rounded-[1.8rem] sm:p-6">
        <h2 className="font-[var(--font-serif)] text-2xl tracking-[-0.04em] text-slate-950">
          {messages.detail.sourceTransparencyTitle}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{messages.detail.sourceTransparencyDesc}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={localizedSkill.sourceUrl}
            target="_blank"
            className="rounded-full border border-white/62 bg-white/64 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] transition hover:bg-white/82"
          >
            {sourceLinkLabel}
          </Link>
          {localizedSkill.installationUrl ? (
            <Link
              href={localizedSkill.installationUrl}
              target="_blank"
              className="rounded-full border border-white/62 bg-white/64 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] transition hover:bg-white/82"
            >
              {messages.detail.openInClawHub}
            </Link>
          ) : null}
        </div>
      </section>

      {localizedRelated.length > 0 ? (
        <section>
          <SectionHeader title={messages.detail.relatedTitle} description={messages.detail.relatedDesc} />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {localizedRelated.map((relatedSkill) => (
              <SkillCard key={relatedSkill.id} skill={relatedSkill} locale={locale} messages={messages} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
