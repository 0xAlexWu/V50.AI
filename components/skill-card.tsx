import Link from "next/link";
import { ArrowUpRight, Download, Star } from "lucide-react";

import { AuthorLink } from "@/components/author-link";
import { TrustBadge } from "@/components/trust-badge";
import { Badge } from "@/components/ui/badge";
import { getSkillAuthorHandle } from "@/lib/authors";
import { getCategoryLabel, type Messages } from "@/lib/i18n";
import { getSkillDownloads, getSkillStars } from "@/lib/skill-signals";
import { formatCompactNumber } from "@/lib/utils";
import type { Skill } from "@/types/skill";

interface SkillCardProps {
  skill: Skill;
  locale?: string;
  messages?: Messages;
}

const categoryStyles: Record<string, string> = {
  Automation: "border-indigo-300 bg-indigo-50 text-indigo-900",
  Coding: "border-sky-300 bg-sky-50 text-sky-900",
  General: "border-slate-300 bg-slate-50 text-slate-900",
  Research: "border-violet-300 bg-violet-50 text-violet-900",
  Security: "border-rose-300 bg-rose-50 text-rose-900",
  Web3: "border-amber-300 bg-amber-50 text-amber-900"
};

export function SkillCard({ skill, locale = "en", messages }: SkillCardProps) {
  const categoryClass = categoryStyles[skill.category] ?? categoryStyles.General;
  const categoryLabel = messages ? getCategoryLabel(skill.category, messages) : skill.category;
  const authorLabel = skill.author ?? skill.namespace ?? messages?.metadata.profileUnavailable ?? "Profile unavailable";
  const authorHandle = getSkillAuthorHandle(skill);
  const stars = getSkillStars(skill);
  const downloads = getSkillDownloads(skill);

  return (
    <article className="group flex h-full flex-col rounded-[1.3rem] border border-border bg-card p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between gap-2">
        <Badge className={categoryClass}>{categoryLabel}</Badge>
        <Link
          href={`/skills/${skill.slug}`}
          className="rounded-full p-1.5 text-slate-500 transition hover:bg-muted hover:text-slate-900"
          aria-label={`Open ${skill.name}`}
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">{skill.name}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{skill.summary}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {skill.trustLabels.slice(0, 2).map((label) => (
          <TrustBadge key={`${skill.id}-${label}`} label={label} messages={messages} />
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span>{categoryLabel}</span>
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5" />
            {formatCompactNumber(stars, locale)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Download className="h-3.5 w-3.5" />
            {formatCompactNumber(downloads, locale)}
          </span>
        </div>
        {authorHandle ? <AuthorLink handle={authorHandle} className="text-xs text-accent hover:underline" /> : <span>{authorLabel}</span>}
      </div>
    </article>
  );
}
