import Link from "next/link";

import type { Locale, Messages } from "@/lib/i18n";
import type { SkillCollection } from "@/types/skill";

interface CollectionCardProps {
  collection: SkillCollection;
  locale?: Locale;
  messages?: Messages;
}

export function CollectionCard({ collection, locale = "en", messages }: CollectionCardProps) {
  return (
    <article className="rounded-[1.4rem] border border-border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-xl">
      <h3 className="text-2xl font-semibold text-slate-900">{collection.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{collection.description}</p>
      <p className="mt-3 text-sm font-semibold text-slate-700">
        {collection.skills.length.toLocaleString(locale)} {messages?.collections.liveSkills ?? "live skills"}
      </p>
      <Link
        href={`/skills?q=${encodeURIComponent(collection.title.replace(" Skills", ""))}`}
        className="mt-5 inline-flex items-center rounded-xl border border-border bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-muted"
      >
        {messages?.collections.openCollection ?? "Open Collection"}
      </Link>
    </article>
  );
}
