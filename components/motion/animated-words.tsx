"use client";

import { motion, useReducedMotion } from "framer-motion";

interface AnimatedWordsProps {
  text: string;
  delay?: number;
  stagger?: number;
}

export function AnimatedWords({ text, delay = 0, stagger = 0.035 }: AnimatedWordsProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <span className="whitespace-pre-line">{text}</span>;
  }

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/\s+/).filter(Boolean));

  return (
    <>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden
        className="inline"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              delayChildren: delay,
              staggerChildren: stagger
            }
          }
        }}
      >
        {lines.map((words, lineIndex) => (
          <span
            key={`line-${lineIndex}`}
            className={lineIndex === 0 ? "block" : "mt-3 block"}
          >
            {words.map((word, index) => (
              <motion.span
                key={`${word}-${lineIndex}-${index}`}
                className="inline-block"
                variants={{
                  hidden: { opacity: 0, y: 10, filter: "blur(5px)" },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: {
                      duration: 0.55,
                      ease: [0.2, 0.65, 0.3, 0.95]
                    }
                  }
                }}
              >
                {word}
                {index < words.length - 1 ? "\u00A0" : ""}
              </motion.span>
            ))}
          </span>
        ))}
      </motion.span>
    </>
  );
}
