import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Maximize2 } from 'lucide-react'
import { AnalogClock } from './AnalogClock'
import { DigitalClock } from './DigitalClock'
import { AmbientMode } from './AmbientMode'

export function ClockWidget() {
  const [mode, setMode] = useState<'analog' | 'digital'>('analog')
  const [ambient, setAmbient] = useState(false)

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Clock face — click to toggle mode */}
        <button
          onClick={() => setMode((m) => (m === 'analog' ? 'digital' : 'analog'))}
          className="relative group"
          title={`Switch to ${mode === 'analog' ? 'digital' : 'analog'}`}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          <AnimatePresence mode="wait">
            {mode === 'analog' ? (
              <motion.div
                key="analog"
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -90 }}
                transition={{ duration: 0.25 }}
              >
                <AnalogClock size={68} showSeconds />
              </motion.div>
            ) : (
              <motion.div
                key="digital"
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -90 }}
                transition={{ duration: 0.25 }}
              >
                <DigitalClock compact />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mode hint on hover */}
          <span
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}
          >
            click to switch
          </span>
        </button>

        {/* Ambient mode button */}
        <button
          onClick={() => setAmbient(true)}
          className="p-1.5 rounded-md transition-all"
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
          title="Ambient mode (fullscreen clock)"
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-light)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <Maximize2 size={15} />
        </button>
      </div>

      <AmbientMode open={ambient} onClose={() => setAmbient(false)} />
    </>
  )
}
