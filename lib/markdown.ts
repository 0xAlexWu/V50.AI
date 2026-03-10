import matter from "gray-matter";

export interface ParsedSkillMarkdown {
  data: Record<string, unknown>;
  content: string;
  excerpt: string;
}

export function parseSkillMarkdown(raw: string): ParsedSkillMarkdown {
  const parsed = matter(raw, {
    excerpt: true,
    excerpt_separator: "\n\n"
  });

  return {
    data: parsed.data ?? {},
    content: parsed.content?.trim() ?? "",
    excerpt: parsed.excerpt?.trim() ?? ""
  };
}
