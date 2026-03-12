"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export function LobsterClawIllustration() {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <div className="relative mx-auto h-[330px] w-[330px]" aria-label="V50 logo emblem">
        <div className="absolute inset-0 rounded-full border border-[#d7d0c2] bg-[#f6f2e9]" />
        <div className="absolute inset-[10px] overflow-hidden rounded-full border border-[#d7d0c2] bg-white/80">
          <Image src="/v50-logo.png" alt="V50 logo" fill sizes="330px" className="object-cover" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto h-[330px] w-[330px]" aria-label="Animated V50 logo emblem">
      <motion.div
        className="absolute inset-0 rounded-full bg-[conic-gradient(from_180deg,#16404d,#8f7b53,#f2e4c8,#16404d)] p-[2.5px]"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 16, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.88),rgba(247,243,235,0.9))]" />
      </motion.div>

      <motion.div
        className="absolute inset-[10px] overflow-hidden rounded-full border border-[#d7d0c2] bg-white/80 shadow-[0_10px_24px_rgba(16,24,39,0.14)]"
        animate={{ y: [0, -6, 0], scale: [1, 1.015, 1] }}
        transition={{ duration: 5.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      >
        <Image src="/v50-logo.png" alt="V50 logo" fill sizes="330px" className="object-cover" />
      </motion.div>
    </div>
  );
}
