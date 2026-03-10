import { NextResponse } from "next/server";

import { getAllSkills } from "@/lib/skills";

export const revalidate = 1800;

export async function GET() {
  const skills = await getAllSkills();

  return NextResponse.json({
    source: "clawhub.ai registry + openclaw/skills archive",
    count: skills.length,
    generatedAt: new Date().toISOString(),
    skills
  });
}
