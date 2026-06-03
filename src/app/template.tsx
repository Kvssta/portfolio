"use client";

import { motion } from "motion/react";

// Runs on every navigation — fades each page in for a smooth route transition.
// Opacity-only (no transform) so fixed elements stay viewport-anchored.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}
