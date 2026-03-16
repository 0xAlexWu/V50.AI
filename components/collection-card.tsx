import Link from "next/link";

import type { Locale, Messages } from "@/lib/i18n";
import type { SkillCollection } from "@/types/skill";

interface CollectionCardProps {
  collection: SkillCollection;
  locale?: Locale;
  messages?: Messages;
}

export function CollectionCard({ collection, locale = "en", messages }: CollectionCardProps) {
  const liveCount = collection.totalCount ?? collection.skills.length;

  return (
    <article className="surface-card hover-lift relative flex h-full flex-col overflow-hidden rounded-[1.7rem] p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(129,174,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(247,190,117,0.14),transparent_26%)]" />
      <div className="relative z-10 flex h-full flex-col">
        <h3 className="text-[1.65rem] font-semibold tracking-[-0.045em] text-slate-950">{collection.title}</h3>
        <p className="mt-2 text-sm leading-7 text-slate-600">{collection.description}</p>
        <div className="mt-auto pt-6">
          <p className="inline-flex rounded-full border border-white/62 bg-white/64 px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
            {liveCount.toLocaleString(locale)} {messages?.collections.liveSkills ?? "live skills"}
          </p>
          <div className="mt-4">
            <Link
              href={`/skills?q=${encodeURIComponent(collection.title.replace(" Skills", ""))}`}
              className="inline-flex items-center rounded-full border border-white/62 bg-white/64 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] transition hover:bg-white/82"
            >
              {messages?.collections.openCollection ?? "Open Collection"}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
