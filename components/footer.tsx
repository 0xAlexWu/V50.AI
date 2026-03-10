import Link from "next/link";

import type { Messages } from "@/lib/i18n";

interface FooterProps {
  messages: Messages;
}

export function Footer({ messages }: FooterProps) {
  return (
    <footer className="border-t border-border py-8 text-sm text-slate-600">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p>{messages.footer.description}</p>
        <div className="flex items-center gap-4">
          <Link href="https://github.com/openclaw/clawhub" className="hover:text-slate-900">
            {messages.footer.clawhubRepo}
          </Link>
          <Link href="https://github.com/openclaw/skills" className="hover:text-slate-900">
            {messages.footer.skillsArchive}
          </Link>
        </div>
      </div>
    </footer>
  );
}
