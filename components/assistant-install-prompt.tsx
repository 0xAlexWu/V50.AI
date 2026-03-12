"use client";

import { CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";

import type { Locale } from "@/lib/i18n";

interface AssistantInstallPromptProps {
  skillName: string;
  installTarget: string;
  markdownBody?: string;
  locale: Locale;
}

interface PromptCopy {
  title: string;
  copy: string;
  copied: string;
  buildPrompt: (skillName: string, command: string) => string;
}

const COPY_BY_LOCALE: Record<Locale, PromptCopy> = {
  en: {
    title: "Copy this and send it to your AI assistant to learn",
    copy: "Copy Prompt",
    copied: "Copied",
    buildPrompt: (skillName, command) => `Install skill "${skillName}" with this command: ${command}`
  },
  zh: {
    title: "AI 安装提示词",
    copy: "复制提示词",
    copied: "已复制",
    buildPrompt: (skillName, command) => `安装技能「${skillName}」，执行以下命令：${command}`
  },
  ja: {
    title: "AI インストールプロンプト",
    copy: "プロンプトをコピー",
    copied: "コピー済み",
    buildPrompt: (skillName, command) => `スキル「${skillName}」を次のコマンドでインストールします: ${command}`
  },
  ko: {
    title: "AI 설치 프롬프트",
    copy: "프롬프트 복사",
    copied: "복사됨",
    buildPrompt: (skillName, command) => `스킬 "${skillName}"을 아래 명령으로 설치하세요: ${command}`
  },
  de: {
    title: "KI-Installationsprompt",
    copy: "Prompt kopieren",
    copied: "Kopiert",
    buildPrompt: (skillName, command) => `Installiere das Skill "${skillName}" mit folgendem Befehl: ${command}`
  },
  hi: {
    title: "AI इंस्टॉल प्रॉम्प्ट",
    copy: "प्रॉम्प्ट कॉपी करें",
    copied: "कॉपी हो गया",
    buildPrompt: (skillName, command) => `"${skillName}" स्किल को इस कमांड से इंस्टॉल करें: ${command}`
  }
};

function extractInstallCommand(markdownBody: string | undefined): string | null {
  if (!markdownBody) return null;

  const fencedBlockMatches = markdownBody.match(/```[\s\S]*?```/g) ?? [];
  for (const block of fencedBlockMatches) {
    const command = block.match(
      /\b(?:npx|bunx|pnpm\s+dlx|skills\.sh)\s+skills\s+add\s+[^\s`"']+/i
    )?.[0];
    if (command) return command.trim();
  }

  const inlineCommand = markdownBody.match(
    /\b(?:npx|bunx|pnpm\s+dlx|skills\.sh)\s+skills\s+add\s+[^\s`"']+/i
  )?.[0];

  return inlineCommand?.trim() ?? null;
}

export function AssistantInstallPrompt({
  skillName,
  installTarget,
  markdownBody,
  locale
}: AssistantInstallPromptProps) {
  const [copied, setCopied] = useState(false);
  const copyText = COPY_BY_LOCALE[locale] ?? COPY_BY_LOCALE.en;
  const command = useMemo(
    () => extractInstallCommand(markdownBody) ?? `npx skills add ${installTarget}`,
    [markdownBody, installTarget]
  );
  const prompt = useMemo(() => copyText.buildPrompt(skillName, command), [copyText, skillName, command]);

  return (
    <section className="w-full rounded-2xl border border-emerald-300 bg-emerald-50/70 p-4">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-800" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-emerald-900">{copyText.title}</h3>
            <button
              type="button"
              className="shrink-0 rounded-lg bg-transparent px-3 py-1.5 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-100/60"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(prompt);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1200);
                } catch {
                  setCopied(false);
                }
              }}
            >
              {copied ? copyText.copied : copyText.copy}
            </button>
          </div>
          <p className="text-sm leading-relaxed text-emerald-950/90">
            {prompt}
          </p>
        </div>
      </div>
    </section>
  );
}
