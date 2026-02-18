import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, Circle, Clock, ChevronDown, ChevronRight,
  Trash2, Pencil, GripVertical, Calendar, Tag,
} from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format, isPast, isToday } from 'date-fns'
import type { Task } from '../../types'
import { useTaskStore } from '../../store/taskStore'
import { PriorityBadge, EnergyBadge } from '../UI/Badges'

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
  const { setStatus, deleteTask, toggleSubtask } = useTaskStore()
  const [expanded, setExpanded] = useState(false)

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

  const dueDateColor = dueDateOverdue
    ? 'text-rose-400'
    : dueDateToday
    ? 'text-amber-400'
    : 'text-gray-500'

  function cycleStatus() {
    const next = statusCycle[task.status]
    setStatus(task.id, next)
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
      className={`card group relative mb-2 ${
        task.status === 'completed' ? 'opacity-60' : ''
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
                task.status === 'completed'
                  ? 'line-through text-gray-600'
                  : 'text-gray-100'
              }`}
            >
              {task.title}
            </p>

            {/* Actions — visible on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
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

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <PriorityBadge priority={task.priority} />
            <EnergyBadge energy={task.energyLevel} />

            {task.dueDate && (
              <span className={`flex items-center gap-1 text-xs ${dueDateColor}`}>
                <Calendar size={11} />
                {format(new Date(task.dueDate), 'MMM d')}
                {dueDateOverdue && ' · Overdue'}
                {dueDateToday && ' · Today'}
              </span>
            )}

            {task.estimatedMinutes && (
              <span className="flex items-center gap-1 text-xs text-gray-600">
                <Clock size={11} />
                {task.estimatedMinutes}m
              </span>
            )}

            {task.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 text-xs text-gray-600">
                <Tag size={10} />
                {tag}
              </span>
            ))}
          </div>

          {/* Subtask progress bar */}
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
