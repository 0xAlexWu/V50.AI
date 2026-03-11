const SKILLS_SH_BASE = "https://skills.sh";
const DEFAULT_REVALIDATE_SECONDS = 60 * 30;

export interface SkillsShSkillItem {
  source: string;
  skillId: string;
  name: string;
  installs: number;
  installsYesterday?: number;
  change?: number;
}

interface SkillsShSkillsPageResponse {
  skills: SkillsShSkillItem[];
  hasMore: boolean;
}

export type SkillsShView = "all-time" | "trending" | "hot";

export interface FetchSkillsShAllOptions {
  view?: SkillsShView;
  maxPages?: number;
  concurrency?: number;
}

function parseNumeric(input: unknown): number | undefined {
  if (typeof input === "number" && Number.isFinite(input)) return input;
  if (typeof input === "string" && input.trim()) {
    const parsed = Number(input.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

async function fetchSkillsShJson<T>(path: string): Promise<T> {
  const response = await fetch(`${SKILLS_SH_BASE}${path}`, {
    headers: {
      Accept: "application/json"
    },
    next: { revalidate: DEFAULT_REVALIDATE_SECONDS }
  });

  if (!response.ok) {
    throw new Error(`skills.sh request failed (${response.status}): ${path}`);
  }

  return (await response.json()) as T;
}

async function fetchSkillsShText(path: string): Promise<string> {
  const response = await fetch(`${SKILLS_SH_BASE}${path}`, {
    next: { revalidate: DEFAULT_REVALIDATE_SECONDS }
  });

  if (!response.ok) {
    throw new Error(`skills.sh text request failed (${response.status}): ${path}`);
  }

  return response.text();
}

export async function fetchSkillsShPage(view: SkillsShView, page: number): Promise<SkillsShSkillsPageResponse> {
  const payload = await fetchSkillsShJson<SkillsShSkillsPageResponse>(`/api/skills/${view}/${page}`);
  return {
    skills: Array.isArray(payload.skills) ? payload.skills : [],
    hasMore: payload.hasMore === true
  };
}

export async function fetchSkillsShTotalCount(): Promise<number | undefined> {
  try {
    const html = await fetchSkillsShText("/");
    const matched = html.match(/\\"totalSkills\\":(\d+)/);
    return parseNumeric(matched?.[1]);
  } catch {
    return undefined;
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  worker: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  if (items.length === 0) return [];

  const output: R[] = [];
  const queue = [...items];

  const runners = Array.from({ length: Math.min(items.length, Math.max(1, concurrency)) }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (item === undefined) break;
      output.push(await worker(item));
    }
  });

  await Promise.all(runners);
  return output;
}

export async function fetchSkillsShAll({
  view = "all-time",
  maxPages = Number(process.env.SKILLS_SH_MAX_PAGES ?? "480"),
  concurrency = Number(process.env.SKILLS_SH_PAGE_CONCURRENCY ?? "12")
}: FetchSkillsShAllOptions = {}): Promise<{ skills: SkillsShSkillItem[]; totalCount?: number }> {
  const totalCount = await fetchSkillsShTotalCount().catch(() => undefined);
  const estimatedPagesFromTotal =
    typeof totalCount === "number" && totalCount > 0 ? Math.ceil(totalCount / 200) : undefined;

  const pageCount = Math.max(
    1,
    Math.min(
      maxPages,
      estimatedPagesFromTotal ?? maxPages
    )
  );

  const pages = Array.from({ length: pageCount }, (_, idx) => idx);
  const pageResults = await mapWithConcurrency(
    pages,
    async (page) => {
      try {
        const data = await fetchSkillsShPage(view, page);
        return { page, ...data };
      } catch {
        return {
          page,
          skills: [] as SkillsShSkillItem[],
          hasMore: page < 2
        };
      }
    },
    concurrency
  );

  const sorted = pageResults.sort((a, b) => a.page - b.page);
  const stopPage = sorted.find((entry) => entry.hasMore === false)?.page;

  const deduped = new Map<string, SkillsShSkillItem>();
  for (const entry of sorted) {
    if (typeof stopPage === "number" && entry.page > stopPage) break;
    for (const skill of entry.skills) {
      const source = typeof skill.source === "string" ? skill.source.trim() : "";
      const skillId = typeof skill.skillId === "string" ? skill.skillId.trim() : "";
      const name = typeof skill.name === "string" && skill.name.trim() ? skill.name.trim() : skillId;

      if (!source || !skillId || !name) continue;

      const key = `${source.toLowerCase()}::${skillId.toLowerCase()}`;
      deduped.set(key, {
        ...skill,
        source,
        skillId,
        name,
        installs: parseNumeric(skill.installs) ?? 0,
        installsYesterday: parseNumeric(skill.installsYesterday),
        change: parseNumeric(skill.change)
      });
    }
  }

  return {
    skills: [...deduped.values()],
    totalCount
  };
}

