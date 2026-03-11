import type { Skill, SkillCollection } from "@/types/skill";

const COLLECTION_PREVIEW_LIMIT = 12;

function includesAny(skill: Skill, terms: string[]): boolean {
  const haystack = `${skill.name} ${skill.summary} ${skill.description} ${skill.tags.join(" ")} ${skill.category}`.toLowerCase();
  return terms.some((term) => haystack.includes(term));
}

export function buildCollections(skills: Skill[]): SkillCollection[] {
  const recentlyUpdatedAll = [...skills]
    .sort((a, b) => {
      const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bTime - aTime;
    });
  const researchAll = skills.filter((skill) =>
    includesAny(skill, ["research", "analysis", "paper", "study", "knowledge"])
  );
  const codingAll = skills.filter((skill) =>
    includesAny(skill, ["code", "dev", "program", "typescript", "python", "github", "cli"])
  );
  const automationAll = skills.filter((skill) =>
    includesAny(skill, ["automation", "workflow", "agent", "bot", "scheduler"])
  );
  const securityAll = skills.filter((skill) =>
    includesAny(skill, ["security", "audit", "threat", "malware", "vulnerability"])
  );
  const web3All = skills.filter((skill) =>
    includesAny(skill, ["web3", "crypto", "wallet", "defi", "nft", "chain"])
  );

  const collections: SkillCollection[] = [
    {
      slug: "recently-updated",
      title: "Recently Updated",
      description: "Real skills ordered by latest publish metadata from the archive.",
      skills: recentlyUpdatedAll.slice(0, COLLECTION_PREVIEW_LIMIT),
      totalCount: recentlyUpdatedAll.length
    },
    {
      slug: "research",
      title: "Research Skills",
      description: "Skills related to analysis, papers, and exploration workflows.",
      skills: researchAll.slice(0, COLLECTION_PREVIEW_LIMIT),
      totalCount: researchAll.length
    },
    {
      slug: "coding",
      title: "Coding Skills",
      description: "Engineering and development-focused assistant skills.",
      skills: codingAll.slice(0, COLLECTION_PREVIEW_LIMIT),
      totalCount: codingAll.length
    },
    {
      slug: "automation",
      title: "Automation Skills",
      description: "Workflow and process automation skills.",
      skills: automationAll.slice(0, COLLECTION_PREVIEW_LIMIT),
      totalCount: automationAll.length
    },
    {
      slug: "security",
      title: "Security-Related Skills",
      description: "Security-oriented entries that require careful review before use.",
      skills: securityAll.slice(0, COLLECTION_PREVIEW_LIMIT),
      totalCount: securityAll.length
    },
    {
      slug: "web3",
      title: "Web3 Skills",
      description: "On-chain and crypto-adjacent skills from the public ecosystem.",
      skills: web3All.slice(0, COLLECTION_PREVIEW_LIMIT),
      totalCount: web3All.length
    }
  ];

  return collections.filter((collection) => (collection.totalCount ?? collection.skills.length) > 0);
}
