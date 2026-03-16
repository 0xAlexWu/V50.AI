import { ShieldAlert } from "lucide-react";

interface SafetyNoticeProps {
  note: string;
  title?: string;
}

export function SafetyNotice({ note, title = "Safety Notice" }: SafetyNoticeProps) {
  return (
    <section className="rounded-[1.55rem] border border-[#f3d49a] bg-[linear-gradient(180deg,rgba(255,245,224,0.9),rgba(255,239,207,0.72))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]">
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
