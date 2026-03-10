import { Badge } from "@/components/ui/badge";
import { getSourceTypeLabel, type Messages } from "@/lib/i18n";
import type { SkillSourceType } from "@/types/skill";

const styleBySource: Record<SkillSourceType, string> = {
  archived_source: "border-amber-300 bg-amber-50 text-amber-900",
  registry_source: "border-emerald-300 bg-emerald-50 text-emerald-900",
  repository_source: "border-sky-300 bg-sky-50 text-sky-900"
};

const fallbackLabelBySource: Record<SkillSourceType, string> = {
  archived_source: "Archived Source",
  registry_source: "Registry Source",
  repository_source: "Repository Source"
};

interface SourceBadgeProps {
  sourceType: SkillSourceType;
  messages?: Messages;
}

export function SourceBadge({ sourceType, messages }: SourceBadgeProps) {
  const label = messages ? getSourceTypeLabel(sourceType, messages) : fallbackLabelBySource[sourceType];
  return <Badge className={styleBySource[sourceType]}>{label}</Badge>;
}
