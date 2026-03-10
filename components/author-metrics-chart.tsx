import { getSkillDownloads, getSkillStars } from "@/lib/skill-signals";
import { formatCompactNumber } from "@/lib/utils";
import type { Skill } from "@/types/skill";

interface AuthorMetricsChartProps {
  skills: Skill[];
  locale: string;
  starsLabel: string;
  downloadsLabel: string;
}

interface ChartEntry {
  id: string;
  name: string;
  stars: number;
  downloads: number;
  score: number;
}

export function AuthorMetricsChart({
  skills,
  locale,
  starsLabel,
  downloadsLabel
}: AuthorMetricsChartProps) {
  const entries: ChartEntry[] = skills
    .map((skill) => {
      const stars = getSkillStars(skill) ?? 0;
      const downloads = getSkillDownloads(skill) ?? 0;
      return {
        id: skill.id,
        name: skill.name,
        stars,
        downloads,
        score: stars + downloads
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  if (entries.length === 0) return null;

  const maxStars = Math.max(...entries.map((entry) => entry.stars), 1);
  const maxDownloads = Math.max(...entries.map((entry) => entry.downloads), 1);

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
      {entries.map((entry) => (
        <div key={entry.id} className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-sm">
            <p className="line-clamp-1 font-semibold text-slate-900">{entry.name}</p>
            <p className="text-xs text-slate-500">{formatCompactNumber(entry.score, locale)}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="w-[82px]">{starsLabel}</span>
              <div className="h-2 flex-1 rounded-full bg-muted/65">
                <div
                  className="h-2 rounded-full bg-sky-500/75"
                  style={{ width: `${Math.max((entry.stars / maxStars) * 100, entry.stars > 0 ? 7 : 0)}%` }}
                />
              </div>
              <span className="w-[48px] text-right">{formatCompactNumber(entry.stars, locale)}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="w-[82px]">{downloadsLabel}</span>
              <div className="h-2 flex-1 rounded-full bg-muted/65">
                <div
                  className="h-2 rounded-full bg-emerald-500/75"
                  style={{
                    width: `${Math.max((entry.downloads / maxDownloads) * 100, entry.downloads > 0 ? 7 : 0)}%`
                  }}
                />
              </div>
              <span className="w-[48px] text-right">{formatCompactNumber(entry.downloads, locale)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
