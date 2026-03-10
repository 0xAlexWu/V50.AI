import { unstable_cache } from "next/cache";

import {
  fetchRegistrySkillDetail,
  fetchRegistrySkillFile,
  fetchRegistrySkills,
  type ClawHubSkillListItem
} from "@/lib/clawhub";
import { parseSkillMarkdown } from "@/lib/markdown";
import {
  fetchRawFile,
  fetchSkillsTree,
  skillPathToGitHubUrl
} from "@/lib/github";
import { getSkillDownloads, getSkillStars } from "@/lib/skill-signals";
import { safeDate, toTitleCase, unique } from "@/lib/utils";
import type { Skill, SkillSourceType, TrustLabel } from "@/types/skill";

const ROOT_SKILL_PATH_RE = /^skills\/[^/]+\/[^/]+\/SKILL\.md$/;
const MAX_ARCHIVE_SKILLS = Number(process.env.ARCHIVE_SKILLS_FETCH_LIMIT ?? "120");
const MAX_REGISTRY_SKILLS = Number(process.env.REGISTRY_SKILLS_FETCH_LIMIT ?? "200");
const REGISTRY_AUTHOR_ENRICH_LIMIT = Number(process.env.REGISTRY_AUTHOR_ENRICH_LIMIT ?? "48");
const REGISTRY_AUTHOR_ENRICH_CONCURRENCY = Number(process.env.REGISTRY_AUTHOR_ENRICH_CONCURRENCY ?? "6");
const RECENT_DAYS = Number(process.env.RECENT_DAYS ?? "30");

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
  const labels: TrustLabel[] = [sourceType === "registry_source" ? "Registry Source" : "Archived Source"];

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
    let items = await fetchRegistrySkills(MAX_REGISTRY_SKILLS);

    // ClawHub occasionally returns an empty page transiently; retry once before degrading to archive-only.
    if (items.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      items = await fetchRegistrySkills(MAX_REGISTRY_SKILLS);
    }

    const normalized = items.map(normalizeRegistrySkill).sort(sortByUpdated);
    return enrichRegistrySkillsForListing(normalized);
  } catch {
    return [];
  }
}

async function fetchAndNormalizeSkills(): Promise<Skill[]> {
  const [registryResult, archiveResult] = await Promise.allSettled([
    fetchRegistrySkillsNormalized(),
    fetchArchiveSkills()
  ]);

  const registrySkills = registryResult.status === "fulfilled" ? registryResult.value : [];
  const archiveSkills = archiveResult.status === "fulfilled" ? archiveResult.value : [];

  const registrySlugs = new Set(registrySkills.map((skill) => skill.registrySlug ?? skill.slug));
  const archiveWithoutDup = archiveSkills.filter(
    (skill) => !skill.registrySlug || !registrySlugs.has(skill.registrySlug)
  );

  return [...registrySkills, ...archiveWithoutDup].sort(sortByUpdated);
}

const cachedSkills = unstable_cache(fetchAndNormalizeSkills, ["openclaw-skills-catalog-v4"], {
  revalidate: 60 * 15,
  tags: ["skills"]
});

export async function getAllSkills(): Promise<Skill[]> {
  return cachedSkills();
}

export async function getSkillBySlug(slug: string): Promise<Skill | undefined> {
  const all = await getAllSkills();
  const base = all.find((skill) => skill.slug === slug);

  if (!base) return undefined;
  if (base.sourceType === "registry_source") return enrichRegistrySkill(base);
  if (base.sourceType === "archived_source") return enrichArchiveSkill(base);
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
