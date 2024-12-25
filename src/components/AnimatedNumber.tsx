"use client";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedNumberProps {
  number: number | null;
}

export default function AnimatedNumber({ number }: AnimatedNumberProps) {
  return (
    <AnimatePresence mode="wait">
      {number && (
        <motion.div
          key={number}
          initial={{ scale: 2, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: -50 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          className="text-8xl font-bold text-purple-600 mb-4 tabular-nums"
        >
          {number}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
