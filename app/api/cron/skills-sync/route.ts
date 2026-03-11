import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { getAllSkills, getSkillsSourceStats, invalidateSkillsCache } from "@/lib/skills";

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) {
    // In local/dev without CRON_SECRET, allow manual trigger.
    return true;
  }

  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag("skills");
  invalidateSkillsCache();

  // Warm freshly invalidated cache so regular users don't pay the first-load penalty.
  const [skills, stats] = await Promise.all([getAllSkills(), getSkillsSourceStats()]);

  return NextResponse.json({
    ok: true,
    refreshedAt: new Date().toISOString(),
    count: skills.length,
    stats
  });
}
