import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, Circle, Clock, ChevronDown, ChevronRight,
  Trash2, Pencil, GripVertical, Calendar, Tag, Play, Square,
} from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format, isPast, isToday } from 'date-fns'
import type { Task } from '../../types'
import { useTaskStore } from '../../store/taskStore'
import { PriorityBadge, EnergyBadge, RecurringBadge } from '../UI/Badges'
import { useTimer, formatElapsed, formatMinutes } from '../../hooks/useTimer'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
}

const statusCycle = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: 'pending',
} as const

const BURST_COLORS = ['var(--accent)', 'var(--accent-light)', '#34d399', '#fbbf24', '#f87171', '#a78bfa']
const BURST_COUNT = 10

function CompletionBurst({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" style={{ zIndex: 10 }}>
      {Array.from({ length: BURST_COUNT }, (_, i) => {
        const angle = (i / BURST_COUNT) * 360
        const rad = (angle * Math.PI) / 180
        const dist = 38 + (i % 3) * 12
        const color = BURST_COLORS[i % BURST_COLORS.length]
        return (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              width: i % 2 === 0 ? 6 : 4,
              height: i % 2 === 0 ? 6 : 4,
              background: color,
              left: '1.5rem',
              top: '50%',
              marginTop: -3,
            }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{
              x: Math.cos(rad) * dist,
              y: Math.sin(rad) * dist,
              scale: [0, 1.2, 0],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: i * 0.02 }}
          />
        )
      })}
    </div>
  )
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const { setStatus, deleteTask, toggleSubtask, startTimer, stopTimer } = useTaskStore()
  const [expanded, setExpanded] = useState(false)
  const [burst, setBurst] = useState(false)
  const { isRunning, elapsedSeconds } = useTimer(task.id)
  const prevStatusRef = useRef(task.status)

  useEffect(() => {
    if (prevStatusRef.current !== 'completed' && task.status === 'completed') {
      setBurst(true)
      const t = setTimeout(() => setBurst(false), 700)
      return () => clearTimeout(t)
    }
    prevStatusRef.current = task.status
  }, [task.status])

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length
  const subtaskProgress = task.subtasks.length > 0 ? completedSubtasks / task.subtasks.length : 0

  const dueDateOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'completed'
  const dueDateToday   = task.dueDate && isToday(new Date(task.dueDate))
  const dueDateColor   = dueDateOverdue ? '#f87171' : dueDateToday ? '#fbbf24' : 'var(--text-muted)'

  function timeAccuracyColor(actual: number, estimated?: number): string {
    if (!estimated || actual === 0) return 'var(--text-muted)'
    const ratio = actual / estimated
    if (ratio <= 0.9) return '#34d399'
    if (ratio <= 1.1) return '#fbbf24'
    return '#f87171'
  }

  function cycleStatus() {
    setStatus(task.id, statusCycle[task.status])
  }

  function handleTimerToggle(e: React.MouseEvent) {
    e.stopPropagation()
    if (isRunning) stopTimer()
    else startTimer(task.id)
  }

  const isCompleted = task.status === 'completed'
  const isInProgress = task.status === 'in_progress'

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isCompleted ? 0.55 : 1, y: 0 }}
      exit={{ opacity: 0, x: -16, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="relative mb-2"
    >
      <div
        className="card group"
        style={{
          borderLeft: isCompleted
            ? '3px solid #22c55e'
            : isRunning
            ? '3px solid var(--accent)'
            : isInProgress
            ? '3px solid var(--accent-light)'
            : '3px solid transparent',
          boxShadow: isRunning ? '0 0 24px var(--glow)' : undefined,
        }}
      >
        <CompletionBurst active={burst} />

        <div className="flex items-start gap-3">
          {/* Drag handle */}
          <button
            {...attributes} {...listeners}
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', padding: 0, marginTop: 2, cursor: 'grab' }}
            tabIndex={-1}
          >
            <GripVertical size={15} />
          </button>

          {/* Status toggle */}
          <button
            onClick={cycleStatus}
            className="flex-shrink-0 transition-transform hover:scale-110"
            style={{ background: 'none', border: 'none', padding: 0, marginTop: 2, cursor: 'pointer' }}
          >
            {isCompleted ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}>
                <CheckCircle2 size={18} style={{ color: '#22c55e' }} />
              </motion.div>
            ) : isInProgress ? (
              <motion.div animate={{ rotate: 360 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}>
                <Circle size={18} style={{ color: 'var(--accent-light)' }} strokeDasharray="4 2" />
              </motion.div>
            ) : (
              <Circle size={18} style={{ color: 'var(--text-muted)' }} />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p
                className="text-sm font-medium leading-snug"
                style={{
                  color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: isCompleted ? 'line-through' : 'none',
                }}
              >
                {task.title}
              </p>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                {!isCompleted && (
                  <button onClick={handleTimerToggle}
                    className="p-1 rounded transition-colors"
                    style={{
                      color: isRunning ? 'var(--accent-light)' : 'var(--text-muted)',
                      background: isRunning ? 'var(--glow)' : 'none',
                      border: 'none', cursor: 'pointer',
                    }}
                    title={isRunning ? 'Stop timer' : 'Start timer'}
                  >
                    {isRunning ? <Square size={12} /> : <Play size={12} />}
                  </button>
                )}
                <button onClick={() => onEdit(task)}
                  className="p-1 rounded transition-colors"
                  style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <Pencil size={12} />
                </button>
                <button onClick={() => deleteTask(task.id)}
                  className="p-1 rounded transition-colors"
                  style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            {task.description && (
              <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                {task.description}
              </p>
            )}

            {/* Live timer */}
            <AnimatePresence>
              {isRunning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} className="overflow-hidden"
                >
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <motion.span
                      className="rounded-full"
                      style={{ width: 6, height: 6, background: 'var(--accent)', display: 'inline-block' }}
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="font-mono text-xs" style={{ color: 'var(--accent-light)' }}>
                      {formatElapsed(elapsedSeconds)}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>running</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <PriorityBadge priority={task.priority} />
              <EnergyBadge energy={task.energyLevel} />
              {task.recurring && <RecurringBadge interval={task.recurring.interval} />}

              {task.dueDate && (
                <span className="flex items-center gap-1 text-xs" style={{ color: dueDateColor }}>
                  <Calendar size={10} />
                  {format(new Date(task.dueDate), 'MMM d')}
                  {dueDateOverdue && ' · Overdue'}
                  {dueDateToday && !dueDateOverdue && ' · Today'}
                </span>
              )}

              {(task.estimatedMinutes || task.actualMinutes > 0) && (
                <span
                  className="flex items-center gap-1 text-xs"
                  style={{ color: timeAccuracyColor(task.actualMinutes, task.estimatedMinutes) }}
                  title={task.estimatedMinutes
                    ? `Est: ${formatMinutes(task.estimatedMinutes)} · Actual: ${formatMinutes(task.actualMinutes)}`
                    : `Actual: ${formatMinutes(task.actualMinutes)}`}
                >
                  <Clock size={10} />
                  {task.actualMinutes > 0 && <span>{formatMinutes(task.actualMinutes)}</span>}
                  {task.estimatedMinutes && task.actualMinutes > 0 && (
                    <span style={{ color: 'var(--text-muted)' }}>/</span>
                  )}
                  {task.estimatedMinutes && (
                    <span style={{ color: 'var(--text-muted)' }}>{formatMinutes(task.estimatedMinutes)}</span>
                  )}
                </span>
              )}

              {task.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <Tag size={9} />{tag}
                </span>
              ))}
            </div>

            {/* Subtasks */}
            {task.subtasks.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="flex items-center gap-1 text-xs transition-colors"
                  style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  {expanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                  {completedSubtasks}/{task.subtasks.length} subtasks
                </button>

                <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'var(--accent)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${subtaskProgress * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>

                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <ul className="mt-2 space-y-1.5">
                        {task.subtasks.map((st) => (
                          <li key={st.id} className="flex items-center gap-2">
                            <button onClick={() => toggleSubtask(task.id, st.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                              {st.completed
                                ? <CheckCircle2 size={13} style={{ color: '#22c55e' }} />
                                : <Circle size={13} style={{ color: 'var(--text-muted)' }} />}
                            </button>
                            <span
                              className="text-xs"
                              style={{
                                color: st.completed ? 'var(--text-muted)' : 'var(--text-secondary)',
                                textDecoration: st.completed ? 'line-through' : 'none',
                              }}
                            >
                              {st.title}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
