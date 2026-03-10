import type { Skill } from "@/types/skill";

export function getSkillAuthorHandle(skill: Skill): string | undefined {
  const candidate = skill.author?.trim() || skill.namespace?.trim();
  return candidate || undefined;
}

export function normalizeAuthorHandle(input: string): string {
  return input.trim().replace(/^@+/, "").toLowerCase();
}

export function findAuthorSkills(skills: Skill[], authorParam: string): Skill[] {
  const normalized = normalizeAuthorHandle(authorParam);
  return skills.filter((skill) => {
    const handle = getSkillAuthorHandle(skill);
    if (!handle) return false;
    return normalizeAuthorHandle(handle) === normalized;
  });
}

export function getAuthorDisplayName(skills: Skill[], authorParam: string): string {
  const normalized = normalizeAuthorHandle(authorParam);
  const exact = skills.find((skill) => {
    const handle = getSkillAuthorHandle(skill);
    return handle && normalizeAuthorHandle(handle) === normalized;
  });

  return (exact ? getSkillAuthorHandle(exact) : undefined) ?? authorParam;
}
