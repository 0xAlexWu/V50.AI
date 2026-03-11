const CLAWHUB_BASE = "https://clawhub.ai";
const DEFAULT_REVALIDATE_SECONDS = 60 * 15;

interface ClawHubListResponse {
  items: ClawHubSkillListItem[];
  nextCursor: string | null;
}

export interface ClawHubSkillListItem {
  slug: string;
  displayName: string;
  summary: string;
  tags?: Record<string, string>;
  stats?: {
    comments?: number;
    downloads?: number;
    installsAllTime?: number;
    installsCurrent?: number;
    stars?: number;
    versions?: number;
  };
  createdAt?: number;
  updatedAt?: number;
  latestVersion?: {
    version?: string;
    createdAt?: number;
    changelog?: string;
    license?: string | null;
  };
  metadata?: {
    os?: string[] | null;
    systems?: string[] | null;
  } | null;
}

export interface ClawHubSkillDetail {
  skill: ClawHubSkillListItem;
  latestVersion?: {
    version?: string;
    createdAt?: number;
    changelog?: string;
    license?: string | null;
  };
  owner?: {
    handle?: string;
    displayName?: string;
    image?: string | null;
  };
  moderation?: {
    isSuspicious?: boolean;
    isMalwareBlocked?: boolean;
    verdict?: string;
    reasonCodes?: string[];
    summary?: string | null;
    updatedAt?: number;
  } | null;
}

async function fetchClawHubJson<T>(path: string): Promise<T> {
  const response = await fetch(`${CLAWHUB_BASE}${path}`, {
    headers: {
      Accept: "application/json"
    },
    next: { revalidate: DEFAULT_REVALIDATE_SECONDS }
  });

  if (!response.ok) {
    throw new Error(`ClawHub request failed (${response.status}): ${path}`);
  }

  return (await response.json()) as T;
}

export async function fetchRegistrySkillsPage(
  limit = 200,
  cursor?: string
): Promise<ClawHubListResponse> {
  const basePath = `/api/v1/skills?limit=${limit}&sort=updated`;
  const path = cursor ? `${basePath}&cursor=${encodeURIComponent(cursor)}` : basePath;
  const data = await fetchClawHubJson<ClawHubListResponse>(path);
  return {
    items: data.items ?? [],
    nextCursor: data.nextCursor ?? null
  };
}

export async function fetchRegistrySkills(limit = 200): Promise<ClawHubSkillListItem[]> {
  const data = await fetchRegistrySkillsPage(limit);
  return data.items ?? [];
}

export interface FetchRegistrySkillsPaginatedOptions {
  limit?: number;
  maxPages?: number;
  maxItems?: number;
}

export async function fetchRegistrySkillsPaginated({
  limit = 200,
  maxPages = 300,
  maxItems = 60000
}: FetchRegistrySkillsPaginatedOptions = {}): Promise<ClawHubSkillListItem[]> {
  const items: ClawHubSkillListItem[] = [];
  const seenCursors = new Set<string>();

  let cursor: string | undefined;
  for (let page = 0; page < maxPages; page += 1) {
    const data = await fetchRegistrySkillsPage(limit, cursor);
    if (!data.items.length) break;

    items.push(...data.items);
    if (items.length >= maxItems) break;

    if (!data.nextCursor || seenCursors.has(data.nextCursor)) break;

    seenCursors.add(data.nextCursor);
    cursor = data.nextCursor;
  }

  return items.slice(0, maxItems);
}

export async function fetchRegistrySkillDetail(slug: string): Promise<ClawHubSkillDetail | null> {
  try {
    return await fetchClawHubJson<ClawHubSkillDetail>(`/api/v1/skills/${encodeURIComponent(slug)}`);
  } catch {
    return null;
  }
}

export async function fetchRegistrySkillFile(slug: string, path = "SKILL.md"): Promise<string | null> {
  const url = `${CLAWHUB_BASE}/api/v1/skills/${encodeURIComponent(slug)}/file?path=${encodeURIComponent(path)}`;
  const response = await fetch(url, {
    headers: {
      Accept: "text/plain"
    },
    next: { revalidate: DEFAULT_REVALIDATE_SECONDS }
  });

  if (!response.ok) return null;

  return response.text();
}
