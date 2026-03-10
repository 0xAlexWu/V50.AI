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
      className="cursor-pointer rounded-2xl border border-border bg-card p-4 shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">{skill.name}</h3>
            <SourceBadge sourceType={skill.sourceType} messages={messages} />
          </div>
          <p className="mt-1 text-sm text-slate-600">{skill.summary}</p>
          <p className="mt-1 text-xs text-slate-500">
            {authorHandle ? (
              <AuthorLink handle={authorHandle} className="text-accent hover:underline" />
            ) : (
              authorLabel
            )}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5" />
              {formatCompactNumber(stars, locale)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Download className="h-3.5 w-3.5" />
              {formatCompactNumber(downloads, locale)}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {skill.trustLabels.map((label) => (
              <TrustBadge key={`${skill.id}-${label}`} label={label} messages={messages} />
            ))}
          </div>
        </div>

        <Link
          href={detailHref}
          className="inline-flex items-center rounded-xl border border-border bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-muted"
        >
          {messages?.common.viewSkill ?? "View Skill"}
        </Link>
      </div>
    </article>
  );
}
