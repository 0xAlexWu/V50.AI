import Link from "next/link";

import { LobsterClawIllustration } from "@/components/motion/lobster-claw-illustration";
import { AnimatedWords } from "@/components/motion/animated-words";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { formatMessage, type Locale, type Messages } from "@/lib/i18n";

interface HeroProps {
  totalSkills: number;
  locale: Locale;
  messages: Messages;
}

export function Hero({ totalSkills, locale, messages }: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-5 shadow-soft sm:p-8 md:p-12">
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(300px,390px)] md:items-center">
        <div>
          <FadeIn>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent sm:text-xs sm:tracking-[0.25em]">{messages.hero.kicker}</p>
          </FadeIn>
          <h1 className="mt-4 max-w-3xl font-[var(--font-serif)] text-3xl leading-tight text-slate-900 sm:mt-5 sm:text-4xl md:text-6xl">
            <AnimatedWords text={messages.hero.title} delay={0.12} stagger={0.032} />
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-slate-700 sm:mt-7 sm:text-base md:text-lg">
            <AnimatedWords text={messages.hero.subtitle} delay={0.4} stagger={0.02} />
          </p>

          <FadeIn delay={0.22} className="mt-7 flex flex-wrap items-center gap-3 sm:mt-9">
            <Link href="/skills">
              <Button>{messages.hero.browseSkills}</Button>
            </Link>
            <Link href="/collections">
              <Button variant="outline">{messages.hero.viewCollections}</Button>
            </Link>
            <span className="rounded-full border border-border bg-white px-3 py-1.5 text-sm text-slate-700">
              {formatMessage(messages.hero.liveEntries, { count: totalSkills.toLocaleString(locale) })}
            </span>
          </FadeIn>
        </div>

        <FadeIn delay={0.16} className="hidden md:block">
          <LobsterClawIllustration />
        </FadeIn>
      </div>
    </section>
  );
}
