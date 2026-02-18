import { useState, useEffect } from 'react'

interface Props {
  size?: number
  showSeconds?: boolean
}

export function AnalogClock({ size = 120, showSeconds = true }: Props) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    // 100ms for buttery-smooth second hand
    const id = setInterval(() => setTime(new Date()), 100)
    return () => clearInterval(id)
  }, [])

  const cx = 100
  const cy = 100
  const r = 86

  const h = time.getHours() % 12
  const m = time.getMinutes()
  const s = time.getSeconds() + time.getMilliseconds() / 1000

  const secDeg  = s * 6
  const minDeg  = m * 6 + s * 0.1
  const hourDeg = h * 30 + m * 0.5

  function toXY(deg: number, len: number) {
    const rad = (deg - 90) * (Math.PI / 180)
    return { x: cx + len * Math.cos(rad), y: cy + len * Math.sin(rad) }
  }

  function Hand({
    deg, len, width, color, tail = 0,
  }: {
    deg: number; len: number; width: number; color: string; tail?: number
  }) {
    const tip = toXY(deg, len)
    const tailPt = tail > 0 ? toXY(deg + 180, tail) : { x: cx, y: cy }
    return (
      <line
        x1={tailPt.x} y1={tailPt.y}
        x2={tip.x}    y2={tip.y}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
      />
    )
  }

  // Hour + minute tick marks
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const isHour = i % 5 === 0
    const deg = i * 6
    const inner = toXY(deg, isHour ? r - 16 : r - 9)
    const outer = toXY(deg, r)
    return (
      <line
        key={i}
        x1={outer.x} y1={outer.y}
        x2={inner.x} y2={inner.y}
        stroke={isHour ? 'var(--text-secondary)' : 'var(--text-muted)'}
        strokeWidth={isHour ? 2.5 : 1}
        strokeLinecap="round"
        opacity={isHour ? 0.9 : 0.4}
      />
    )
  })

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      style={{ flexShrink: 0, display: 'block' }}
    >
      {/* Outer ring glow */}
      <circle cx={cx} cy={cy} r={r + 5} fill="none"
        stroke="var(--clock-ring)" strokeWidth={1.5} opacity={0.6} />

      {/* Face */}
      <circle cx={cx} cy={cy} r={r + 3} fill="var(--clock-face)" />

      {/* Inner subtle gradient circle */}
      <circle cx={cx} cy={cy} r={r + 3} fill="none"
        stroke="var(--border)" strokeWidth={0.5} />

      {/* Tick marks */}
      {ticks}

      {/* Hour numbers (3, 6, 9, 12) */}
      {[12, 3, 6, 9].map((n, i) => {
        const deg = i * 90
        const pos = toXY(deg, r - 30)
        return (
          <text
            key={n}
            x={pos.x} y={pos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="14"
            fontWeight="300"
            fill="var(--text-secondary)"
            fontFamily="Inter, system-ui, sans-serif"
            opacity={0.7}
          >
            {n}
          </text>
        )
      })}

      {/* Hour hand */}
      <Hand deg={hourDeg} len={50} width={5}   color="var(--text-primary)" />
      {/* Minute hand */}
      <Hand deg={minDeg}  len={70} width={3.5} color="var(--text-primary)" />
      {/* Second hand + tail */}
      {showSeconds && (
        <Hand deg={secDeg} len={76} width={1.5}
          color="var(--accent-light)" tail={18} />
      )}

      {/* Center cap */}
      <circle cx={cx} cy={cy} r={6}   fill="var(--accent)" />
      <circle cx={cx} cy={cy} r={2.5} fill="var(--text-primary)" />
    </svg>
  )
}
