import { NextRequest, NextResponse } from "next/server";

import { getAllSkills, getSkillsSourceStats } from "@/lib/skills";

export const revalidate = 1800;

function parsePositiveInt(input: string | null, fallback: number): number {
  if (!input) return fallback;
  const value = Number(input);
  if (!Number.isFinite(value) || value < 0) return fallback;
  return Math.floor(value);
}

export async function GET(request: NextRequest) {
  const [skills, stats] = await Promise.all([getAllSkills(), getSkillsSourceStats()]);
  const limit = parsePositiveInt(request.nextUrl.searchParams.get("limit"), 500);
  const offset = parsePositiveInt(request.nextUrl.searchParams.get("offset"), 0);
  const full = request.nextUrl.searchParams.get("full") === "1";
  const data = full ? skills : skills.slice(offset, offset + limit);

  return NextResponse.json({
    source: "clawhub.ai registry + openclaw/skills archive + skills.sh + skillsmp",
    count: skills.length,
    offset: full ? 0 : offset,
    limit: full ? skills.length : limit,
    hasMore: full ? false : offset + limit < skills.length,
    stats,
    generatedAt: new Date().toISOString(),
    skills: data
  });
}
