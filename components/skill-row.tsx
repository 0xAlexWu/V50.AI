"use client";

import type { KeyboardEvent, MouseEvent } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Star } from "lucide-react";

import { AuthorLink } from "@/components/author-link";
import { SourceBadge } from "@/components/source-badge";
import { TrustBadge } from "@/components/trust-badge";
import { getSkillAuthorHandle } from "@/lib/authors";
import type { Messages } from "@/lib/i18n";
import { getSkillDownloads, getSkillStars } from "@/lib/skill-signals";
import { formatCompactNumber } from "@/lib/utils";
import type { Skill } from "@/types/skill";

interface SkillRowProps {
  skill: Skill;
  locale?: string;
  messages?: Messages;
}

export function SkillRow({ skill, locale = "en", messages }: SkillRowProps) {
  const router = useRouter();
  const stars = getSkillStars(skill);
  const downloads = getSkillDownloads(skill);
  const authorHandle = getSkillAuthorHandle(skill);
  const authorLabel = skill.author ?? skill.namespace ?? messages?.metadata.profileUnavailable ?? "Profile unavailable";
  const detailHref = `/skills/${skill.slug}`;

  const handleRowClick = (event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest("a,button,input,select,textarea,[role='button']")) return;
    router.push(detailHref);
  };

  const handleRowKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    router.push(detailHref);
  };

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={handleRowClick}
      onKeyDown={handleRowKeyDown}
      className="surface-card hover-lift cursor-pointer rounded-[1.35rem] p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:rounded-[1.55rem]"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="truncate text-[1.2rem] font-semibold tracking-[-0.035em] text-slate-950" title={skill.name}>
              {skill.name}
            </h3>
            <SourceBadge sourceType={skill.sourceType} messages={messages} />
          </div>
          <p className="mt-2 text-sm leading-7 text-slate-600">{skill.summary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/70 px-2.5 py-1">
              <Download className="h-3.5 w-3.5" />
              {formatCompactNumber(downloads, locale)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/70 px-2.5 py-1">
              <Star className="h-3.5 w-3.5" />
              {formatCompactNumber(stars, locale)}
            </span>
            {authorHandle ? (
              <AuthorLink handle={authorHandle} className="block truncate font-medium text-accent hover:underline" />
            ) : (
              <span className="block truncate text-slate-500">{authorLabel}</span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {skill.trustLabels.map((label) => (
              <TrustBadge key={`${skill.id}-${label}`} label={label} messages={messages} />
            ))}
          </div>
        </div>

        <Link
          href={detailHref}
          className="inline-flex items-center justify-center rounded-full border border-white/62 bg-white/62 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] transition hover:bg-white/82 max-lg:w-full lg:w-auto"
        >
          {messages?.common.viewSkill ?? "View Skill"}
        </Link>
      </div>
    </article>
  );
}
