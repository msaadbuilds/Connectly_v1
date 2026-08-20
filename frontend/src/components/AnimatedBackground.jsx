import React from 'react'
import { motion } from 'framer-motion'

// Soft, slow-drifting gradient blobs that give the whole app a living,
// premium feel. Sits fixed behind every route at the lowest z-index so
// panes with translucent backgrounds (Sidebar, RightSidebar, empty chat
// state) let it breathe through instead of looking flat/empty.
const BLOBS = [
  { className: 'bg-violet-600/35', size: 620, top: '-14%', left: '-10%', duration: 24, delay: 0 },
  { className: 'bg-fuchsia-500/25', size: 520, top: '58%', left: '68%', duration: 28, delay: 2 },
  { className: 'bg-indigo-500/25', size: 480, top: '68%', left: '-14%', duration: 22, delay: 4 },
  { className: 'bg-purple-500/20', size: 420, top: '2%', left: '62%', duration: 26, delay: 1 },
]

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0b0917]">
      {BLOBS.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl ${b.className}`}
          style={{ width: b.size, height: b.size, top: b.top, left: b.left }}
          animate={{
            x: [0, 50, -35, 0],
            y: [0, -40, 30, 0],
            scale: [1, 1.1, 0.94, 1],
          }}
          transition={{
            duration: b.duration,
            delay: b.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      {/* faint vignette so edges/corners of the app stay readable */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(11,9,23,0.55)_100%)]" />
    </div>
  )
}

export default AnimatedBackground
