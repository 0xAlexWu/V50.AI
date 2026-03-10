import type { Skill } from "@/types/skill";

export function getSkillStars(skill: Skill): number | undefined {
  if (typeof skill.githubStars !== "number") return undefined;
  return skill.githubStars;
}

export function getSkillDownloads(skill: Skill): number | undefined {
  if (typeof skill.downloads === "number") return skill.downloads;
  if (typeof skill.installsAllTime === "number") return skill.installsAllTime;
  if (typeof skill.installsCurrent === "number") return skill.installsCurrent;
  return undefined;
}
