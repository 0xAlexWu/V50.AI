import { NextResponse } from "next/server";

import { getSkillDownloads, getSkillStars } from "@/lib/skill-signals";
import { getAllSkills } from "@/lib/skills";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

const ALLOWED_CATEGORIES = ["All", "Automation", "Coding", "General", "Research", "Security", "Web3"] as const;
const ALLOWED_SOURCES = ["all", "archived_source", "registry_source", "repository_source"] as const;
const ALLOWED_SIGNALS = ["all", "with_stars", "with_downloads", "with_both"] as const;
const ALLOWED_SORTS = ["recent", "name", "source", "stars", "downloads"] as const;

interface AiSearchRequestBody {
  prompt?: string;
  current?: {
    category?: string;
    source?: string;
    signal?: string;
    sort?: string;
    view?: string;
  };
}

interface AiFilters {
  q: string;
  category: (typeof ALLOWED_CATEGORIES)[number];
  source: (typeof ALLOWED_SOURCES)[number];
  signal: (typeof ALLOWED_SIGNALS)[number];
  sort: (typeof ALLOWED_SORTS)[number];
  reason: string;
}

function toAllowed<T extends readonly string[]>(value: string | undefined, allowed: T, fallback: T[number]): T[number] {
  return (allowed as readonly string[]).includes(value ?? "") ? (value as T[number]) : fallback;
}

function extractJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();

  const direct = (() => {
    try {
      return JSON.parse(trimmed) as Record<string, unknown>;
    } catch {
      return null;
    }
  })();
  if (direct) return direct;

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace < 0 || lastBrace <= firstBrace) return null;

  try {
    return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function heuristicFilters(prompt: string, current: AiSearchRequestBody["current"]): AiFilters {
  const lower = prompt.toLowerCase();

  let category: AiFilters["category"] = "All";
  if (/(security|安全|sec)/.test(lower)) category = "Security";
  else if (/(coding|code|dev|program|开发)/.test(lower)) category = "Coding";
  else if (/(research|study|论文|研究)/.test(lower)) category = "Research";
  else if (/(automation|workflow|自动化)/.test(lower)) category = "Automation";
  else if (/(web3|crypto|chain|区块链)/.test(lower)) category = "Web3";

  let signal: AiFilters["signal"] = "all";
  let sort: AiFilters["sort"] = "recent";

  const askStars = /(star|stars|标星|点赞)/.test(lower);
  const askDownloads = /(download|downloads|安装|下载)/.test(lower);

  if (askStars && askDownloads) {
    signal = "with_both";
    sort = "downloads";
  } else if (askStars) {
    signal = "with_stars";
    sort = "stars";
  } else if (askDownloads) {
    signal = "with_downloads";
    sort = "downloads";
  }

  return {
    q: prompt.trim().slice(0, 120),
    category: toAllowed(current?.category, ALLOWED_CATEGORIES, category),
    source: toAllowed(current?.source, ALLOWED_SOURCES, "all"),
    signal,
    sort,
    reason: "Fallback heuristic used due to model unavailability."
  };
}

function sanitizeFilters(parsed: Record<string, unknown>, prompt: string, current: AiSearchRequestBody["current"]): AiFilters {
  const fallback = heuristicFilters(prompt, current);

  const q = typeof parsed.q === "string" && parsed.q.trim() ? parsed.q.trim().slice(0, 120) : fallback.q;
  const category = toAllowed(typeof parsed.category === "string" ? parsed.category : undefined, ALLOWED_CATEGORIES, fallback.category);
  const source = toAllowed(typeof parsed.source === "string" ? parsed.source : undefined, ALLOWED_SOURCES, fallback.source);
  const signal = toAllowed(typeof parsed.signal === "string" ? parsed.signal : undefined, ALLOWED_SIGNALS, fallback.signal);
  const sort = toAllowed(typeof parsed.sort === "string" ? parsed.sort : undefined, ALLOWED_SORTS, fallback.sort);
  const reason =
    typeof parsed.reason === "string" && parsed.reason.trim()
      ? parsed.reason.trim().slice(0, 180)
      : "AI-generated filters.";

  return { q, category, source, signal, sort, reason };
}

async function askDeepSeek(prompt: string, current: AiSearchRequestBody["current"]): Promise<AiFilters> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured.");
  }

  const skills = await getAllSkills();
  const compactSkills = skills.slice(0, 120).map((skill) => ({
    slug: skill.slug,
    name: skill.name,
    category: skill.category,
    source: skill.sourceType,
    stars: getSkillStars(skill) ?? 0,
    downloads: getSkillDownloads(skill) ?? 0,
    tags: skill.tags.slice(0, 6),
    summary: skill.summary.slice(0, 120)
  }));

  const system = [
    "You are an AI query planner for a real OpenClaw skills directory.",
    "Return JSON only with keys: q, category, source, signal, sort, reason.",
    "Allowed category: All|Automation|Coding|General|Research|Security|Web3",
    "Allowed source: all|archived_source|registry_source|repository_source",
    "Allowed signal: all|with_stars|with_downloads|with_both",
    "Allowed sort: recent|name|source|stars|downloads",
    "Prefer stars/downloads sorting when user asks for popularity.",
    "Do not invent unavailable fields. Keep q concise."
  ].join("\n");

  const user = {
    request: prompt,
    currentFilters: current,
    skillsSample: compactSkills
  };

  const response = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
      temperature: 0.1,
      max_tokens: 280,
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(user) }
      ]
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} ${detail.slice(0, 160)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("DeepSeek API returned empty content.");
  }

  const parsed = extractJsonObject(content);
  if (!parsed) {
    throw new Error("DeepSeek response is not valid JSON.");
  }

  return sanitizeFilters(parsed, prompt, current);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AiSearchRequestBody;
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return NextResponse.json({ ok: false, error: "Prompt is required." }, { status: 400 });
    }

    try {
      const filters = await askDeepSeek(prompt, body.current);
      return NextResponse.json({ ok: true, filters, provider: "deepseek" });
    } catch {
      const filters = heuristicFilters(prompt, body.current);
      return NextResponse.json({ ok: true, filters, provider: "heuristic", fallback: true });
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }
}
