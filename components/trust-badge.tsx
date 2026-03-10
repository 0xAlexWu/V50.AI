import { Badge } from "@/components/ui/badge";
import { getTrustLabel, type Messages } from "@/lib/i18n";
import type { TrustLabel } from "@/types/skill";

const trustStyles: Record<TrustLabel, string> = {
  "Archived Source": "border-amber-300 bg-amber-50 text-amber-900",
  "Registry Source": "border-emerald-300 bg-emerald-50 text-emerald-900",
  "Recently Updated": "border-sky-300 bg-sky-50 text-sky-900",
  "Needs Review": "border-rose-300 bg-rose-50 text-rose-900"
};

interface TrustBadgeProps {
  label: TrustLabel;
  messages?: Messages;
}

export function TrustBadge({ label, messages }: TrustBadgeProps) {
  const translated = messages ? getTrustLabel(label, messages) : label;
  return <Badge className={trustStyles[label]}>{translated}</Badge>;
}
