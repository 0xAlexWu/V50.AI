import Link from "next/link";

import { getRequestI18n } from "@/lib/i18n-server";

export default async function NotFound() {
  const { messages } = await getRequestI18n();

  return (
    <div className="rounded-[1.4rem] border border-border bg-card p-8 text-center shadow-soft">
      <h1 className="font-[var(--font-serif)] text-3xl text-slate-900">{messages.common.skillNotFound}</h1>
      <p className="mt-2 text-sm text-slate-600">{messages.common.skillNotFoundDesc}</p>
      <Link
        href="/skills"
        className="mt-5 inline-flex rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-muted"
      >
        {messages.common.backToSkills}
      </Link>
    </div>
  );
}
