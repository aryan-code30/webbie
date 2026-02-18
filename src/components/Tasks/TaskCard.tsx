import { useState } from 'react'
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

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const { setStatus, deleteTask, toggleSubtask, startTimer, stopTimer } = useTaskStore()
  const [expanded, setExpanded] = useState(false)
  const { isRunning, elapsedSeconds } = useTimer(task.id)

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

  const dueDateOverdue =
    task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'completed'
  const dueDateToday = task.dueDate && isToday(new Date(task.dueDate))
  const dueDateColor = dueDateOverdue ? 'text-rose-400' : dueDateToday ? 'text-amber-400' : 'text-gray-500'

  // Time accuracy colour: green if under estimate, amber if close, rose if over
  function timeAccuracyColor(actual: number, estimated?: number): string {
    if (!estimated || actual === 0) return 'text-gray-500'
    const ratio = actual / estimated
    if (ratio <= 0.9) return 'text-teal-400'
    if (ratio <= 1.1) return 'text-amber-400'
    return 'text-rose-400'
  }

  function cycleStatus() {
    setStatus(task.id, statusCycle[task.status])
  }

  function handleTimerToggle(e: React.MouseEvent) {
    e.stopPropagation()
    if (isRunning) stopTimer()
    else startTimer(task.id)
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className={`card group relative mb-2 ${task.status === 'completed' ? 'opacity-60' : ''} ${
        isRunning ? 'border-purple-700/60 shadow-[0_0_0_1px_rgba(124,58,237,0.25)]' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 text-gray-700 hover:text-gray-500 cursor-grab active:cursor-grabbing transition-colors"
          tabIndex={-1}
        >
          <GripVertical size={16} />
        </button>

        {/* Status toggle */}
        <button
          onClick={cycleStatus}
          className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
        >
          {task.status === 'completed' ? (
            <CheckCircle2 size={18} className="text-green-400" />
          ) : task.status === 'in_progress' ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Circle size={18} className="text-purple-400" strokeDasharray="4 2" />
            </motion.div>
          ) : (
            <Circle size={18} className="text-gray-600 hover:text-gray-400" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-sm font-medium leading-snug ${
                task.status === 'completed' ? 'line-through text-gray-600' : 'text-gray-100'
              }`}
            >
              {task.title}
            </p>

            {/* Actions — visible on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              {/* Timer toggle */}
              {task.status !== 'completed' && (
                <button
                  onClick={handleTimerToggle}
                  className={`p-1 rounded transition-colors ${
                    isRunning
                      ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-950/40'
                      : 'text-gray-600 hover:text-gray-300 hover:bg-[#1f2937]'
                  }`}
                  title={isRunning ? 'Stop timer' : 'Start timer'}
                >
                  {isRunning ? <Square size={13} /> : <Play size={13} />}
                </button>
              )}
              <button
                onClick={() => onEdit(task)}
                className="p-1 rounded text-gray-600 hover:text-gray-300 hover:bg-[#1f2937] transition-colors"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-1 rounded text-gray-600 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{task.description}</p>
          )}

          {/* Live timer display */}
          <AnimatePresence>
            {isRunning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-1.5 mt-1.5">
                  <motion.div
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-purple-400"
                  />
                  <span className="text-xs font-mono text-purple-300">
                    {formatElapsed(elapsedSeconds)}
                  </span>
                  <span className="text-xs text-gray-600">running</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <PriorityBadge priority={task.priority} />
            <EnergyBadge energy={task.energyLevel} />

            {task.recurring && <RecurringBadge interval={task.recurring.interval} />}

            {task.dueDate && (
              <span className={`flex items-center gap-1 text-xs ${dueDateColor}`}>
                <Calendar size={11} />
                {format(new Date(task.dueDate), 'MMM d')}
                {dueDateOverdue && ' · Overdue'}
                {dueDateToday && ' · Today'}
              </span>
            )}

            {/* Time: estimated vs actual */}
            {(task.estimatedMinutes || task.actualMinutes > 0) && (
              <span
                className={`flex items-center gap-1 text-xs ${timeAccuracyColor(
                  task.actualMinutes,
                  task.estimatedMinutes
                )}`}
                title={
                  task.estimatedMinutes
                    ? `Estimated: ${formatMinutes(task.estimatedMinutes)} · Actual: ${formatMinutes(task.actualMinutes)}`
                    : `Actual: ${formatMinutes(task.actualMinutes)}`
                }
              >
                <Clock size={11} />
                {task.actualMinutes > 0 && <span>{formatMinutes(task.actualMinutes)}</span>}
                {task.estimatedMinutes && task.actualMinutes > 0 && (
                  <span className="text-gray-700">/</span>
                )}
                {task.estimatedMinutes && (
                  <span className="text-gray-600">{formatMinutes(task.estimatedMinutes)}</span>
                )}
              </span>
            )}

            {task.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 text-xs text-gray-600">
                <Tag size={10} />
                {tag}
              </span>
            ))}
          </div>

          {/* Subtask progress bar + list */}
          {task.subtasks.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                {completedSubtasks}/{task.subtasks.length} subtasks
              </button>
              <div className="mt-1.5 h-1 bg-[#1f2937] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-purple-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${subtaskProgress * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <ul className="mt-2 space-y-1">
                      {task.subtasks.map((st) => (
                        <li key={st.id} className="flex items-center gap-2">
                          <button onClick={() => toggleSubtask(task.id, st.id)}>
                            {st.completed ? (
                              <CheckCircle2 size={13} className="text-green-400" />
                            ) : (
                              <Circle size={13} className="text-gray-600" />
                            )}
                          </button>
                          <span
                            className={`text-xs ${
                              st.completed ? 'line-through text-gray-600' : 'text-gray-400'
                            }`}
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
    </motion.div>
  )
}
