const SKILLS_MP_BASE = process.env.SKILLSMP_BASE_URL?.trim() || "https://skillsmp.com";
const DEFAULT_REVALIDATE_SECONDS = 60 * 30;

export interface SkillsMpSkillItem {
  id?: string;
  slug?: string;
  name: string;
  summary?: string;
  description?: string;
  author?: string;
  namespace?: string;
  category?: string;
  tags?: string[];
  stars?: number;
  downloads?: number;
  updatedAt?: string;
  sourceUrl?: string;
  installUrl?: string;
}

interface SkillsMpPageResult {
  items: SkillsMpSkillItem[];
  hasMore: boolean;
  total?: number;
}

function parseNumber(input: unknown): number | undefined {
  if (typeof input === "number" && Number.isFinite(input)) return input;
  if (typeof input === "string" && input.trim()) {
    const parsed = Number(input.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function parseString(input: unknown): string | undefined {
  if (typeof input !== "string") return undefined;
  const trimmed = input.trim();
  return trimmed ? trimmed : undefined;
}

function parseTags(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input
      .map((value) => parseString(value))
      .filter((value): value is string => Boolean(value))
      .map((value) => value.toLowerCase());
  }

  if (typeof input === "string") {
    return input
      .split(/[,\s|]+/)
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
  }

  return [];
}

function parseSkillsArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (typeof payload !== "object" || payload === null) return [];

  const root = payload as Record<string, unknown>;
  if (Array.isArray(root.skills)) return root.skills;
  if (Array.isArray(root.data)) return root.data;
  if (Array.isArray(root.items)) return root.items;
  if (root.result && typeof root.result === "object" && root.result !== null) {
    const result = root.result as Record<string, unknown>;
    if (Array.isArray(result.skills)) return result.skills;
    if (Array.isArray(result.items)) return result.items;
    if (Array.isArray(result.data)) return result.data;
  }

  return [];
}

function normalizeSkillsMpItem(raw: unknown): SkillsMpSkillItem | null {
  if (typeof raw !== "object" || raw === null) return null;
  const item = raw as Record<string, unknown>;

  const name =
    parseString(item.name) ??
    parseString(item.title) ??
    parseString(item.display_name) ??
    parseString(item.displayName);
  if (!name) return null;

  return {
    id: parseString(item.id),
    slug: parseString(item.slug),
    name,
    summary: parseString(item.summary) ?? parseString(item.description),
    description: parseString(item.description),
    author:
      parseString(item.author) ??
      parseString(item.owner) ??
      parseString(item.publisher) ??
      parseString(item.creator),
    namespace: parseString(item.namespace) ?? parseString(item.owner),
    category: parseString(item.category),
    tags: parseTags(item.tags),
    stars:
      parseNumber(item.stars) ??
      parseNumber(item.star_count) ??
      parseNumber(item.github_stars),
    downloads:
      parseNumber(item.downloads) ??
      parseNumber(item.installs) ??
      parseNumber(item.install_count),
    updatedAt:
      parseString(item.updated_at) ??
      parseString(item.updatedAt) ??
      parseString(item.last_updated),
    sourceUrl:
      parseString(item.url) ??
      parseString(item.source_url) ??
      parseString(item.sourceUrl),
    installUrl:
      parseString(item.install_url) ??
      parseString(item.installUrl)
  };
}

function extractHasMore(payload: unknown, itemCount: number, pageLimit: number): boolean {
  if (typeof payload !== "object" || payload === null) return itemCount >= pageLimit;

  const root = payload as Record<string, unknown>;
  if (typeof root.hasMore === "boolean") return root.hasMore;
  if (typeof root.has_more === "boolean") return root.has_more;

  const metaCandidates = [root.meta, root.pagination, root.page_info, root.result];
  for (const candidate of metaCandidates) {
    if (typeof candidate !== "object" || candidate === null) continue;
    const meta = candidate as Record<string, unknown>;
    if (typeof meta.hasMore === "boolean") return meta.hasMore;
    if (typeof meta.has_more === "boolean") return meta.has_more;
    const totalPages = parseNumber(meta.total_pages) ?? parseNumber(meta.totalPages);
    const page = parseNumber(meta.page) ?? parseNumber(meta.current_page) ?? parseNumber(meta.currentPage);
    if (typeof totalPages === "number" && typeof page === "number") {
      return page < totalPages;
    }
  }

  return itemCount >= pageLimit;
}

function extractTotal(payload: unknown): number | undefined {
  if (typeof payload !== "object" || payload === null) return undefined;

  const root = payload as Record<string, unknown>;
  const direct =
    parseNumber(root.total) ??
    parseNumber(root.total_count) ??
    parseNumber(root.totalCount) ??
    parseNumber(root.count);
  if (typeof direct === "number") return direct;

  const metaCandidates = [root.meta, root.pagination, root.page_info, root.result];
  for (const candidate of metaCandidates) {
    if (typeof candidate !== "object" || candidate === null) continue;
    const meta = candidate as Record<string, unknown>;
    const found =
      parseNumber(meta.total) ??
      parseNumber(meta.total_count) ??
      parseNumber(meta.totalCount) ??
      parseNumber(meta.count);
    if (typeof found === "number") return found;
  }

  return undefined;
}

async function fetchSkillsMpJson(path: string): Promise<unknown> {
  const apiKey = process.env.SKILLSMP_API_KEY?.trim();
  const response = await fetch(`${SKILLS_MP_BASE}${path}`, {
    headers: {
      Accept: "application/json",
      ...(apiKey ? { "x-api-key": apiKey, Authorization: `Bearer ${apiKey}` } : {})
    },
    next: { revalidate: DEFAULT_REVALIDATE_SECONDS }
  });

  if (!response.ok) {
    throw new Error(`SkillsMP request failed (${response.status}): ${path}`);
  }

  return response.json();
}

async function fetchSkillsMpPage(page: number, limit: number): Promise<SkillsMpPageResult> {
  const candidates = [
    `/api/skills?page=${page}&limit=${limit}&sort_by=downloads`,
    `/api/search?page=${page}&limit=${limit}&sort_by=downloads`,
    `/api/v1/skills?page=${page}&limit=${limit}&sort=downloads`,
    `/api/v1/search?page=${page}&limit=${limit}&sort=downloads`
  ];

  for (const path of candidates) {
    try {
      const payload = await fetchSkillsMpJson(path);
      const items = parseSkillsArray(payload)
        .map((entry) => normalizeSkillsMpItem(entry))
        .filter((entry): entry is SkillsMpSkillItem => Boolean(entry));

      if (items.length === 0) continue;

      return {
        items,
        hasMore: extractHasMore(payload, items.length, limit),
        total: extractTotal(payload)
      };
    } catch {
      // try next endpoint
    }
  }

  return { items: [], hasMore: false };
}

async function fetchSkillsMpPublicCount(): Promise<number | undefined> {
  try {
    const response = await fetch(SKILLS_MP_BASE, {
      next: { revalidate: DEFAULT_REVALIDATE_SECONDS }
    });
    if (!response.ok) return undefined;

    const html = await response.text();
    const direct = html.match(/const\s+skills\s*=\s*([0-9,]+)/i)?.[1];
    if (direct) {
      const parsed = parseNumber(direct);
      if (typeof parsed === "number") return parsed;
    }

    const generic = html.match(/([0-9]{1,3}(?:,[0-9]{3})+)\s+skills/i)?.[1];
    return parseNumber(generic);
  } catch {
    return undefined;
  }
}

export interface FetchSkillsMpAllOptions {
  maxPages?: number;
  pageSize?: number;
}

export async function fetchSkillsMpAll({
  maxPages = Number(process.env.SKILLSMP_MAX_PAGES ?? "300"),
  pageSize = Number(process.env.SKILLSMP_PAGE_SIZE ?? "100")
}: FetchSkillsMpAllOptions = {}): Promise<{ skills: SkillsMpSkillItem[]; totalCount?: number }> {
  const deduped = new Map<string, SkillsMpSkillItem>();
  let hasMore = true;
  let page = 1;
  let totalCount: number | undefined;

  while (hasMore && page <= maxPages) {
    const result = await fetchSkillsMpPage(page, pageSize);
    if (result.items.length === 0) break;

    if (typeof result.total === "number") totalCount = result.total;
    for (const item of result.items) {
      const key =
        item.id?.toLowerCase() ??
        item.slug?.toLowerCase() ??
        `${(item.author ?? item.namespace ?? "unknown").toLowerCase()}::${item.name.toLowerCase()}`;
      if (!deduped.has(key)) deduped.set(key, item);
    }

    hasMore = result.hasMore;
    page += 1;
  }

  if (typeof totalCount !== "number") {
    totalCount = await fetchSkillsMpPublicCount();
  }

  return {
    skills: [...deduped.values()],
    totalCount
  };
}

