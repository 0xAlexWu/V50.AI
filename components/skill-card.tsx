"use client";

import type { KeyboardEvent, MouseEvent } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Automation: "border-[#b9c7ff] bg-[rgba(235,240,255,0.76)] text-[#344fa3]",
  Coding: "border-[#a9d2ff] bg-[rgba(227,240,255,0.76)] text-[#245e99]",
  General: "border-[#d6d1c8] bg-[rgba(247,244,238,0.8)] text-[#4a5567]",
  Research: "border-[#cbbcff] bg-[rgba(241,236,255,0.78)] text-[#6149a8]",
  Security: "border-[#f1b6bb] bg-[rgba(255,234,236,0.8)] text-[#a13a48]",
  Web3: "border-[#f3d49a] bg-[rgba(255,241,210,0.8)] text-[#8a5b17]"
};

const washByCategory: Record<string, string> = {
  Automation: "bg-[radial-gradient(circle_at_top_right,rgba(109,138,255,0.2),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,184,118,0.16),transparent_28%)]",
  Coding: "bg-[radial-gradient(circle_at_top_right,rgba(96,161,255,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(119,222,213,0.14),transparent_28%)]",
  General: "bg-[radial-gradient(circle_at_top_right,rgba(255,188,131,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(128,164,212,0.12),transparent_28%)]",
  Research: "bg-[radial-gradient(circle_at_top_right,rgba(164,126,255,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,188,131,0.14),transparent_30%)]",
  Security: "bg-[radial-gradient(circle_at_top_right,rgba(255,130,143,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,207,120,0.14),transparent_28%)]",
  Web3: "bg-[radial-gradient(circle_at_top_right,rgba(255,173,86,0.2),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(112,170,255,0.14),transparent_28%)]"
};

export function SkillCard({ skill, locale = "en", messages }: SkillCardProps) {
  const router = useRouter();
  const categoryClass = categoryStyles[skill.category] ?? categoryStyles.General;
  const washClass = washByCategory[skill.category] ?? washByCategory.General;
  const categoryLabel = messages ? getCategoryLabel(skill.category, messages) : skill.category;
  const authorLabel = skill.author ?? skill.namespace ?? messages?.metadata.profileUnavailable ?? "Profile unavailable";
  const authorHandle = getSkillAuthorHandle(skill);
  const stars = getSkillStars(skill);
  const downloads = getSkillDownloads(skill);
  const detailHref = `/skills/${skill.slug}`;

  const handleArticleClick = (event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest("a,button,input,select,textarea,[role='button']")) return;
    router.push(detailHref);
  };

  const handleArticleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    router.push(detailHref);
  };

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={handleArticleClick}
      onKeyDown={handleArticleKeyDown}
      className="surface-card hover-lift group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[1.45rem] p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:rounded-[1.6rem] sm:p-5"
    >
      <div
        className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 ${washClass}`}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,rgba(255,255,255,0.5),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />

      <div className="relative z-10 flex items-start justify-between gap-2">
        <Badge className={categoryClass}>{categoryLabel}</Badge>
        <Link
          href={detailHref}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/58 text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition hover:bg-white/82 hover:text-slate-900 sm:h-9 sm:w-9"
          aria-label={`Open ${skill.name}`}
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <h3 className="relative z-10 mt-4 truncate text-[1.18rem] font-semibold tracking-[-0.04em] text-slate-950 sm:text-[1.35rem]" title={skill.name}>
        {skill.name}
      </h3>
      <p className="relative z-10 mt-2 line-clamp-3 text-sm leading-6 text-slate-600 sm:leading-7">{skill.summary}</p>

      <div className="relative z-10 mt-4 flex flex-wrap gap-2">
        {skill.trustLabels.slice(0, 2).map((label) => (
          <TrustBadge key={`${skill.id}-${label}`} label={label} messages={messages} />
        ))}
      </div>

      <div className="relative z-10 mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 pt-5 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/52 px-2.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]">
          <Download className="h-3.5 w-3.5" />
          {formatCompactNumber(downloads, locale)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/52 px-2.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]">
          <Star className="h-3.5 w-3.5" />
          {formatCompactNumber(stars, locale)}
        </span>
        {authorHandle ? (
          <AuthorLink handle={authorHandle} className="truncate text-xs font-medium text-accent hover:underline" />
        ) : (
          <span className="truncate text-xs text-slate-500">{authorLabel}</span>
        )}
      </div>
    </article>
  );
}
