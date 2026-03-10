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

export async function fetchRegistrySkills(limit = 200): Promise<ClawHubSkillListItem[]> {
  const data = await fetchClawHubJson<ClawHubListResponse>(`/api/v1/skills?limit=${limit}&sort=updated`);
  return data.items ?? [];
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
