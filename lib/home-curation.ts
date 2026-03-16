import { getSkillDownloads, getSkillStars } from "@/lib/skill-signals";
import type { Skill } from "@/types/skill";

function hasDownloads(skill: Skill): boolean {
  return (getSkillDownloads(skill) ?? 0) > 0;
}

function hasStars(skill: Skill): boolean {
  return (getSkillStars(skill) ?? 0) > 0;
}

function hasBothSignals(skill: Skill): boolean {
  return hasDownloads(skill) && hasStars(skill);
}

function daysSinceUpdate(skill: Skill): number | undefined {
  if (!skill.updatedAt) return undefined;
  const updatedTime = new Date(skill.updatedAt).getTime();
  if (!Number.isFinite(updatedTime)) return undefined;
  return Math.max(0, (Date.now() - updatedTime) / (1000 * 60 * 60 * 24));
}

function recencyBoost(skill: Skill): number {
  const days = daysSinceUpdate(skill);
  if (days === undefined) return 0;
  if (days <= 3) return 16;
  if (days <= 7) return 12;
  if (days <= 14) return 8;
  if (days <= 30) return 4;
  return 0;
}

function editorialReadiness(skill: Skill): number {
  const summaryScore = Math.min(skill.summary.trim().length, 180) / 12;
  const markdownScore = Math.min(skill.markdownBody.trim().length, 900) / 100;
  const signals = (getSkillStars(skill) ? 8 : 0) + (getSkillDownloads(skill) ? 8 : 0);
  const trustPenalty = skill.trustLabels.includes("Needs Review") ? -18 : 0;
  return summaryScore + markdownScore + signals + recencyBoost(skill) + trustPenalty;
}

function trendingMomentum(skill: Skill): number {
  const downloads = getSkillDownloads(skill) ?? 0;
  const stars = getSkillStars(skill) ?? 0;
  return Math.log10(downloads + 1) * 28 + Math.log10(stars + 1) * 22 + recencyBoost(skill);
}

function updatedTimestamp(skill: Skill): number {
  if (!skill.updatedAt) return 0;
  const timestamp = new Date(skill.updatedAt).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function uniqueBySlug(skills: Skill[]): Skill[] {
  const seen = new Set<string>();
  return skills.filter((skill) => {
    if (seen.has(skill.slug)) return false;
    seen.add(skill.slug);
    return true;
  });
}

function takeShowcaseSkills(limit: number, ...groups: Skill[][]): Skill[] {
  return uniqueBySlug(groups.flat()).slice(0, limit);
}

export function pickDailyRecommendations(skills: Skill[], limit = 5): Skill[] {
  const selectedCategories = new Set<string>();

  return uniqueBySlug(
    [...skills]
      .filter((skill) => !skill.trustLabels.includes("Needs Review"))
      .sort((a, b) => editorialReadiness(b) - editorialReadiness(a))
  ).filter((skill) => {
    if (selectedCategories.size >= limit) return false;
    if (selectedCategories.has(skill.category)) return false;
    selectedCategories.add(skill.category);
    return true;
  }).slice(0, limit);
}

export function pickTrendingSkills(skills: Skill[], limit = 8): Skill[] {
  return uniqueBySlug(
    [...skills]
      .filter((skill) => {
        const downloads = getSkillDownloads(skill) ?? 0;
        const stars = getSkillStars(skill) ?? 0;
        return downloads > 0 || stars > 0 || recencyBoost(skill) > 0;
      })
      .sort((a, b) => trendingMomentum(b) - trendingMomentum(a))
  ).slice(0, limit);
}

export function pickFeaturedSkills(skills: Skill[], limit = 8): Skill[] {
  const ranked = [...skills]
    .filter((skill) => !skill.trustLabels.includes("Needs Review"))
    .sort((a, b) => {
      const scoreDelta = editorialReadiness(b) - editorialReadiness(a);
      if (scoreDelta !== 0) return scoreDelta;
      return updatedTimestamp(b) - updatedTimestamp(a);
    });

  const strict = ranked.filter(hasBothSignals);
  const relaxed = ranked.filter((skill) => hasDownloads(skill) || hasStars(skill));

  return takeShowcaseSkills(limit, strict, relaxed, ranked);
}

export function pickTopDownloadedSkills(skills: Skill[], limit = 8): Skill[] {
  return uniqueBySlug(
    [...skills]
      .filter((skill) => (getSkillDownloads(skill) ?? 0) > 0)
      .sort((a, b) => {
        const downloadDelta = (getSkillDownloads(b) ?? 0) - (getSkillDownloads(a) ?? 0);
        if (downloadDelta !== 0) return downloadDelta;

        const starDelta = (getSkillStars(b) ?? 0) - (getSkillStars(a) ?? 0);
        if (starDelta !== 0) return starDelta;

        return updatedTimestamp(b) - updatedTimestamp(a);
      })
  ).slice(0, limit);
}

export function pickTopStarredSkills(skills: Skill[], limit = 8): Skill[] {
  return uniqueBySlug(
    [...skills]
      .filter((skill) => (getSkillStars(skill) ?? 0) > 0)
      .sort((a, b) => {
        const starDelta = (getSkillStars(b) ?? 0) - (getSkillStars(a) ?? 0);
        if (starDelta !== 0) return starDelta;

        const downloadDelta = (getSkillDownloads(b) ?? 0) - (getSkillDownloads(a) ?? 0);
        if (downloadDelta !== 0) return downloadDelta;

        return updatedTimestamp(b) - updatedTimestamp(a);
      })
  ).slice(0, limit);
}

export function pickLatestSkills(skills: Skill[], limit = 8): Skill[] {
  const ranked = [...skills]
    .filter((skill) => updatedTimestamp(skill) > 0)
    .sort((a, b) => updatedTimestamp(b) - updatedTimestamp(a));

  const strict = ranked.filter(hasBothSignals);
  const relaxed = ranked.filter((skill) => hasDownloads(skill) || hasStars(skill));
  const preferred = takeShowcaseSkills(limit, strict, relaxed);

  return preferred.length > 0 ? preferred : ranked.slice(0, limit);
}

export function pickRecentlyUpdatedSkills(skills: Skill[], limit = 8): Skill[] {
  const ranked = [...skills]
    .filter((skill) => updatedTimestamp(skill) > 0)
    .sort((a, b) => {
      const updatedDelta = updatedTimestamp(b) - updatedTimestamp(a);
      if (updatedDelta !== 0) return updatedDelta;

      const downloadDelta = (getSkillDownloads(b) ?? 0) - (getSkillDownloads(a) ?? 0);
      if (downloadDelta !== 0) return downloadDelta;

      return (getSkillStars(b) ?? 0) - (getSkillStars(a) ?? 0);
    });

  const strict = ranked.filter(hasBothSignals);
  const relaxed = ranked.filter((skill) => hasDownloads(skill) || hasStars(skill));

  return takeShowcaseSkills(limit, strict, relaxed);
}

export function pickSaferChoices(skills: Skill[], limit = 8): Skill[] {
  const ranked = [...skills]
    .filter(
      (skill) =>
        !skill.trustLabels.includes("Needs Review") &&
        (skill.markdownBody.length > 120 || skill.summary.length > 80)
    )
    .sort((a, b) => {
      const scoreDelta = editorialReadiness(b) - editorialReadiness(a);
      if (scoreDelta !== 0) return scoreDelta;
      return updatedTimestamp(b) - updatedTimestamp(a);
    });

  const strict = ranked.filter(hasBothSignals);
  const relaxed = ranked.filter((skill) => hasDownloads(skill) || hasStars(skill));

  return takeShowcaseSkills(limit, strict, relaxed, ranked);
}
