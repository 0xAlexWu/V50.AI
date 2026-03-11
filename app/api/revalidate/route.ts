import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { invalidateSkillsCache } from "@/lib/skills";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag("skills");
  invalidateSkillsCache();
  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
