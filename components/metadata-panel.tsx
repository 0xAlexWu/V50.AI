import Link from "next/link";
import { CalendarDays, Download, Package, Star, UserCircle2 } from "lucide-react";

import { AuthorLink } from "@/components/author-link";
import { InstallCommandPanel } from "@/components/install-command-panel";
import { SourceBadge } from "@/components/source-badge";
import { TrustBadge } from "@/components/trust-badge";
import { Badge } from "@/components/ui/badge";
import { getSkillAuthorHandle } from "@/lib/authors";
import { formatMessage, getCategoryLabel, type Locale, type Messages } from "@/lib/i18n";
import { getSkillDownloads, getSkillStars } from "@/lib/skill-signals";
import { formatCompactNumber } from "@/lib/utils";
import type { Skill } from "@/types/skill";

interface MetadataPanelProps {
  skill: Skill;
  locale: Locale;
  messages: Messages;
}

const sourceTrustLabelByType = {
  archived_source: "Archived Source",
  registry_source: "Registry Source",
  repository_source: "Repository Source"
} as const;

export function MetadataPanel({ skill, locale, messages }: MetadataPanelProps) {
  const extraTrustLabels = skill.trustLabels.filter(
    (label) => label !== sourceTrustLabelByType[skill.sourceType]
  );
  const authorLabel = skill.author ?? skill.namespace ?? messages.metadata.profileUnavailable;
  const authorHandle = getSkillAuthorHandle(skill);

  const sourceLinkLabel =
    skill.sourceType === "registry_source" ? messages.detail.openRegistryRecord : messages.detail.openInGithub;
  const stars = getSkillStars(skill);
  const downloads = getSkillDownloads(skill);
  const categoryLabel = getCategoryLabel(skill.category, messages);
  const rawInstallSlug = (skill.registrySlug ?? skill.slug).trim();
  const installNamespace = (skill.namespace ?? skill.author ?? "").trim();
  const installTarget =
    installNamespace && !rawInstallSlug.startsWith(`${installNamespace}/`)
      ? `${installNamespace}/${rawInstallSlug}`
      : rawInstallSlug;

  return (
    <aside className="mx-auto w-full max-w-[340px] space-y-5 rounded-[1.3rem] border border-border bg-card p-5 shadow-soft lg:mx-0 lg:sticky lg:top-24 lg:self-start">
      <div className="flex flex-wrap gap-2">
        <Badge className="inline-flex items-center gap-1 border-slate-300 bg-slate-50 text-slate-900">
          <Star className="h-3.5 w-3.5" />
          {formatCompactNumber(stars, locale)}
        </Badge>
        <Badge className="inline-flex items-center gap-1 border-slate-300 bg-slate-50 text-slate-900">
          <Download className="h-3.5 w-3.5" />
          {formatCompactNumber(downloads, locale)}
        </Badge>
        <SourceBadge sourceType={skill.sourceType} messages={messages} />
        {extraTrustLabels.map((label) => (
          <TrustBadge key={`${skill.id}-${label}`} label={label} messages={messages} />
        ))}
        <Badge className="border-slate-300 bg-slate-50 text-slate-900">{categoryLabel}</Badge>
      </div>

      <div className="space-y-3 text-sm text-slate-700">
        <p className="flex items-center gap-2 rounded-xl bg-muted/45 px-3 py-2">
          <UserCircle2 className="h-4 w-4" />
          {authorHandle ? (
            <AuthorLink handle={authorHandle} className="text-accent hover:underline" />
          ) : (
            <span>{authorLabel}</span>
          )}
        </p>
        <p className="flex items-center gap-2 rounded-xl bg-muted/45 px-3 py-2">
          <Package className="h-4 w-4" />
          <span>
            {skill.version
              ? formatMessage(messages.metadata.versionPrefix, { version: skill.version })
              : messages.metadata.versionNotProvided}
          </span>
        </p>
        <p className="flex items-center gap-2 rounded-xl bg-muted/45 px-3 py-2">
          <CalendarDays className="h-4 w-4" />
          <span>
            {skill.updatedAt
              ? new Date(skill.updatedAt).toLocaleDateString(locale, {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                })
              : messages.metadata.updatedDateUnavailable}
          </span>
        </p>
      </div>

      <div className="space-y-2 border-t border-border pt-4 text-sm">
        <Link href={skill.sourceUrl} target="_blank" className="block text-accent underline underline-offset-4">
          {sourceLinkLabel}
        </Link>
        {skill.installationUrl ? (
          <Link href={skill.installationUrl} target="_blank" className="block text-accent underline underline-offset-4">
            {messages.detail.openInClawHub}
          </Link>
        ) : null}
      </div>

      <InstallCommandPanel installTarget={installTarget} />
    </aside>
  );
}
