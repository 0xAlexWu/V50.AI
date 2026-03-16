import { Badge } from "@/components/ui/badge";
import { getTrustLabel, type Messages } from "@/lib/i18n";
import type { TrustLabel } from "@/types/skill";

const trustStyles: Record<TrustLabel, string> = {
  "Archived Source": "border-[#f3d49a] bg-[rgba(255,241,210,0.7)] text-[#8a5b17]",
  "Registry Source": "border-[#9ee1c9] bg-[rgba(222,249,239,0.72)] text-[#0f7a58]",
  "Repository Source": "border-[#a9d2ff] bg-[rgba(227,240,255,0.72)] text-[#245e99]",
  "Recently Updated": "border-[#a9d2ff] bg-[rgba(227,240,255,0.72)] text-[#245e99]",
  "Needs Review": "border-[#f1b6bb] bg-[rgba(255,234,236,0.76)] text-[#a13a48]"
};

interface TrustBadgeProps {
  label: TrustLabel;
  messages?: Messages;
}

export function TrustBadge({ label, messages }: TrustBadgeProps) {
  const translated = messages ? getTrustLabel(label, messages) : label;
  return <Badge className={trustStyles[label]}>{translated}</Badge>;
}
