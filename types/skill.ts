export type SkillSourceType = "archived_source" | "registry_source" | "repository_source";

export type TrustLabel =
  | "Archived Source"
  | "Registry Source"
  | "Repository Source"
  | "Recently Updated"
  | "Needs Review";

export interface Skill {
  id: string;
  slug: string;
  registrySlug?: string;
  name: string;
  summary: string;
  description: string;
  category: string;
  tags: string[];
  sourceUrl: string;
  sourceType: SkillSourceType;
  author?: string;
  namespace?: string;
  updatedAt?: string;
  version?: string;
  trustLabels: TrustLabel[];
  installationUrl?: string;
  safetyNote: string;
  rawMarkdown: string;
  markdownBody: string;
  githubPath: string;
  githubStars?: number;
  downloads?: number;
  installsCurrent?: number;
  installsAllTime?: number;
  moderationVerdict?: string;
}

export interface SkillCollection {
  slug: string;
  title: string;
  description: string;
  skills: Skill[];
  totalCount?: number;
}
