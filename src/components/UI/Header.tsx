import { useMemo } from 'react'
import { format } from 'date-fns'
import { ClockWidget } from '../Clock/ClockWidget'
import { useTaskStore } from '../../store/taskStore'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 5)  return 'Still up?'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

function greetingEmoji(): string {
  const h = new Date().getHours()
  if (h < 5)  return '🌙'
  if (h < 12) return '☀️'
  if (h < 17) return '🌤️'
  if (h < 21) return '🌆'
  return '🌙'
}

export function Header() {
  const tasks = useTaskStore((s) => s.tasks)

  const stats = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const dueToday = tasks.filter(
      (t) => t.dueDate && t.dueDate.startsWith(today) && t.status !== 'completed'
    ).length
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length
    const overdue = tasks.filter(
      (t) =>
        t.dueDate &&
        new Date(t.dueDate) < new Date() &&
        !t.dueDate.startsWith(today) &&
        t.status !== 'completed'
    ).length
    return { dueToday, inProgress, overdue }
  }, [tasks])

  return (
    <header
      className="flex items-center justify-between px-8 py-4 border-b flex-shrink-0"
      style={{
        borderColor: 'var(--border)',
        background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
      }}
    >
      {/* Left: greeting + date + quick stats */}
      <div>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '0.75rem' }}>{greetingEmoji()}</span>
          <h2
            className="font-semibold"
            style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}
          >
            {greeting()}
          </h2>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {format(new Date(), 'EEEE, MMMM d')}
          </span>

          {/* Quick stat pills */}
          {stats.inProgress > 0 && (
            <span
              className="badge"
              style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent-light)', fontSize: '0.6rem' }}
            >
              {stats.inProgress} in progress
            </span>
          )}
          {stats.dueToday > 0 && (
            <span
              className="badge"
              style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24', fontSize: '0.6rem' }}
            >
              {stats.dueToday} due today
            </span>
          )}
          {stats.overdue > 0 && (
            <span
              className="badge"
              style={{ background: 'rgba(244,63,94,0.12)', color: '#f87171', fontSize: '0.6rem' }}
            >
              {stats.overdue} overdue
            </span>
          )}
        </div>
      </div>

      {/* Right: clock widget */}
      <ClockWidget />
    </header>
  )
}
