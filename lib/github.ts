const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_RAW_BASE = "https://raw.githubusercontent.com";

const DEFAULT_REVALIDATE_SECONDS = 60 * 30;

export const OPENCLAW_SKILLS_REPO = {
  owner: "openclaw",
  repo: "skills",
  branch: "main"
} as const;

interface GitTreeNode {
  path: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
}

interface GitTreeResponse {
  sha: string;
  tree: GitTreeNode[];
  truncated: boolean;
}

interface GitHubRepository {
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  pushed_at: string;
  updated_at: string;
}

export interface RepoSignals {
  stars: number;
  forks: number;
  htmlUrl: string;
  pushedAt: string;
  updatedAt: string;
}

function githubHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;

  return {
    Accept: "application/vnd.github+json",
    "User-Agent": "v50-ai-skill-store",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function fetchGitHubJson<T>(
  path: string,
  revalidate = DEFAULT_REVALIDATE_SECONDS
): Promise<T> {
  const response = await fetch(`${GITHUB_API_BASE}${path}`, {
    headers: githubHeaders(),
    next: { revalidate }
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed (${response.status}): ${path}`);
  }

  return (await response.json()) as T;
}

export async function fetchRepoSignals(): Promise<RepoSignals> {
  const repo = await fetchGitHubJson<GitHubRepository>(
    `/repos/${OPENCLAW_SKILLS_REPO.owner}/${OPENCLAW_SKILLS_REPO.repo}`
  );

  return {
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    htmlUrl: repo.html_url,
    pushedAt: repo.pushed_at,
    updatedAt: repo.updated_at
  };
}

export async function fetchSkillsTree(): Promise<GitTreeNode[]> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${OPENCLAW_SKILLS_REPO.owner}/${OPENCLAW_SKILLS_REPO.repo}/git/trees/${OPENCLAW_SKILLS_REPO.branch}?recursive=1`,
    {
      headers: githubHeaders(),
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error(
      `GitHub request failed (${response.status}): /repos/${OPENCLAW_SKILLS_REPO.owner}/${OPENCLAW_SKILLS_REPO.repo}/git/trees/${OPENCLAW_SKILLS_REPO.branch}?recursive=1`
    );
  }

  const data = (await response.json()) as GitTreeResponse;

  return data.tree;
}

export async function fetchRawFile(path: string): Promise<string> {
  const url = `${GITHUB_RAW_BASE}/${OPENCLAW_SKILLS_REPO.owner}/${OPENCLAW_SKILLS_REPO.repo}/${OPENCLAW_SKILLS_REPO.branch}/${path}`;

  const response = await fetch(url, {
    headers: {
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {})
    },
    next: { revalidate: DEFAULT_REVALIDATE_SECONDS }
  });

  if (!response.ok) {
    throw new Error(`Raw file request failed (${response.status}): ${path}`);
  }

  return response.text();
}

export function skillPathToGitHubUrl(path: string): string {
  return `https://github.com/${OPENCLAW_SKILLS_REPO.owner}/${OPENCLAW_SKILLS_REPO.repo}/blob/${OPENCLAW_SKILLS_REPO.branch}/${path}`;
}
