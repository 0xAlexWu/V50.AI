import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthorMetricsChart } from "@/components/author-metrics-chart";
import { AuthorSubscribeButton } from "@/components/author-subscribe-button";
import { SectionHeader } from "@/components/section-header";
import { SkillCard } from "@/components/skill-card";
import { getAuthorDisplayName, findAuthorSkills } from "@/lib/authors";
import { formatMessage } from "@/lib/i18n";
import { getRequestI18n } from "@/lib/i18n-server";
import { localizeSkillsForLocale } from "@/lib/skill-localization";
import { getSkillDownloads, getSkillStars } from "@/lib/skill-signals";
import { getAllSkills } from "@/lib/skills";
import { formatCompactNumber } from "@/lib/utils";

interface AuthorPageProps {
  params: Promise<{ author: string }>;
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { author } = await params;
  return {
    title: `Author ${author}`,
    description: `Skills profile for ${author}`,
    alternates: {
      canonical: `/authors/${encodeURIComponent(author)}`
    }
  };
}

function sortByUpdatedDesc(a: { updatedAt?: string }, b: { updatedAt?: string }) {
  const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
  const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
  return bTime - aTime;
}

export default async function AuthorProfilePage({ params }: AuthorPageProps) {
  const { locale, messages } = await getRequestI18n();
  const { author } = await params;

  const allSkills = await getAllSkills();
  const authorSkills = findAuthorSkills(allSkills, author).sort(sortByUpdatedDesc);

  if (authorSkills.length === 0) {
    notFound();
  }

  const authorName = getAuthorDisplayName(allSkills, author);
  const totalStars = authorSkills.reduce((sum, skill) => sum + (getSkillStars(skill) ?? 0), 0);
  const totalDownloads = authorSkills.reduce((sum, skill) => sum + (getSkillDownloads(skill) ?? 0), 0);
  const localizedAuthorSkills = await localizeSkillsForLocale(authorSkills, locale, {
    includeDescription: false
  });

  return (
    <div className="space-y-8">
      <SectionHeader
        title={`${messages.author.title}: ${authorName}`}
        description={formatMessage(messages.author.description, { author: authorName })}
      />

      <section className="rounded-[1.4rem] border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid flex-1 gap-3 sm:grid-cols-3">
            <article className="rounded-xl border border-border bg-white/85 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">{messages.author.totalSkills}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{authorSkills.length.toLocaleString(locale)}</p>
            </article>
            <article className="rounded-xl border border-border bg-white/85 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">{messages.author.totalStars}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{formatCompactNumber(totalStars, locale)}</p>
            </article>
            <article className="rounded-xl border border-border bg-white/85 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">{messages.author.totalDownloads}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{formatCompactNumber(totalDownloads, locale)}</p>
            </article>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <AuthorSubscribeButton
              authorHandle={authorName}
              subscribeLabel={messages.author.subscribe}
              subscribedLabel={messages.author.subscribed}
            />
            <Link
              href={`/authors/${encodeURIComponent(authorName)}/rss`}
              className="inline-flex rounded-xl border border-border bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-muted"
            >
              {messages.author.rss}
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader title={messages.author.chartTitle} description={messages.author.chartDesc} />
        <AuthorMetricsChart
          skills={localizedAuthorSkills}
          locale={locale}
          starsLabel={messages.skills.starsLabel}
          downloadsLabel={messages.skills.downloadsLabel}
        />
      </section>

      <section className="space-y-3">
        <SectionHeader title={messages.author.skillsTitle} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {localizedAuthorSkills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} locale={locale} messages={messages} />
          ))}
        </div>
      </section>
    </div>
  );
}
