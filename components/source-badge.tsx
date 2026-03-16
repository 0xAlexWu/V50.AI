import { Badge } from "@/components/ui/badge";
import { getSourceTypeLabel, type Messages } from "@/lib/i18n";
import type { SkillSourceType } from "@/types/skill";

const styleBySource: Record<SkillSourceType, string> = {
  archived_source: "border-[#f3d49a] bg-[rgba(255,241,210,0.7)] text-[#8a5b17]",
  registry_source: "border-[#9ee1c9] bg-[rgba(222,249,239,0.72)] text-[#0f7a58]",
  repository_source: "border-[#a9d2ff] bg-[rgba(227,240,255,0.72)] text-[#245e99]"
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
