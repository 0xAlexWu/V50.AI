import { ShieldAlert } from "lucide-react";

interface SafetyNoticeProps {
  note: string;
  title?: string;
}

export function SafetyNotice({ note, title = "Safety Notice" }: SafetyNoticeProps) {
  return (
    <section className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4">
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 text-amber-800" />
        <div>
          <h3 className="text-sm font-semibold text-amber-900">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-amber-900">{note}</p>
        </div>
      </div>
    </section>
  );
}
