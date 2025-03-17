"use client"

import { motion } from "framer-motion"

export default function FloatingElements() {
  return (
    <>
      {/* Floating stars */}
      <motion.div
        className="absolute top-[15%] right-[10%] w-6 h-6 text-yellow-400"
        animate={{
          y: [0, -15, 0],
          rotate: [0, 15, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 3,
          ease: "easeInOut",
        }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute top-[40%] left-[8%] w-4 h-4 text-pink-400"
        animate={{
          y: [0, 10, 0],
          rotate: [0, -10, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 2.5,
          ease: "easeInOut",
          delay: 0.5,
        }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </motion.div>

      {/* Floating circles */}
      <motion.div
        className="absolute top-[25%] left-[15%] w-8 h-8 rounded-full bg-green-200 opacity-70"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 4,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-[20%] right-[15%] w-10 h-10 rounded-full bg-purple-200 opacity-70"
        animate={{
          y: [0, 15, 0],
          x: [0, -10, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 3.5,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Floating bubbles */}
      <motion.div
        className="absolute top-[60%] right-[20%] w-5 h-5 rounded-full border-2 border-cyan-300 opacity-70"
        animate={{
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 5,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-[10%] left-[30%] w-3 h-3 rounded-full border-2 border-yellow-300 opacity-70"
        animate={{
          y: [0, 20, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 4,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </>
  )
}

