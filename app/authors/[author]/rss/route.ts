import { getAuthorDisplayName, findAuthorSkills } from "@/lib/authors";
import { getAllSkills } from "@/lib/skills";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ author: string }> }
) {
  const { author } = await params;
  const skills = await getAllSkills();
  const authorSkills = findAuthorSkills(skills, author)
    .sort((a, b) => {
      const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 40);

  if (authorSkills.length === 0) {
    return new Response("Not Found", { status: 404 });
  }

  const authorName = getAuthorDisplayName(skills, author);
  const baseUrl = "https://v50.ai";
  const now = new Date().toUTCString();

  const items = authorSkills
    .map((skill) => {
      const link = `${baseUrl}/skills/${encodeURIComponent(skill.slug)}`;
      const pubDate = skill.updatedAt ? new Date(skill.updatedAt).toUTCString() : now;

      return `
        <item>
          <title>${escapeXml(skill.name)}</title>
          <link>${escapeXml(link)}</link>
          <guid>${escapeXml(link)}</guid>
          <description>${escapeXml(skill.summary)}</description>
          <pubDate>${pubDate}</pubDate>
        </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(`V50.ai - ${authorName} skills`)}</title>
    <link>${baseUrl}/authors/${encodeURIComponent(authorName)}</link>
    <description>${escapeXml(`Latest skills by ${authorName}`)}</description>
    <lastBuildDate>${now}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "s-maxage=900, stale-while-revalidate=86400"
    }
  });
}
