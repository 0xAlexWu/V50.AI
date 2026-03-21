"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Download,
  Minus,
  Star,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  formatMessage,
  getCategoryLabel,
  getTrustLabel,
  type Locale,
  type Messages
} from "@/lib/i18n";
import { getSkillDownloads, getSkillStars } from "@/lib/skill-signals";
import { formatCompactNumber } from "@/lib/utils";
import type { Skill } from "@/types/skill";

interface HomeStorefrontProps {
  dailyPicks: Skill[];
  trendingByDownloads: Skill[];
  trendingByStars: Skill[];
  trendingLatest: Skill[];
  totalSkills: number;
  locale: Locale;
  messages: Messages;
}

type TrendMode = "downloads" | "stars" | "latest";
type RankSnapshot = Record<TrendMode, Record<string, number>>;

const TREND_SNAPSHOT_STORAGE_KEY = "v50-home-trend-snapshots-v1";

interface CategoryPalette {
  shell: string;
  glowA: string;
  glowB: string;
  glowC: string;
  border: string;
  accentText: string;
  accentSurface: string;
}

const paletteByCategory: Record<string, CategoryPalette> = {
  Automation: {
    shell: "linear-gradient(135deg, rgba(221,231,255,0.98), rgba(255,225,212,0.96) 52%, rgba(255,235,176,0.94))",
    glowA: "rgba(84, 109, 255, 0.44)",
    glowB: "rgba(255, 138, 94, 0.32)",
    glowC: "rgba(255, 201, 72, 0.24)",
    border: "rgba(117, 137, 255, 0.2)",
    accentText: "#4457b7",
    accentSurface: "rgba(103,123,255,0.1)"
  },
  Coding: {
    shell: "linear-gradient(135deg, rgba(214,236,255,0.98), rgba(220,250,243,0.96) 52%, rgba(255,226,196,0.94))",
    glowA: "rgba(64, 142, 255, 0.42)",
    glowB: "rgba(66, 206, 190, 0.3)",
    glowC: "rgba(255, 170, 96, 0.22)",
    border: "rgba(86,154,255,0.2)",
    accentText: "#245e99",
    accentSurface: "rgba(86,154,255,0.1)"
  },
  Research: {
    shell: "linear-gradient(135deg, rgba(235,225,255,0.98), rgba(255,227,241,0.96) 52%, rgba(255,235,190,0.94))",
    glowA: "rgba(143, 99, 255, 0.4)",
    glowB: "rgba(255, 133, 191, 0.28)",
    glowC: "rgba(255, 186, 90, 0.22)",
    border: "rgba(152,118,255,0.18)",
    accentText: "#644ba7",
    accentSurface: "rgba(152,118,255,0.1)"
  },
  Security: {
    shell: "linear-gradient(135deg, rgba(255,224,233,0.98), rgba(255,231,203,0.96) 50%, rgba(255,244,216,0.94))",
    glowA: "rgba(255, 96, 124, 0.4)",
    glowB: "rgba(255, 177, 77, 0.28)",
    glowC: "rgba(97, 154, 255, 0.2)",
    border: "rgba(255,115,133,0.18)",
    accentText: "#a13a48",
    accentSurface: "rgba(255,115,133,0.1)"
  },
  Web3: {
    shell: "linear-gradient(135deg, rgba(255,230,193,0.98), rgba(255,245,214,0.96) 48%, rgba(215,236,255,0.94))",
    glowA: "rgba(255, 149, 54, 0.42)",
    glowB: "rgba(92, 160, 255, 0.28)",
    glowC: "rgba(245, 197, 74, 0.22)",
    border: "rgba(255,163,77,0.18)",
    accentText: "#8a5b17",
    accentSurface: "rgba(255,163,77,0.1)"
  },
  General: {
    shell: "linear-gradient(135deg, rgba(255,232,215,0.98), rgba(228,241,255,0.96) 50%, rgba(255,239,204,0.94))",
    glowA: "rgba(255, 150, 94, 0.34)",
    glowB: "rgba(110, 164, 235, 0.28)",
    glowC: "rgba(241, 186, 82, 0.22)",
    border: "rgba(128,168,219,0.16)",
    accentText: "#4a5567",
    accentSurface: "rgba(128,168,219,0.08)"
  }
};

function buildRankMap(skills: Skill[]): Record<string, number> {
  return Object.fromEntries(skills.map((skill, index) => [skill.slug, index + 1]));
}

export function HomeStorefront({
  dailyPicks,
  trendingByDownloads,
  trendingByStars,
  trendingLatest,
  totalSkills,
  locale,
  messages
}: HomeStorefrontProps) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [trendMode, setTrendMode] = useState<TrendMode>("downloads");
  const [previousRankSnapshots, setPreviousRankSnapshots] = useState<RankSnapshot | null>(null);

  const currentRankSnapshots = useMemo<RankSnapshot>(
    () => ({
      downloads: buildRankMap(trendingByDownloads),
      stars: buildRankMap(trendingByStars),
      latest: buildRankMap(trendingLatest)
    }),
    [trendingByDownloads, trendingByStars, trendingLatest]
  );

  useEffect(() => {
    if (reducedMotion || dailyPicks.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % dailyPicks.length);
    }, 5600);

    return () => window.clearInterval(timer);
  }, [dailyPicks.length, reducedMotion]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(TREND_SNAPSHOT_STORAGE_KEY);
      if (!raw) {
        setPreviousRankSnapshots({ downloads: {}, stars: {}, latest: {} });
        return;
      }

      const parsed = JSON.parse(raw) as Partial<RankSnapshot>;
      setPreviousRankSnapshots({
        downloads: parsed.downloads ?? {},
        stars: parsed.stars ?? {},
        latest: parsed.latest ?? {}
      });
    } catch {
      setPreviousRankSnapshots({ downloads: {}, stars: {}, latest: {} });
    }
  }, []);

  useEffect(() => {
    if (!previousRankSnapshots) return;

    try {
      window.localStorage.setItem(TREND_SNAPSHOT_STORAGE_KEY, JSON.stringify(currentRankSnapshots));
    } catch {
      // Ignore storage write failures.
    }
  }, [currentRankSnapshots, previousRankSnapshots]);

  if (dailyPicks.length === 0) return null;

  const active = dailyPicks[index] ?? dailyPicks[0];
  const palette = paletteByCategory[active.category] ?? paletteByCategory.General;
  const stars = getSkillStars(active);
  const downloads = getSkillDownloads(active);
  const primaryTrust = active.trustLabels[0];
  const primaryHref = active.detailHref ?? `/skills/${active.slug}`;
  const primaryExternal = /^https?:\/\//.test(primaryHref);
  const trending =
    trendMode === "downloads"
      ? trendingByDownloads
      : trendMode === "stars"
        ? trendingByStars
        : trendingLatest;

  const getRankDelta = (mode: TrendMode, slug: string, currentRank: number): number | null => {
    const previousRank = previousRankSnapshots?.[mode]?.[slug];
    if (typeof previousRank !== "number") return null;
    return previousRank - currentRank;
  };

  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-visible py-2 sm:py-3">
      <motion.div
        aria-hidden
        className="ambient-orb left-[-7rem] top-[-4rem] h-[18rem] w-[18rem] bg-[#ffd3bd]/32"
        animate={reducedMotion ? undefined : { x: [0, 18, -10, 0], y: [0, -12, 10, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="ambient-orb right-[-9rem] top-[2rem] h-[22rem] w-[22rem] bg-[#cfe0ff]/28"
        animate={reducedMotion ? undefined : { x: [0, -18, 14, 0], y: [0, 16, -10, 0], scale: [1, 0.95, 1.06, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="ambient-orb bottom-[-10rem] left-[28%] h-[20rem] w-[20rem] bg-[#f7dd9c]/24"
        animate={reducedMotion ? undefined : { x: [0, 10, -8, 0], y: [0, -10, 12, 0], scale: [1, 1.04, 0.97, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="pointer-events-none absolute inset-x-0 -top-14 bottom-[-3rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.42),rgba(255,255,255,0.18)_20%,rgba(255,255,255,0.06)_48%,transparent_100%)] blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.72),transparent_72%)]" />

      <div className="relative mx-auto w-full max-w-[1720px] px-4 sm:px-6 md:px-8 xl:px-10">
      <div className="relative z-10 mb-5 flex flex-col gap-4 lg:mb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-5xl">
          <h2 className="font-[var(--font-serif)] text-[1.85rem] leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-[2.45rem] md:text-[3.15rem] xl:text-[3.7rem] xl:whitespace-nowrap">
            {messages.home.showcaseTitle}
          </h2>
          <p className="mt-3 max-w-none text-sm leading-6 text-slate-600 sm:mt-4 sm:text-base sm:leading-7 xl:whitespace-nowrap">
            {messages.home.showcaseDesc}
          </p>
        </div>

        <div className="inline-flex self-start items-center gap-2 rounded-full border border-transparent bg-white/52 px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.74)] lg:self-auto">
          <span className="relative flex h-2.5 w-2.5 items-center justify-center">
            <motion.span
              aria-hidden
              className="absolute inset-[-3px] rounded-full bg-emerald-400/34"
              animate={
                reducedMotion
                  ? undefined
                  : {
                      opacity: [0.22, 0.52, 0.22],
                      scale: [0.96, 1.22, 0.96]
                    }
              }
              transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              aria-hidden
              className="relative h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.12),0_0_14px_rgba(16,185,129,0.32)]"
              animate={reducedMotion ? undefined : { scale: [1, 1.04, 1] }}
              transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
          {formatMessage(messages.home.showcaseLiveSignal, {
            count: totalSkills.toLocaleString(locale)
          })}
        </div>
      </div>

      <div className="relative z-10 grid gap-5 xl:items-stretch xl:grid-cols-[minmax(0,1.62fr)_minmax(360px,420px)] 2xl:grid-cols-[minmax(0,1.7fr)_minmax(380px,460px)]">
        <div className="surface-card relative rounded-[1.6rem] p-1 sm:rounded-[2rem] sm:p-1.5">
          <div
            className="relative overflow-hidden rounded-[1.45rem] sm:rounded-[1.8rem]"
            style={{ border: `1px solid ${palette.border}` }}
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={`bg-${active.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.6, ease: [0.22, 0.65, 0.2, 1] }}
                className="absolute inset-0"
              >
                <div className="absolute inset-0" style={{ background: palette.shell }} />
                <motion.div
                  aria-hidden
                  className="ambient-orb left-[-3rem] top-8 h-[14rem] w-[14rem]"
                  style={{ background: palette.glowA }}
                  animate={reducedMotion ? undefined : { x: [0, 16, -12, 0], y: [0, -14, 10, 0], scale: [1, 1.06, 0.94, 1] }}
                  transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  aria-hidden
                  className="absolute left-[8%] top-[10%] h-[13rem] w-[13rem] blur-[44px]"
                  style={{
                    background: palette.glowA,
                    opacity: 0.46,
                    borderRadius: "56% 44% 52% 48% / 46% 55% 45% 54%"
                  }}
                  animate={
                    reducedMotion
                      ? undefined
                      : {
                          x: [0, 26, -18, 0],
                          y: [0, -12, 18, 0],
                          rotate: [0, 18, -12, 0],
                          scale: [1, 1.14, 0.94, 1],
                          borderRadius: [
                            "56% 44% 52% 48% / 46% 55% 45% 54%",
                            "42% 58% 46% 54% / 56% 44% 58% 42%",
                            "60% 40% 58% 42% / 44% 56% 42% 58%",
                            "56% 44% 52% 48% / 46% 55% 45% 54%"
                          ]
                        }
                  }
                  transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  aria-hidden
                  className="ambient-orb right-[-2rem] top-14 h-[15rem] w-[15rem]"
                  style={{ background: palette.glowB }}
                  animate={reducedMotion ? undefined : { x: [0, -14, 8, 0], y: [0, 16, -10, 0], scale: [1, 0.96, 1.08, 1] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  aria-hidden
                  className="absolute right-[10%] top-[16%] h-[11rem] w-[11rem] blur-[40px]"
                  style={{
                    background: palette.glowB,
                    opacity: 0.42,
                    borderRadius: "48% 52% 38% 62% / 58% 42% 60% 40%"
                  }}
                  animate={
                    reducedMotion
                      ? undefined
                      : {
                          x: [0, -24, 14, 0],
                          y: [0, 16, -10, 0],
                          rotate: [0, -22, 14, 0],
                          scale: [1, 0.9, 1.1, 1],
                          borderRadius: [
                            "48% 52% 38% 62% / 58% 42% 60% 40%",
                            "60% 40% 55% 45% / 48% 52% 38% 62%",
                            "44% 56% 40% 60% / 62% 38% 56% 44%",
                            "48% 52% 38% 62% / 58% 42% 60% 40%"
                          ]
                        }
                  }
                  transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  aria-hidden
                  className="ambient-orb bottom-[-5rem] right-[16%] h-[13rem] w-[13rem]"
                  style={{ background: palette.glowC }}
                  animate={reducedMotion ? undefined : { x: [0, 10, -6, 0], y: [0, -8, 12, 0], scale: [1, 1.04, 0.95, 1] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  aria-hidden
                  className="absolute bottom-[-1rem] left-[28%] h-[12rem] w-[16rem] blur-[46px]"
                  style={{
                    background: `linear-gradient(135deg, ${palette.glowC}, ${palette.glowB})`,
                    opacity: 0.28,
                    borderRadius: "52% 48% 58% 42% / 52% 40% 60% 48%"
                  }}
                  animate={
                    reducedMotion
                      ? undefined
                      : {
                          x: [0, 18, -12, 0],
                          y: [0, -10, 12, 0],
                          rotate: [0, 10, -8, 0],
                          scale: [1, 1.06, 0.96, 1],
                          borderRadius: [
                            "52% 48% 58% 42% / 52% 40% 60% 48%",
                            "42% 58% 50% 50% / 60% 44% 56% 40%",
                            "58% 42% 46% 54% / 46% 58% 42% 54%",
                            "52% 48% 58% 42% / 52% 40% 60% 48%"
                          ]
                        }
                  }
                  transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.44),transparent_24%,rgba(255,255,255,0.12))]" />
              </motion.div>
            </AnimatePresence>

            <div className="relative z-10 p-4 sm:p-6 lg:p-8">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`content-${active.id}`}
                  initial={{ opacity: 0, x: 28, filter: "blur(10px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -28, filter: "blur(10px)" }}
                  transition={{ duration: reducedMotion ? 0 : 0.55, ease: [0.2, 0.7, 0.2, 1] }}
                  className="flex h-[360px] flex-col overflow-hidden sm:h-[390px] lg:h-[410px]"
                >
                  <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-8 lg:items-start">
                    <div className="flex min-h-0 flex-col">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="border-white/72 bg-white/66 text-slate-900">
                          {getCategoryLabel(active.category, messages)}
                        </Badge>
                        {primaryTrust ? (
                          <Badge className="border-white/72 bg-white/56 text-slate-700">
                            {getTrustLabel(primaryTrust, messages)}
                          </Badge>
                        ) : null}
                        {active.trustLabels[1] ? (
                          <Badge className="border-white/72 bg-white/56 text-slate-700">
                            {getTrustLabel(active.trustLabels[1], messages)}
                          </Badge>
                        ) : null}
                      </div>

                  <div className="mt-7 max-w-3xl sm:mt-9">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 sm:text-sm sm:tracking-[0.22em]">
                      {index + 1} / {dailyPicks.length}
                    </p>
                    <h3 className="mt-3 max-w-2xl text-[1.85rem] font-semibold tracking-[-0.055em] text-slate-950 line-clamp-2 sm:text-[2.35rem] md:text-[2.8rem]">
                      {active.name}
                    </h3>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-700 line-clamp-4 sm:mt-4 sm:text-base sm:leading-7 sm:line-clamp-5">
                      {active.summary}
                    </p>
                  </div>
                </div>

                    <div className="hidden lg:block">
                      <div className="space-y-3 pt-1">
                        <div>
                          <p className="text-sm font-semibold" style={{ color: palette.accentText }}>
                            {active.author ?? active.namespace ?? messages.metadata.profileUnavailable}
                          </p>
                        </div>
                        <div className="grid gap-2">
                          <div className="rounded-[1.1rem] px-3 py-2" style={{ background: palette.accentSurface }}>
                            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{messages.skills.downloadsLabel}</p>
                            <p className="mt-1 text-lg font-semibold text-slate-950">{formatCompactNumber(downloads, locale)}</p>
                          </div>
                          <div className="rounded-[1.1rem] px-3 py-2" style={{ background: palette.accentSurface }}>
                            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{messages.skills.starsLabel}</p>
                            <p className="mt-1 text-lg font-semibold text-slate-950">{formatCompactNumber(stars, locale)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-7 sm:mt-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                      <Link
                        href={primaryHref}
                        target={primaryExternal ? "_blank" : undefined}
                        rel={primaryExternal ? "noreferrer" : undefined}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-950 bg-[linear-gradient(180deg,rgba(30,41,59,1),rgba(15,23,42,1))] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_30px_-22px_rgba(15,23,42,0.95),inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:brightness-[1.03]"
                      >
                        {messages.home.showcasePrimaryCta}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        href="/skills"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/84 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-[0_18px_32px_-24px_rgba(20,34,56,0.18),inset_0_1px_0_rgba(255,255,255,0.92)] transition hover:bg-[#fffdf9]"
                      >
                        {messages.home.showcaseSecondaryCta}
                      </Link>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-white/40 pt-4 sm:mt-8">
                    <div className="flex items-center gap-2">
                      {dailyPicks.map((skill, skillIndex) => (
                        <button
                          key={skill.id}
                          type="button"
                          aria-label={`Open daily recommendation ${skillIndex + 1}`}
                          onClick={() => setIndex(skillIndex)}
                          className={`h-2 rounded-full transition-all ${
                            skillIndex === index ? "w-10 bg-slate-900" : "w-2 bg-slate-500/30 hover:bg-slate-500/60"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Previous recommendation"
                        onClick={() => setIndex((current) => (current - 1 + dailyPicks.length) % dailyPicks.length)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/68 bg-white/62 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] transition hover:bg-white/82 sm:h-10 sm:w-10"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Next recommendation"
                        onClick={() => setIndex((current) => (current + 1) % dailyPicks.length)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/68 bg-white/62 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] transition hover:bg-white/82 sm:h-10 sm:w-10"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <aside className="surface-card relative flex h-full flex-col overflow-hidden rounded-[1.6rem] p-4 sm:rounded-[2rem] sm:p-5">
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_top_right,rgba(123,171,255,0.14),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(255,184,118,0.14),transparent_24%)]" />
          <div className="relative z-10 flex flex-wrap gap-2">
            {(
              [
                ["downloads", messages.home.trendDownloadsTab],
                ["stars", messages.home.trendStarsTab],
                ["latest", messages.home.trendLatestTab]
              ] as Array<[TrendMode, string]>
            ).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setTrendMode(mode)}
                className={`relative inline-flex items-center overflow-hidden rounded-full border px-3 py-2 text-xs font-semibold transition-all duration-200 sm:text-sm ${
                  trendMode === mode
                    ? "border-slate-950 text-white shadow-[0_18px_30px_-22px_rgba(15,23,42,0.95),inset_0_1px_0_rgba(255,255,255,0.08)]"
                    : "border-white/62 bg-white/62 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] hover:border-slate-300 hover:bg-white/84 hover:text-slate-900"
                }`}
              >
                {trendMode === mode ? (
                  <motion.span
                    layoutId="trend-pill"
                    className="absolute inset-0 bg-[linear-gradient(180deg,rgba(30,41,59,1),rgba(15,23,42,1))]"
                    transition={{ type: "spring", stiffness: 300, damping: 28, mass: 0.82 }}
                  />
                ) : null}
                <span className="relative z-10">{label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={trendMode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: reducedMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 mt-4 grid flex-1 gap-2.5 will-change-transform xl:grid-rows-5"
            >
              {trending.slice(0, 5).map((skill, trendIndex) => {
                const trendDownloads = getSkillDownloads(skill);
                const trendStars = getSkillStars(skill);
                const currentRank = trendIndex + 1;
                const rankDelta = getRankDelta(trendMode, skill.slug, currentRank);
                return (
                  <Link
                    key={skill.id}
                    href={`/skills/${skill.slug}`}
                    className="group flex h-full items-start gap-2.5 rounded-[1.1rem] border border-transparent bg-white/44 px-2.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition hover:border-white/68 hover:bg-white/74 sm:rounded-[1.45rem]"
                  >
                    <div className="flex h-8 w-5 shrink-0 items-center justify-center text-[12px] font-semibold text-slate-500">
                      {currentRank}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex items-baseline gap-1.5">
                          <p className="truncate text-[14px] font-semibold leading-5 text-slate-900">{skill.name}</p>
                          <span className="shrink-0 text-[10px] text-slate-400">/</span>
                          <p className="truncate text-[11px] text-slate-500">
                            {skill.author ?? skill.namespace ?? messages.metadata.profileUnavailable}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {rankDelta !== null ? (
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                                rankDelta === 0
                                  ? "text-slate-500"
                                  : rankDelta > 0
                                    ? "text-emerald-600"
                                    : "text-rose-500"
                              }`}
                            >
                              {rankDelta === 0 ? (
                                <Minus className="h-3 w-3" />
                              ) : rankDelta > 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-600">
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/72 bg-white/72 px-2 py-0.5">
                          <Download className="h-3 w-3" />
                          {formatCompactNumber(trendDownloads, locale)}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/72 bg-white/72 px-2 py-0.5">
                          <Star className="h-3 w-3" />
                          {formatCompactNumber(trendStars, locale)}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </aside>
      </div>
      </div>
    </section>
  );
}
