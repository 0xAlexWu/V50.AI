import type { Skill } from "@/types/skill";

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export function getSkillStars(skill: Skill): number | undefined {
  return toNumber(skill.githubStars);
}

export function getSkillDownloads(skill: Skill): number | undefined {
  const downloads = toNumber(skill.downloads);
  if (downloads !== undefined) return downloads;

  const installsAllTime = toNumber(skill.installsAllTime);
  if (installsAllTime !== undefined) return installsAllTime;

  const installsCurrent = toNumber(skill.installsCurrent);
  if (installsCurrent !== undefined) return installsCurrent;

  return undefined;
}
