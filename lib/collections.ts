import type { Skill, SkillCollection } from "@/types/skill";

function includesAny(skill: Skill, terms: string[]): boolean {
  const haystack = `${skill.name} ${skill.summary} ${skill.description} ${skill.tags.join(" ")} ${skill.category}`.toLowerCase();
  return terms.some((term) => haystack.includes(term));
}

export function buildCollections(skills: Skill[]): SkillCollection[] {
  const recentlyUpdated = [...skills]
    .sort((a, b) => {
      const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 12);

  const collections: SkillCollection[] = [
    {
      slug: "recently-updated",
      title: "Recently Updated",
      description: "Real skills ordered by latest publish metadata from the archive.",
      skills: recentlyUpdated
    },
    {
      slug: "research",
      title: "Research Skills",
      description: "Skills related to analysis, papers, and exploration workflows.",
      skills: skills.filter((skill) => includesAny(skill, ["research", "analysis", "paper", "study", "knowledge"])).slice(0, 12)
    },
    {
      slug: "coding",
      title: "Coding Skills",
      description: "Engineering and development-focused assistant skills.",
      skills: skills.filter((skill) => includesAny(skill, ["code", "dev", "program", "typescript", "python", "github", "cli"])).slice(0, 12)
    },
    {
      slug: "automation",
      title: "Automation Skills",
      description: "Workflow and process automation skills.",
      skills: skills.filter((skill) => includesAny(skill, ["automation", "workflow", "agent", "bot", "scheduler"])).slice(0, 12)
    },
    {
      slug: "security",
      title: "Security-Related Skills",
      description: "Security-oriented entries that require careful review before use.",
      skills: skills.filter((skill) => includesAny(skill, ["security", "audit", "threat", "malware", "vulnerability"])).slice(0, 12)
    },
    {
      slug: "web3",
      title: "Web3 Skills",
      description: "On-chain and crypto-adjacent skills from the public ecosystem.",
      skills: skills.filter((skill) => includesAny(skill, ["web3", "crypto", "wallet", "defi", "nft", "chain"])).slice(0, 12)
    }
  ];

  return collections.filter((collection) => collection.skills.length > 0);
}
