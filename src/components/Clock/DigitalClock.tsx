import { useState, useEffect } from 'react'
import { format } from 'date-fns'

interface Props {
  /** compact = small inline version for header */
  compact?: boolean
  /** large = for ambient mode */
  large?: boolean
}

export function DigitalClock({ compact = false, large = false }: Props) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  if (compact) {
    return (
      <div className="text-right select-none">
        <div
          className="font-mono font-light tracking-widest"
          style={{ fontSize: '1.5rem', color: 'var(--text-primary)', lineHeight: 1 }}
        >
          {format(time, 'HH:mm')}
        </div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          {format(time, ':ss')}
        </div>
      </div>
    )
  }

  if (large) {
    return (
      <div className="text-center select-none">
        {/* Hours : Minutes */}
        <div
          className="font-mono font-thin tracking-widest"
          style={{ fontSize: '7rem', color: 'var(--text-primary)', lineHeight: 1 }}
        >
          {format(time, 'HH')}
          <span
            className="inline-block"
            style={{
              color: 'var(--accent)',
              animation: 'pulse 1s ease-in-out infinite',
              marginInline: '0.1em',
            }}
          >
            :
          </span>
          {format(time, 'mm')}
        </div>

        {/* Seconds */}
        <div
          className="font-mono font-light tracking-widest mt-2"
          style={{ fontSize: '2.5rem', color: 'var(--accent-light)', opacity: 0.7 }}
        >
          {format(time, 'ss')}
          <span style={{ fontSize: '1rem', marginLeft: '0.3em', opacity: 0.5 }}>s</span>
        </div>

        {/* Date */}
        <div
          className="mt-4 tracking-widest uppercase"
          style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', letterSpacing: '0.2em' }}
        >
          {format(time, 'EEEE · MMMM d · yyyy')}
        </div>
      </div>
    )
  }

  // Default medium size (for ClockWidget digital mode)
  return (
    <div className="text-center select-none">
      <div
        className="font-mono font-thin tracking-widest"
        style={{ fontSize: '3rem', color: 'var(--text-primary)', lineHeight: 1 }}
      >
        {format(time, 'HH:mm')}
      </div>
      <div
        className="font-mono mt-1"
        style={{ fontSize: '1.1rem', color: 'var(--accent-light)', opacity: 0.6 }}
      >
        {format(time, 'ss')}s
      </div>
      <div
        className="mt-2"
        style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}
      >
        {format(time, 'EEE, MMM d')}
      </div>
    </div>
  )
}
