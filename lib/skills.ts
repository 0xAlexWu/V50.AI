import {
  fetchRegistrySkillDetail,
  fetchRegistrySkillFile,
  fetchRegistrySkillsPaginated,
  type ClawHubSkillListItem
} from "@/lib/clawhub";
import { parseSkillMarkdown } from "@/lib/markdown";
import {
  fetchRawFile,
  fetchSkillsTree,
  skillPathToGitHubUrl
} from "@/lib/github";
import { fetchSkillsShAll, type SkillsShSkillItem } from "@/lib/skills-sh";
import { fetchSkillsMpAll, type SkillsMpSkillItem } from "@/lib/skillsmp";
import { getSkillDownloads, getSkillStars } from "@/lib/skill-signals";
import { safeDate, toTitleCase, unique } from "@/lib/utils";
import type { Skill, SkillSourceType, TrustLabel } from "@/types/skill";

const ROOT_SKILL_PATH_RE = /^skills\/[^/]+\/[^/]+\/SKILL\.md$/;
const MAX_ARCHIVE_SKILLS = Number(process.env.ARCHIVE_SKILLS_FETCH_LIMIT ?? "600");
const MAX_REGISTRY_SKILLS = Number(process.env.REGISTRY_SKILLS_FETCH_LIMIT ?? "60000");
const MAX_REGISTRY_PAGES = Number(process.env.REGISTRY_SKILLS_MAX_PAGES ?? "300");
const REGISTRY_AUTHOR_ENRICH_LIMIT = Number(process.env.REGISTRY_AUTHOR_ENRICH_LIMIT ?? "48");
const REGISTRY_AUTHOR_ENRICH_CONCURRENCY = Number(process.env.REGISTRY_AUTHOR_ENRICH_CONCURRENCY ?? "6");
const MAX_SKILLS_SH_SKILLS = Number(process.env.SKILLS_SH_FETCH_LIMIT ?? "200000");
const MAX_SKILLS_MP_SKILLS = Number(process.env.SKILLSMP_FETCH_LIMIT ?? "300000");
const SKILLS_SH_ENRICH_LIMIT = Number(process.env.SKILLS_SH_ENRICH_LIMIT ?? "180");
const SKILLS_SH_ENRICH_CONCURRENCY = Number(process.env.SKILLS_SH_ENRICH_CONCURRENCY ?? "8");
const ENABLE_SKILLS_SH = process.env.SKILLS_SH_ENABLED !== "false";
const ENABLE_SKILLS_MP = process.env.SKILLSMP_ENABLED !== "false";
const RECENT_DAYS = Number(process.env.RECENT_DAYS ?? "30");
const SKILLS_CACHE_TTL_MS = Number(process.env.SKILLS_CACHE_TTL_MS ?? `${60 * 15 * 1000}`);

interface RuntimeSkillsCache {
  value?: Skill[];
  expiresAt: number;
  inFlight?: Promise<Skill[]>;
}

declare global {
  var __v50SkillsCache: RuntimeSkillsCache | undefined;
}

function getRuntimeSkillsCache(): RuntimeSkillsCache {
  if (!globalThis.__v50SkillsCache) {
    globalThis.__v50SkillsCache = {
      value: undefined,
      expiresAt: 0,
      inFlight: undefined
    };
  }

  return globalThis.__v50SkillsCache;
}

interface SkillMetaFile {
  owner?: string;
  slug?: string;
  displayName?: string;
  latest?: {
    version?: string;
    publishedAt?: number;
    commit?: string;
  };
}

const skillsShMarkdownCache = new Map<string, string | null>();

interface SkillsShRenderedSnapshot {
  body?: string;
  stars?: number;
  installs?: number;
}

const skillsShRenderedContentCache = new Map<string, SkillsShRenderedSnapshot | null>();

function parseCategory(tags: string[], summary: string): string {
  const combined = `${tags.join(" ")} ${summary}`.toLowerCase();

  if (/(security|audit|threat|vulnerability|malware)/.test(combined)) return "Security";
  if (/(web3|crypto|chain|wallet|defi|nft)/.test(combined)) return "Web3";
  if (/(code|dev|program|typescript|python|github|cli)/.test(combined)) return "Coding";
  if (/(research|paper|analysis|academic|knowledge)/.test(combined)) return "Research";
  if (/(automation|workflow|agent|ops|scheduler|bot)/.test(combined)) return "Automation";
  return "General";
}

function parseTagsFromUnknown(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input
      .map((tag) => String(tag).trim())
      .filter(Boolean)
      .map((tag) => tag.toLowerCase());
  }

  if (typeof input === "string") {
    return input
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => tag.toLowerCase());
  }

  return [];
}

function parseFrontmatterTags(frontmatter: Record<string, unknown>): string[] {
  const metadata =
    typeof frontmatter.metadata === "object" && frontmatter.metadata !== null
      ? (frontmatter.metadata as Record<string, unknown>)
      : undefined;

  return unique([
    ...parseTagsFromUnknown(frontmatter.tags),
    ...parseTagsFromUnknown(metadata?.tags)
  ]);
}

function parseFrontmatterCategory(frontmatter: Record<string, unknown>): string | undefined {
  if (typeof frontmatter.category === "string" && frontmatter.category.trim()) {
    return frontmatter.category.trim();
  }

  const metadata =
    typeof frontmatter.metadata === "object" && frontmatter.metadata !== null
      ? (frontmatter.metadata as Record<string, unknown>)
      : undefined;

  if (typeof metadata?.category === "string" && metadata.category.trim()) {
    return metadata.category.trim();
  }

  return undefined;
}

function parseFrontmatterVersion(frontmatter: Record<string, unknown>): string | undefined {
  if (typeof frontmatter.version === "string" && frontmatter.version.trim()) {
    return frontmatter.version.trim();
  }

  const metadata =
    typeof frontmatter.metadata === "object" && frontmatter.metadata !== null
      ? (frontmatter.metadata as Record<string, unknown>)
      : undefined;

  if (typeof metadata?.version === "string" && metadata.version.trim()) {
    return metadata.version.trim();
  }

  return undefined;
}

function parseFrontmatterAuthor(frontmatter: Record<string, unknown>): string | undefined {
  const metadata =
    typeof frontmatter.metadata === "object" && frontmatter.metadata !== null
      ? (frontmatter.metadata as Record<string, unknown>)
      : undefined;

  if (typeof metadata?.author === "string" && metadata.author.trim()) {
    return metadata.author.trim();
  }

  return undefined;
}

function inferSummary(frontmatterDescription: unknown, excerpt: string, content: string): string {
  if (typeof frontmatterDescription === "string" && frontmatterDescription.trim()) {
    return frontmatterDescription.trim();
  }

  if (excerpt) return excerpt;

  const firstParagraph = content.split("\n\n").find((chunk) => chunk.trim().length > 20);
  return firstParagraph?.trim() ?? "No summary provided by source.";
}

function parseMeta(rawMeta: string | null): SkillMetaFile | null {
  if (!rawMeta) return null;

  try {
    return JSON.parse(rawMeta) as SkillMetaFile;
  } catch {
    return null;
  }
}

function computeTrustLabels(
  sourceType: SkillSourceType,
  updatedAt: Date | undefined,
  needsReview: boolean
): TrustLabel[] {
  const labels: TrustLabel[] = [
    sourceType === "registry_source"
      ? "Registry Source"
      : sourceType === "archived_source"
        ? "Archived Source"
        : "Repository Source"
  ];

  if (updatedAt) {
    const diffDays = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= RECENT_DAYS) labels.push("Recently Updated");
  }

  if (needsReview) labels.push("Needs Review");

  return unique(labels);
}

function sortByUpdated(a: Skill, b: Skill): number {
  const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
  const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
  return bTime - aTime;
}

function parseRegistryTags(tags: Record<string, string> | undefined): string[] {
  if (!tags) return [];

  const exploded = Object.keys(tags)
    .filter((tag) => tag.toLowerCase() !== "latest")
    .flatMap((tag) => tag.split(/[,|]/))
    .flatMap((chunk) => chunk.split(/\s+/))
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

  return unique(exploded);
}

function normalizeRegistrySkill(item: ClawHubSkillListItem): Skill {
  const tags = parseRegistryTags(item.tags);

  const updatedAt = safeDate(item.updatedAt ?? item.latestVersion?.createdAt);
  const summary = item.summary?.trim() || "No summary provided by registry.";
  const category = toTitleCase(parseCategory(tags, `${summary} ${item.displayName}`));
  const needsReview = summary.length < 20;

  return {
    id: `registry/${item.slug}`,
    slug: item.slug,
    registrySlug: item.slug,
    name: item.displayName?.trim() || toTitleCase(item.slug),
    summary,
    description: summary,
    category,
    tags,
    sourceUrl: `https://clawhub.ai/api/v1/skills/${encodeURIComponent(item.slug)}`,
    sourceType: "registry_source",
    author: undefined,
    namespace: undefined,
    updatedAt: updatedAt?.toISOString(),
    version: item.latestVersion?.version,
    trustLabels: computeTrustLabels("registry_source", updatedAt, needsReview),
    installationUrl: `https://clawhub.ai/skills/${encodeURIComponent(item.slug)}`,
    safetyNote:
      "This listing is from the official public ClawHub registry. Review SKILL.md and referenced scripts before running.",
    rawMarkdown: "",
    markdownBody: "",
    githubPath: "",
    githubStars: item.stats?.stars,
    downloads: item.stats?.downloads,
    installsCurrent: item.stats?.installsCurrent,
    installsAllTime: item.stats?.installsAllTime,
    moderationVerdict: undefined
  };
}

function isLikelyDomain(value: string): boolean {
  return !value.includes("/") && /^[a-z0-9]([a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(value);
}

function normalizeSlugPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildSkillsShSkillUrl(item: SkillsShSkillItem): string {
  const source = item.source.trim().toLowerCase();
  const skillId = normalizeSlugPart(item.skillId);

  if (source.includes("/")) {
    const [owner, repo] = source.split("/");
    if (owner && repo) return `https://skills.sh/${owner}/${repo}/${skillId}`;
  }

  if (isLikelyDomain(source)) {
    return `https://skills.sh/site/${source}/${skillId}`;
  }

  return `https://skills.sh/search?q=${encodeURIComponent(`${item.source} ${item.skillId}`)}`;
}

function normalizeSkillsShSkill(item: SkillsShSkillItem): Skill | null {
  const source = item.source.trim();
  const skillId = item.skillId.trim();
  const name = item.name.trim() || skillId;
  if (!source || !skillId || !name) return null;

  const summary = "No summary provided by upstream source.";
  const category = toTitleCase(parseCategory([], `${name} ${skillId} ${source}`));

  return {
    id: `skills-sh/${source}/${skillId}`.toLowerCase(),
    slug: `${source}--${skillId}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, ""),
    registrySlug: undefined,
    name,
    summary,
    description: summary,
    category,
    tags: unique(
      [skillId, ...source.split("/")]
        .map((token) => token.trim().toLowerCase())
        .filter(Boolean)
    ),
    sourceUrl: buildSkillsShSkillUrl(item),
    sourceType: "repository_source",
    author: source.includes("/") ? source.split("/")[0] : source,
    namespace: source,
    updatedAt: undefined,
    version: undefined,
    trustLabels: computeTrustLabels("repository_source", undefined, true),
    installationUrl: `https://skills.sh/search?q=${encodeURIComponent(`${source}/${skillId}`)}`,
    safetyNote:
      "This listing is imported from skills.sh public index metadata. Review upstream SKILL.md and repository scripts before running.",
    rawMarkdown: "",
    markdownBody: "",
    githubPath: `${source}/${skillId}`,
    githubStars: undefined,
    downloads: typeof item.installs === "number" ? item.installs : undefined,
    installsCurrent: undefined,
    installsAllTime: typeof item.installs === "number" ? item.installs : undefined,
    moderationVerdict: undefined
  };
}

function parseSkillsShGithubPath(githubPath: string): { owner: string; repo: string; skillId: string } | null {
  const parts = githubPath.split("/").map((part) => part.trim()).filter(Boolean);
  if (parts.length < 3) return null;
  const [owner, repo, ...skillIdParts] = parts;
  if (!owner || !repo || skillIdParts.length === 0) return null;
  return {
    owner,
    repo,
    skillId: skillIdParts.join("/")
  };
}

function deriveSkillsShSkillVariants(skillId: string, owner: string, repo: string): string[] {
  const trimmed = skillId.trim();
  const parts = trimmed.split("/").map((part) => part.trim()).filter(Boolean);
  const lastPart = parts[parts.length - 1] ?? trimmed;
  const ownerPrefix = owner.split("-")[0]?.toLowerCase();
  const repoPrefix = repo.split("-")[0]?.toLowerCase();

  const variants = new Set<string>();
  const addVariant = (value: string): void => {
    const normalized = value.trim();
    if (!normalized) return;
    variants.add(normalized);
    variants.add(normalizeSlugPart(normalized));
  };

  addVariant(trimmed);
  addVariant(lastPart);

  if (ownerPrefix && lastPart.toLowerCase().startsWith(`${ownerPrefix}-`)) {
    addVariant(lastPart.slice(ownerPrefix.length + 1));
  }

  if (repoPrefix && lastPart.toLowerCase().startsWith(`${repoPrefix}-`)) {
    addVariant(lastPart.slice(repoPrefix.length + 1));
  }

  const hyphenParts = lastPart.split("-").filter(Boolean);
  if (hyphenParts.length >= 3) {
    addVariant(hyphenParts.slice(1).join("-"));
  }

  return [...variants];
}

function buildSkillsShMarkdownPathCandidates(skillId: string, owner: string, repo: string): string[] {
  const variants = deriveSkillsShSkillVariants(skillId, owner, repo);
  const candidates: string[] = ["SKILL.md"];

  for (const variant of variants) {
    candidates.push(
      `skills/${variant}/SKILL.md`,
      `skill/${variant}/SKILL.md`,
      `${variant}/SKILL.md`
    );
  }

  return unique(candidates);
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function htmlToPlainText(value: string): string {
  return decodeHtmlEntities(
    value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|h1|h2|h3|h4|h5|h6|li|ul|ol|pre|code|table|tr|blockquote)>/gi, "\n")
      .replace(/<li[^>]*>/gi, "- ")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractSkillsShRenderedBody(html: string): string | null {
  const proseMatch =
    html.match(
      /<span>SKILL\.md<\/span><\/div><div class="prose[^"]*"[^>]*>([\s\S]*?)<\/div><\/div><\/div><div class=" ?lg:col-span-3">/i
    ) ??
    html.match(/<div class="prose[^"]*"[^>]*>([\s\S]*?)<\/div><\/div><\/div><div class=" ?lg:col-span-3">/i);

  if (!proseMatch) return null;
  const plain = htmlToPlainText(proseMatch[1]);
  return plain.length >= 20 ? plain : null;
}

function parseCompactMetric(rawValue: string): number | undefined {
  const cleaned = rawValue.trim().replace(/,/g, "");
  if (!cleaned || cleaned === "-") return undefined;
  const matched = cleaned.match(/^([\d.]+)\s*([kmb]|万|亿)?$/i);
  if (!matched) {
    const plain = Number(cleaned);
    return Number.isFinite(plain) ? plain : undefined;
  }

  const base = Number(matched[1]);
  if (!Number.isFinite(base)) return undefined;
  const unit = (matched[2] ?? "").toLowerCase();

  if (unit === "k") return Math.round(base * 1_000);
  if (unit === "m") return Math.round(base * 1_000_000);
  if (unit === "b") return Math.round(base * 1_000_000_000);
  if (unit === "万") return Math.round(base * 10_000);
  if (unit === "亿") return Math.round(base * 100_000_000);
  return Math.round(base);
}

function extractSkillsShRenderedMetrics(html: string): Pick<SkillsShRenderedSnapshot, "stars" | "installs"> {
  const weeklyInstallsMatch = html.match(/Weekly Installs<\/span><\/div><div[^>]*>([^<]+)<\/div>/i);
  const starsMatch = html.match(/GitHub Stars<\/span><\/div><div[^>]*>[\s\S]*?<span>([^<]+)<\/span>/i);

  return {
    installs: weeklyInstallsMatch ? parseCompactMetric(weeklyInstallsMatch[1]) : undefined,
    stars: starsMatch ? parseCompactMetric(starsMatch[1]) : undefined
  };
}

async function fetchSkillsShMarkdownFromGitHub(githubPath: string): Promise<string | null> {
  const cached = skillsShMarkdownCache.get(githubPath);
  if (cached !== undefined) return cached;

  const parsed = parseSkillsShGithubPath(githubPath);
  if (!parsed) {
    skillsShMarkdownCache.set(githubPath, null);
    return null;
  }

  const token = process.env.GITHUB_TOKEN?.trim();
  const headers: HeadersInit = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const branches = ["main", "master"];
  const candidates = buildSkillsShMarkdownPathCandidates(parsed.skillId, parsed.owner, parsed.repo);

  for (const branch of branches) {
    for (const candidate of candidates) {
      const url = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${branch}/${candidate}`;
      try {
        const response = await fetch(url, {
          headers,
          next: { revalidate: 60 * 30 }
        });
        if (!response.ok) continue;
        const text = await response.text();
        if (text.trim().length < 20) continue;
        skillsShMarkdownCache.set(githubPath, text);
        return text;
      } catch {
        // ignore and try next candidate
      }
    }
  }

  skillsShMarkdownCache.set(githubPath, null);
  return null;
}

async function fetchSkillsShRenderedContent(
  source: string,
  skillId: string
): Promise<SkillsShRenderedSnapshot | null> {
  const cacheKey = `${source}/${skillId}`.toLowerCase();
  const cached = skillsShRenderedContentCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const url = `https://skills.sh/${source}/${skillId}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 60 * 30 }
    });

    if (!response.ok) {
      skillsShRenderedContentCache.set(cacheKey, null);
      return null;
    }

    const html = await response.text();
    const body = extractSkillsShRenderedBody(html) ?? undefined;
    const { stars, installs } = extractSkillsShRenderedMetrics(html);
    const snapshot = body || stars !== undefined || installs !== undefined
      ? { body, stars, installs }
      : null;

    skillsShRenderedContentCache.set(cacheKey, snapshot);
    return snapshot;
  } catch {
    skillsShRenderedContentCache.set(cacheKey, null);
    return null;
  }
}

async function enrichSkillsShSkill(skill: Skill): Promise<Skill> {
  if (!skill.id.startsWith("skills-sh/")) return skill;
  if (skill.markdownBody) return skill;
  if (!skill.githubPath) return skill;

  const parsedPath = parseSkillsShGithubPath(skill.githubPath);
  if (!parsedPath) return skill;

  const renderedSnapshot = await fetchSkillsShRenderedContent(
    `${parsedPath.owner}/${parsedPath.repo}`,
    parsedPath.skillId
  );
  const resolvedStars = skill.githubStars ?? renderedSnapshot?.stars;
  const resolvedDownloads =
    skill.downloads ??
    skill.installsAllTime ??
    skill.installsCurrent ??
    renderedSnapshot?.installs;

  const rawSkill = await fetchSkillsShMarkdownFromGitHub(skill.githubPath);
  if (!rawSkill) {
    const renderedContent = renderedSnapshot?.body;
    if (!renderedContent) {
      if (resolvedStars === undefined && resolvedDownloads === undefined) return skill;
      return {
        ...skill,
        githubStars: resolvedStars,
        downloads: resolvedDownloads
      };
    }

    const summary = inferSummary("", "", renderedContent);
    const category = toTitleCase(parseCategory(skill.tags, summary));
    const updatedAt = skill.updatedAt ? new Date(skill.updatedAt) : undefined;
    const needsReview = summary.length < 20 || renderedContent.length < 20;

    return {
      ...skill,
      summary,
      description: renderedContent,
      category,
      rawMarkdown: renderedContent,
      markdownBody: renderedContent,
      githubStars: resolvedStars,
      downloads: resolvedDownloads,
      trustLabels: computeTrustLabels("repository_source", updatedAt, needsReview)
    };
  }

  const parsed = parseSkillMarkdown(rawSkill);
  const frontmatter = parsed.data;
  const tags = unique([...skill.tags, ...parseFrontmatterTags(frontmatter)]);
  const summary = inferSummary(frontmatter.description, parsed.excerpt, parsed.content || skill.summary);
  const category = toTitleCase(parseFrontmatterCategory(frontmatter) ?? parseCategory(tags, summary));
  const updatedAt = skill.updatedAt ? new Date(skill.updatedAt) : undefined;
  const needsReview = summary.length < 20 || parsed.content.length < 20;

  return {
    ...skill,
    name:
      (typeof frontmatter.name === "string" && frontmatter.name.trim()) ||
      skill.name,
    summary,
    description: parsed.content || skill.description,
    category,
    tags,
    version: parseFrontmatterVersion(frontmatter) ?? skill.version,
    author: parseFrontmatterAuthor(frontmatter) ?? skill.author,
    rawMarkdown: rawSkill,
    markdownBody: parsed.content,
    githubStars: resolvedStars,
    downloads: resolvedDownloads,
    trustLabels: computeTrustLabels("repository_source", updatedAt, needsReview)
  };
}

async function enrichSkillsShForListing(skills: Skill[]): Promise<Skill[]> {
  if (skills.length === 0) return skills;

  const limit = Math.max(0, Math.min(SKILLS_SH_ENRICH_LIMIT, skills.length));
  if (limit === 0) return skills;

  const result = [...skills];
  const concurrency = Math.max(1, SKILLS_SH_ENRICH_CONCURRENCY);

  for (let start = 0; start < limit; start += concurrency) {
    const end = Math.min(limit, start + concurrency);
    const chunk = await Promise.all(
      result.slice(start, end).map((skill) => enrichSkillsShSkill(skill))
    );

    for (let i = 0; i < chunk.length; i += 1) {
      result[start + i] = chunk[i];
    }
  }

  return result;
}

function normalizeSkillsMpSkill(item: SkillsMpSkillItem): Skill | null {
  const name = item.name?.trim();
  if (!name) return null;

  const namespace = item.namespace?.trim() || item.author?.trim();
  const baseSlug =
    item.slug?.trim() ||
    `${namespace ?? "skillsmp"}-${name}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-");
  const summary =
    item.summary?.trim() ||
    item.description?.trim() ||
    "Indexed from SkillsMP metadata feed. Upstream detail metadata was not provided.";
  const tags = unique([...(item.tags ?? []), ...(namespace ? [namespace] : [])].map((tag) => tag.toLowerCase()));
  const category = toTitleCase(item.category?.trim() || parseCategory(tags, `${name} ${summary}`));
  const updatedAt = safeDate(item.updatedAt);

  return {
    id: `skillsmp/${namespace ?? "unknown"}/${baseSlug}`.toLowerCase(),
    slug: normalizeSlugPart(`skillsmp-${namespace ?? "unknown"}-${baseSlug}`),
    registrySlug: undefined,
    name,
    summary,
    description: summary,
    category,
    tags,
    sourceUrl:
      item.sourceUrl?.trim() ||
      `https://skillsmp.com/search?q=${encodeURIComponent(`${namespace ?? ""} ${name}`.trim())}`,
    sourceType: "repository_source",
    author: item.author?.trim(),
    namespace,
    updatedAt: updatedAt?.toISOString(),
    version: undefined,
    trustLabels: computeTrustLabels("repository_source", updatedAt, true),
    installationUrl: item.installUrl?.trim() || item.sourceUrl?.trim(),
    safetyNote:
      "This listing is imported from SkillsMP metadata and should be treated as untrusted until upstream source review is completed.",
    rawMarkdown: "",
    markdownBody: "",
    githubPath: "",
    githubStars: item.stars,
    downloads: item.downloads,
    installsCurrent: undefined,
    installsAllTime: item.downloads,
    moderationVerdict: undefined
  };
}

async function enrichRegistrySkill(skill: Skill): Promise<Skill> {
  if (!skill.registrySlug) return skill;

  try {
    const [detail, skillMarkdown] = await Promise.all([
      fetchRegistrySkillDetail(skill.registrySlug),
      fetchRegistrySkillFile(skill.registrySlug, "SKILL.md")
    ]);

    let merged: Skill = {
      ...skill,
      author: detail?.owner?.handle ?? skill.author,
      namespace: detail?.owner?.handle ?? skill.namespace,
      version: detail?.latestVersion?.version ?? skill.version
    };

    if (detail?.moderation?.verdict) {
      merged.moderationVerdict = detail.moderation.verdict;

      const isFlagged =
        detail.moderation.isSuspicious === true ||
        detail.moderation.isMalwareBlocked === true ||
        detail.moderation.verdict !== "clean";

      if (isFlagged) {
        merged.trustLabels = unique([...merged.trustLabels, "Needs Review"]);
      }
    }

    if (skillMarkdown) {
      const parsed = parseSkillMarkdown(skillMarkdown);
      const frontmatter = parsed.data;

      const tags = unique([...merged.tags, ...parseFrontmatterTags(frontmatter)]);
      const category = parseFrontmatterCategory(frontmatter) ?? parseCategory(tags, merged.summary);
      const version = parseFrontmatterVersion(frontmatter) ?? merged.version;
      const author = parseFrontmatterAuthor(frontmatter) ?? merged.author;
      const summary = inferSummary(frontmatter.description, parsed.excerpt, parsed.content || merged.summary);

      merged = {
        ...merged,
        name:
          (typeof frontmatter.name === "string" && frontmatter.name.trim()) ||
          merged.name,
        summary,
        description: parsed.content || merged.description,
        category: toTitleCase(category),
        tags,
        version,
        author,
        namespace: author ?? merged.namespace,
        rawMarkdown: skillMarkdown,
        markdownBody: parsed.content,
        trustLabels: computeTrustLabels(
          "registry_source",
          merged.updatedAt ? new Date(merged.updatedAt) : undefined,
          merged.trustLabels.includes("Needs Review") || summary.length < 20
        )
      };
    }

    return merged;
  } catch {
    return skill;
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  worker: (item: T) => Promise<R | null>,
  concurrency = 12
): Promise<R[]> {
  const queue = [...items];
  const output: R[] = [];

  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;

      try {
        const mapped = await worker(item);
        if (mapped !== null) output.push(mapped);
      } catch {
        // Skip malformed upstream records instead of failing the whole ingestion.
      }
    }
  });

  await Promise.all(runners);

  return output;
}

async function normalizeArchiveSkill(skillPath: string): Promise<Skill | null> {
  const parts = skillPath.split("/");
  if (parts.length < 4) return null;

  const ownerFromPath = parts[1];
  const slugFromPath = parts[2];
  const rootBasePath = `skills/${ownerFromPath}/${slugFromPath}`;

  let rawSkill: string;
  try {
    rawSkill = await fetchRawFile(skillPath);
  } catch {
    return null;
  }

  try {
    const rawMeta = await fetchRawFile(`${rootBasePath}/_meta.json`).catch(() => null);
    const meta = parseMeta(rawMeta);

    const parsed = parseSkillMarkdown(rawSkill);
    const frontmatter = parsed.data;

    const owner = meta?.owner ?? ownerFromPath;
    const baseSlug =
      (typeof frontmatter.name === "string" && frontmatter.name.trim()) ||
      meta?.slug ||
      slugFromPath;

    const name =
      (typeof frontmatter.name === "string" && frontmatter.name.trim()) ||
      meta?.displayName ||
      toTitleCase(baseSlug);

    const summary = inferSummary(frontmatter.description, parsed.excerpt, parsed.content);
    const tags = parseFrontmatterTags(frontmatter);
    const category = parseFrontmatterCategory(frontmatter) ?? parseCategory(tags, summary);
    const updatedAt = safeDate(meta?.latest?.publishedAt);
    const version = parseFrontmatterVersion(frontmatter) ?? meta?.latest?.version;
    const needsReview = summary.length < 20 || parsed.content.length < 20;

    return {
      id: `archive/${owner ?? "unknown"}/${baseSlug}`.toLowerCase(),
      slug: `${owner ?? "unknown"}--${baseSlug}`
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, ""),
      registrySlug: slugFromPath,
      name,
      summary,
      description: summary,
      category: toTitleCase(String(category)),
      tags,
      sourceUrl: skillPathToGitHubUrl(skillPath),
      sourceType: "archived_source",
      author: parseFrontmatterAuthor(frontmatter) ?? owner,
      namespace: owner,
      updatedAt: updatedAt?.toISOString(),
      version,
      trustLabels: computeTrustLabels("archived_source", updatedAt, needsReview),
      installationUrl: `https://clawhub.ai/search?q=${encodeURIComponent(baseSlug)}`,
      safetyNote:
        "This item is sourced from the public archived skills repository. Treat as untrusted until reviewed.",
      rawMarkdown: "",
      markdownBody: "",
      githubPath: skillPath,
      githubStars: undefined,
      downloads: undefined,
      installsCurrent: undefined,
      installsAllTime: undefined,
      moderationVerdict: undefined
    };
  } catch {
    return null;
  }
}

async function enrichArchiveSkill(skill: Skill): Promise<Skill> {
  if (!skill.githubPath) return skill;

  try {
    const rawSkill = await fetchRawFile(skill.githubPath);
    const parsed = parseSkillMarkdown(rawSkill);
    const frontmatter = parsed.data;

    const tags = unique([...skill.tags, ...parseFrontmatterTags(frontmatter)]);
    const category = parseFrontmatterCategory(frontmatter) ?? parseCategory(tags, skill.summary);
    const summary = inferSummary(frontmatter.description, parsed.excerpt, parsed.content || skill.summary);

    return {
      ...skill,
      name:
        (typeof frontmatter.name === "string" && frontmatter.name.trim()) ||
        skill.name,
      summary,
      description: parsed.content || skill.description,
      category: toTitleCase(category),
      tags,
      version: parseFrontmatterVersion(frontmatter) ?? skill.version,
      author: parseFrontmatterAuthor(frontmatter) ?? skill.author,
      rawMarkdown: rawSkill,
      markdownBody: parsed.content
    };
  } catch {
    return skill;
  }
}

async function fetchArchiveSkills(): Promise<Skill[]> {
  try {
    const tree = await fetchSkillsTree();

    const skillPaths = tree
      .filter((node) => node.type === "blob" && ROOT_SKILL_PATH_RE.test(node.path))
      .map((node) => node.path)
      .slice(0, MAX_ARCHIVE_SKILLS);

    const normalized = await mapWithConcurrency(
      skillPaths,
      (path) => normalizeArchiveSkill(path),
      12
    );

    return normalized.sort(sortByUpdated);
  } catch {
    return [];
  }
}

async function enrichRegistrySkillsForListing(skills: Skill[]): Promise<Skill[]> {
  const toEnrich = skills.slice(0, REGISTRY_AUTHOR_ENRICH_LIMIT);
  const remainder = skills.slice(REGISTRY_AUTHOR_ENRICH_LIMIT);

  const enriched = await mapWithConcurrency(
    toEnrich,
    async (skill) => {
      if (!skill.registrySlug) return skill;

      const detail = await fetchRegistrySkillDetail(skill.registrySlug);
      if (!detail) return skill;

      const author = detail.owner?.handle ?? detail.owner?.displayName ?? skill.author;
      const moderationVerdict = detail.moderation?.verdict ?? skill.moderationVerdict;

      const isFlagged =
        detail.moderation?.isSuspicious === true ||
        detail.moderation?.isMalwareBlocked === true ||
        (detail.moderation?.verdict ? detail.moderation.verdict !== "clean" : false);

      const trustLabels: TrustLabel[] = isFlagged
        ? unique<TrustLabel>([...skill.trustLabels, "Needs Review"])
        : skill.trustLabels;

      return {
        ...skill,
        author,
        namespace: author ?? skill.namespace,
        moderationVerdict,
        trustLabels
      };
    },
    REGISTRY_AUTHOR_ENRICH_CONCURRENCY
  );

  return [...enriched, ...remainder].sort(sortByUpdated);
}

async function fetchRegistrySkillsNormalized(): Promise<Skill[]> {
  try {
    let items = await fetchRegistrySkillsPaginated({
      limit: 200,
      maxPages: MAX_REGISTRY_PAGES,
      maxItems: MAX_REGISTRY_SKILLS
    });

    // ClawHub occasionally returns an empty page transiently; retry once before degrading to archive-only.
    if (items.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      items = await fetchRegistrySkillsPaginated({
        limit: 200,
        maxPages: MAX_REGISTRY_PAGES,
        maxItems: MAX_REGISTRY_SKILLS
      });
    }

    const normalized = items.map(normalizeRegistrySkill).sort(sortByUpdated);
    return enrichRegistrySkillsForListing(normalized);
  } catch {
    return [];
  }
}

async function fetchSkillsShSkillsNormalized(): Promise<Skill[]> {
  if (!ENABLE_SKILLS_SH) return [];

  try {
    const { skills } = await fetchSkillsShAll({ view: "all-time" });
    const normalized = skills
      .map((item) => normalizeSkillsShSkill(item))
      .filter((item): item is Skill => Boolean(item))
      .slice(0, MAX_SKILLS_SH_SKILLS);
    return enrichSkillsShForListing(normalized);
  } catch {
    return [];
  }
}

async function fetchSkillsMpSkillsNormalized(): Promise<Skill[]> {
  if (!ENABLE_SKILLS_MP) return [];

  try {
    const { skills } = await fetchSkillsMpAll();
    return skills
      .map((item) => normalizeSkillsMpSkill(item))
      .filter((item): item is Skill => Boolean(item))
      .slice(0, MAX_SKILLS_MP_SKILLS);
  } catch {
    return [];
  }
}

function sourcePriority(skill: Skill): number {
  if (skill.sourceType === "registry_source") return 3;
  if (skill.sourceType === "repository_source") return 2;
  return 1;
}

function canonicalSkillKey(skill: Skill): string {
  if (skill.registrySlug) return `registry:${skill.registrySlug.toLowerCase()}`;

  const author = (skill.author ?? skill.namespace ?? "").trim().toLowerCase();
  const name = normalizeSlugPart(skill.name || skill.slug);
  if (author && name) return `author:${author}::name:${name}`;

  const slug = normalizeSlugPart(skill.slug);
  if (slug) return `slug:${slug}`;

  return skill.id.toLowerCase();
}

function shouldReplaceExistingSkill(existing: Skill, candidate: Skill): boolean {
  const existingPriority = sourcePriority(existing);
  const candidatePriority = sourcePriority(candidate);
  if (candidatePriority !== existingPriority) return candidatePriority > existingPriority;

  const existingTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
  const candidateTime = candidate.updatedAt ? new Date(candidate.updatedAt).getTime() : 0;
  return candidateTime > existingTime;
}

function mergeSkillRecord(primary: Skill, fallback: Skill): Skill {
  const shouldUseFallbackSummary =
    !primary.summary ||
    primary.summary === "No summary provided by source." ||
    primary.summary === "No summary provided by upstream source.";
  const shouldUseFallbackDescription =
    !primary.description ||
    primary.description === primary.summary;

  return {
    ...primary,
    author: primary.author ?? fallback.author,
    namespace: primary.namespace ?? fallback.namespace,
    summary: shouldUseFallbackSummary ? fallback.summary : primary.summary,
    description: shouldUseFallbackDescription ? fallback.description : primary.description,
    rawMarkdown: primary.rawMarkdown || fallback.rawMarkdown,
    markdownBody: primary.markdownBody || fallback.markdownBody,
    githubPath: primary.githubPath || fallback.githubPath,
    installationUrl: primary.installationUrl || fallback.installationUrl,
    githubStars: primary.githubStars ?? fallback.githubStars,
    downloads: primary.downloads ?? fallback.downloads,
    installsCurrent: primary.installsCurrent ?? fallback.installsCurrent,
    installsAllTime: primary.installsAllTime ?? fallback.installsAllTime,
    moderationVerdict: primary.moderationVerdict ?? fallback.moderationVerdict,
    tags: unique([...(primary.tags ?? []), ...(fallback.tags ?? [])]),
    trustLabels: unique([...primary.trustLabels, ...fallback.trustLabels])
  };
}

function dedupeAcrossSources(skills: Skill[]): Skill[] {
  const byKey = new Map<string, Skill>();

  for (const skill of skills) {
    const key = canonicalSkillKey(skill);
    const existing = byKey.get(key);

    if (!existing) {
      byKey.set(key, skill);
      continue;
    }

    if (shouldReplaceExistingSkill(existing, skill)) {
      byKey.set(key, mergeSkillRecord(skill, existing));
      continue;
    }

    byKey.set(key, mergeSkillRecord(existing, skill));
  }

  return [...byKey.values()];
}

async function fetchAndNormalizeSkills(): Promise<Skill[]> {
  const [registryResult, skillsShResult, skillsMpResult, archiveResult] = await Promise.allSettled([
    fetchRegistrySkillsNormalized(),
    fetchSkillsShSkillsNormalized(),
    fetchSkillsMpSkillsNormalized(),
    fetchArchiveSkills()
  ]);

  const registrySkills = registryResult.status === "fulfilled" ? registryResult.value : [];
  const skillsShSkills = skillsShResult.status === "fulfilled" ? skillsShResult.value : [];
  const skillsMpSkills = skillsMpResult.status === "fulfilled" ? skillsMpResult.value : [];
  const archiveSkills = archiveResult.status === "fulfilled" ? archiveResult.value : [];

  const registrySlugs = new Set(registrySkills.map((skill) => skill.registrySlug ?? skill.slug));
  const archiveWithoutDup = archiveSkills.filter(
    (skill) => !skill.registrySlug || !registrySlugs.has(skill.registrySlug)
  );

  return dedupeAcrossSources([
    ...registrySkills,
    ...skillsShSkills,
    ...skillsMpSkills,
    ...archiveWithoutDup
  ]).sort(sortByUpdated);
}

export function invalidateSkillsCache(): void {
  const cache = getRuntimeSkillsCache();
  cache.expiresAt = 0;
  cache.inFlight = undefined;
}

export interface SkillsSourceStats {
  total: number;
  bySourceType: Record<SkillSourceType, number>;
  byProvider: {
    clawhubRegistry: number;
    openclawArchive: number;
    skillsSh: number;
    skillsMp: number;
  };
}

export async function getAllSkills(): Promise<Skill[]> {
  const cache = getRuntimeSkillsCache();
  const now = Date.now();

  if (cache.value && now < cache.expiresAt) {
    return cache.value;
  }

  if (cache.inFlight) {
    return cache.inFlight;
  }

  cache.inFlight = fetchAndNormalizeSkills()
    .then((skills) => {
      cache.value = skills;
      cache.expiresAt = Date.now() + SKILLS_CACHE_TTL_MS;
      return skills;
    })
    .catch((error) => {
      if (cache.value) {
        cache.expiresAt = Date.now() + Math.min(SKILLS_CACHE_TTL_MS, 60 * 1000);
        return cache.value;
      }

      throw error;
    })
    .finally(() => {
      cache.inFlight = undefined;
    });

  return cache.inFlight;
}

export async function getSkillsSourceStats(): Promise<SkillsSourceStats> {
  const skills = await getAllSkills();

  const bySourceType: Record<SkillSourceType, number> = {
    archived_source: 0,
    registry_source: 0,
    repository_source: 0
  };

  const byProvider = {
    clawhubRegistry: 0,
    openclawArchive: 0,
    skillsSh: 0,
    skillsMp: 0
  };

  for (const skill of skills) {
    bySourceType[skill.sourceType] += 1;

    if (skill.id.startsWith("registry/")) byProvider.clawhubRegistry += 1;
    else if (skill.id.startsWith("archive/")) byProvider.openclawArchive += 1;
    else if (skill.id.startsWith("skills-sh/")) byProvider.skillsSh += 1;
    else if (skill.id.startsWith("skillsmp/")) byProvider.skillsMp += 1;
  }

  return {
    total: skills.length,
    bySourceType,
    byProvider
  };
}

export async function getSkillBySlug(slug: string): Promise<Skill | undefined> {
  const all = await getAllSkills();
  const base = all.find((skill) => skill.slug === slug);

  if (!base) return undefined;
  if (base.sourceType === "registry_source") return enrichRegistrySkill(base);
  if (base.sourceType === "archived_source") return enrichArchiveSkill(base);
  if (base.sourceType === "repository_source" && base.id.startsWith("skills-sh/")) {
    return enrichSkillsShSkill(base);
  }
  return base;
}

export interface SkillsQuery {
  q?: string;
  category?: string;
  source?: SkillSourceType | "all";
  signal?: "all" | "with_stars" | "with_downloads" | "with_both";
  sort?: "recent" | "name" | "source" | "stars" | "downloads";
}

export function querySkills(skills: Skill[], query: SkillsQuery): Skill[] {
  const keyword = query.q?.trim().toLowerCase();

  let output = skills.filter((skill) => {
    const matchesKeyword = !keyword
      ? true
      : [
          skill.name,
          skill.summary,
          skill.description,
          skill.author,
          skill.category,
          skill.tags.join(" ")
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

    const matchesCategory =
      !query.category || query.category === "All" ? true : skill.category === query.category;

    const matchesSource = !query.source || query.source === "all" ? true : skill.sourceType === query.source;
    const stars = getSkillStars(skill);
    const downloads = getSkillDownloads(skill);
    const matchesSignal =
      !query.signal || query.signal === "all"
        ? true
        : query.signal === "with_stars"
          ? typeof stars === "number" && stars > 0
          : query.signal === "with_downloads"
            ? typeof downloads === "number" && downloads > 0
            : typeof stars === "number" &&
              stars > 0 &&
              typeof downloads === "number" &&
              downloads > 0;

    return matchesKeyword && matchesCategory && matchesSource && matchesSignal;
  });

  switch (query.sort) {
    case "name":
      output = [...output].sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "source":
      output = [...output].sort((a, b) => a.sourceType.localeCompare(b.sourceType));
      break;
    case "stars":
      output = [...output].sort((a, b) => (getSkillStars(b) ?? 0) - (getSkillStars(a) ?? 0));
      break;
    case "downloads":
      output = [...output].sort((a, b) => (getSkillDownloads(b) ?? 0) - (getSkillDownloads(a) ?? 0));
      break;
    case "recent":
    default:
      output = [...output].sort(sortByUpdated);
  }

  return output;
}

export function getCategories(skills: Skill[]): string[] {
  return ["All", ...unique(skills.map((skill) => skill.category).sort((a, b) => a.localeCompare(b)))];
}

export function pickRelatedSkills(allSkills: Skill[], baseSkill: Skill, limit = 3): Skill[] {
  const baseTags = new Set(baseSkill.tags);

  return allSkills
    .filter((skill) => skill.slug !== baseSkill.slug)
    .map((skill) => {
      const sharedTags = skill.tags.filter((tag) => baseTags.has(tag)).length;
      const sameCategory = skill.category === baseSkill.category ? 1 : 0;
      return { skill, score: sharedTags * 2 + sameCategory };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.skill);
}
