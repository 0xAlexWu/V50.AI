import { unstable_cache } from "next/cache";
import { createHash } from "node:crypto";

import type { Locale } from "@/lib/i18n";
import type { Skill } from "@/types/skill";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

const LOCALE_LANGUAGE_NAME: Record<Locale, string> = {
  en: "English",
  zh: "Simplified Chinese",
  ja: "Japanese",
  ko: "Korean",
  de: "German",
  hi: "Hindi"
};

interface LocalizeSkillOptions {
  includeDescription?: boolean;
  includeMarkdown?: boolean;
  includeSafetyNote?: boolean;
}

interface TranslationPayload {
  translations: string[];
}

function extractJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    // continue
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end <= start) return null;

  try {
    return JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isMostlyCjk(text: string): boolean {
  const cjkMatches = text.match(/[\u4e00-\u9fff]/g) ?? [];
  const letters = text.match(/[A-Za-z]/g) ?? [];
  return cjkMatches.length > 0 && cjkMatches.length >= letters.length;
}

function shouldSkipTranslation(locale: Locale, text: string): boolean {
  const value = text.trim();
  if (!value) return true;
  if (locale === "zh" && isMostlyCjk(value)) return true;
  return false;
}

const cachedTranslateChunk = unstable_cache(
  async (locale: Locale, payloadHash: string, payloadJson: string): Promise<string[]> => {
    void payloadHash;

    const texts = JSON.parse(payloadJson) as string[];
    if (locale === "en") return texts;

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return texts;

    const systemPrompt = [
      "You are a software-catalog translation engine.",
      `Target language: ${LOCALE_LANGUAGE_NAME[locale]}.`,
      "Translate each input string and keep output order identical.",
      "Preserve Markdown, code blocks, package names, URLs, CLI flags, and version strings.",
      "Do not add explanations.",
      'Return strict JSON: {"translations": ["..."]}'
    ].join("\n");

    const response = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        temperature: 0,
        max_tokens: 4000,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: JSON.stringify({ texts })
          }
        ]
      })
    });

    if (!response.ok) {
      return texts;
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = payload.choices?.[0]?.message?.content;
    if (!content) return texts;

    const parsed = extractJsonObject(content);
    if (!parsed) return texts;

    const payloadRecord = parsed as Partial<TranslationPayload>;
    const translations = payloadRecord.translations;
    if (!Array.isArray(translations) || translations.length !== texts.length) return texts;

    return translations.map((value, index) => {
      if (typeof value !== "string") return texts[index];
      return value.trim() || texts[index];
    });
  },
  ["deepseek-skill-localization-v1"],
  { revalidate: 60 * 60 * 24 * 14, tags: ["skill-localization"] }
);

function chunk<T>(items: T[], size: number): T[][] {
  const output: T[][] = [];
  for (let i = 0; i < items.length; i += size) output.push(items.slice(i, i + size));
  return output;
}

async function translateTexts(locale: Locale, texts: string[]): Promise<string[]> {
  if (texts.length === 0 || locale === "en") return texts;

  const groups = chunk(texts, 24);
  const output: string[] = [];

  for (const group of groups) {
    const payloadJson = JSON.stringify(group);
    const hash = createHash("sha256").update(`${locale}:${payloadJson}`).digest("hex");
    const translated = await cachedTranslateChunk(locale, hash, payloadJson);
    output.push(...translated);
  }

  return output;
}

export async function localizeSkillsForLocale(
  skills: Skill[],
  locale: Locale,
  options: LocalizeSkillOptions = {}
): Promise<Skill[]> {
  if (locale === "en" || skills.length === 0) return skills;

  const includeDescription = options.includeDescription ?? true;
  const includeMarkdown = options.includeMarkdown ?? false;
  const includeSafetyNote = options.includeSafetyNote ?? false;

  type Field = "name" | "summary" | "description" | "markdownBody" | "safetyNote";
  interface Task {
    index: number;
    field: Field;
    text: string;
  }

  const tasks: Task[] = [];

  skills.forEach((skill, index) => {
    tasks.push({ index, field: "name", text: skill.name });
    tasks.push({ index, field: "summary", text: skill.summary });

    if (includeDescription) {
      tasks.push({ index, field: "description", text: skill.description });
    }

    if (includeMarkdown && skill.markdownBody) {
      const capped = skill.markdownBody.length > 9000 ? `${skill.markdownBody.slice(0, 9000)}\n\n...` : skill.markdownBody;
      tasks.push({ index, field: "markdownBody", text: capped });
    }

    if (includeSafetyNote) {
      tasks.push({ index, field: "safetyNote", text: skill.safetyNote });
    }
  });

  const uniqueTexts = [...new Set(tasks.map((task) => task.text).filter((text) => !shouldSkipTranslation(locale, text)))];
  const translatedUnique = await translateTexts(locale, uniqueTexts);

  const translationMap = new Map<string, string>();
  uniqueTexts.forEach((text, idx) => {
    translationMap.set(text, translatedUnique[idx] ?? text);
  });

  return skills.map((skill, index) => {
    const next = { ...skill };
    const currentTasks = tasks.filter((task) => task.index === index);

    currentTasks.forEach((task) => {
      const translated = translationMap.get(task.text);
      if (!translated) return;

      if (task.field === "name") next.name = translated;
      if (task.field === "summary") next.summary = translated;
      if (task.field === "description") next.description = translated;
      if (task.field === "markdownBody") next.markdownBody = translated;
      if (task.field === "safetyNote") next.safetyNote = translated;
    });

    return next;
  });
}
