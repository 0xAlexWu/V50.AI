"use client";

import { motion, useReducedMotion } from "framer-motion";

export function LobsterClawIllustration() {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <svg
        viewBox="0 0 360 320"
        className="h-[330px] w-full"
        role="img"
        aria-label="Line-art animated SKILL.md card"
      >
        <circle cx="180" cy="160" r="126" fill="#f8f6f0" stroke="#ddd7cb" strokeDasharray="6 8" />
        <rect x="86" y="104" width="188" height="112" rx="18" fill="#fcfbf8" stroke="#d7d0c2" strokeWidth="2.5" />
        <text x="112" y="146" fill="#16404d" fontSize="24" fontWeight="600" fontFamily="var(--font-sans)">
          SKILL.md
        </text>
        <path d="M112 168 H248" stroke="#e2dbc9" strokeWidth="3" strokeLinecap="round" />
        <path d="M112 187 H228" stroke="#e2dbc9" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 360 320" className="h-[330px] w-full" role="img" aria-label="Line-art animated SKILL.md card">
      <defs>
        <linearGradient id="v50-claw-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#f1eee6" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      <motion.circle
        cx="180"
        cy="160"
        r="126"
        fill="url(#v50-claw-bg)"
        stroke="#ddd7cb"
        strokeDasharray="6 8"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 28, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        style={{ transformOrigin: "180px 160px" }}
      />

      <motion.g
        animate={{ y: [0, -10, 0], rotate: [0, -2, 0], scale: [1, 1.02, 1] }}
        transition={{ duration: 4.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        style={{ transformOrigin: "180px 160px" }}
      >
        <rect x="86" y="104" width="188" height="112" rx="18" fill="#fcfbf8" stroke="#d7d0c2" strokeWidth="2.5" />
        <path d="M112 168 H248" stroke="#e2dbc9" strokeWidth="3" strokeLinecap="round" />
        <path d="M112 187 H228" stroke="#e2dbc9" strokeWidth="3" strokeLinecap="round" />
        <text x="112" y="146" fill="#16404d" fontSize="24" fontWeight="600" fontFamily="var(--font-sans)">
          SKILL.md
        </text>
      </motion.g>
    </svg>
  );
}
