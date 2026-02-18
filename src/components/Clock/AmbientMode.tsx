import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Minimize2 } from 'lucide-react'
import { AnalogClock } from './AnalogClock'
import { DigitalClock } from './DigitalClock'

interface Props {
  open: boolean
  onClose: () => void
}

export function AmbientMode({ open, onClose }: Props) {
  // Escape key to exit
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) {
      document.addEventListener('keydown', handler)
      // Attempt fullscreen
      document.documentElement.requestFullscreen?.().catch(() => {})
    } else {
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
    }
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center ambient-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          onClick={onClose}
        >
          {/* Close button */}
          <motion.button
            className="absolute top-6 right-6 p-2 rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}
            onClick={(e) => { e.stopPropagation(); onClose() }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.1 }}
          >
            <Minimize2 size={18} />
          </motion.button>

          {/* Floating glow orb */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 500,
              height: 500,
              background: 'radial-gradient(circle, var(--glow) 0%, transparent 70%)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* Pulse ring animation behind clock */}
          <div className="relative flex flex-col items-center gap-10" onClick={(e) => e.stopPropagation()}>

            {/* Pulsing ring */}
            <div className="absolute rounded-full pointer-events-none"
              style={{
                width: 340, height: 340,
                border: '1px solid var(--accent)',
                opacity: 0.15,
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                animation: 'pulse-ring 3s ease-out infinite',
              }}
            />
            <div className="absolute rounded-full pointer-events-none"
              style={{
                width: 300, height: 300,
                border: '1px solid var(--accent)',
                opacity: 0.1,
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                animation: 'pulse-ring 3s ease-out 1.5s infinite',
              }}
            />

            {/* Analog clock — large */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
              style={{ animation: 'float 6s ease-in-out infinite' }}
            >
              <AnalogClock size={260} showSeconds />
            </motion.div>

            {/* Digital time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <DigitalClock large />
            </motion.div>
          </div>

          {/* Bottom hint */}
          <motion.p
            className="absolute bottom-8 text-xs tracking-widest uppercase"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.2em' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Press Esc or click anywhere to exit
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
