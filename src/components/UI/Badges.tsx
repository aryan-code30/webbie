import { RefreshCw } from 'lucide-react'
import type { TaskPriority, EnergyLevel, TaskStatus, RecurringInterval } from '../../types'

// ─── Priority Badge ───────────────────────────────────────────────────────────

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  low:      { label: 'Low',      className: 'bg-slate-800 text-slate-400' },
  medium:   { label: 'Medium',   className: 'bg-blue-950 text-blue-400' },
  high:     { label: 'High',     className: 'bg-orange-950 text-orange-400' },
  critical: { label: 'Critical', className: 'bg-red-950 text-red-400' },
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const { label, className } = priorityConfig[priority]
  return <span className={`badge ${className}`}>{label}</span>
}

// ─── Energy Badge ─────────────────────────────────────────────────────────────

const energyConfig: Record<EnergyLevel, { label: string; dot: string; className: string }> = {
  low:    { label: 'Low energy',    dot: 'bg-teal-400',   className: 'bg-teal-950 text-teal-400' },
  medium: { label: 'Med energy',    dot: 'bg-yellow-400', className: 'bg-yellow-950 text-yellow-400' },
  high:   { label: 'High energy',   dot: 'bg-rose-400',   className: 'bg-rose-950 text-rose-400' },
}

export function EnergyBadge({ energy }: { energy: EnergyLevel }) {
  const { label, dot, className } = energyConfig[energy]
  return (
    <span className={`badge ${className}`}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  pending:     { label: 'Pending',     className: 'bg-slate-800 text-slate-400' },
  in_progress: { label: 'In Progress', className: 'bg-purple-950 text-purple-400' },
  completed:   { label: 'Completed',   className: 'bg-green-950 text-green-400' },
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const { label, className } = statusConfig[status]
  return <span className={`badge ${className}`}>{label}</span>
}

// ─── Recurring Badge ──────────────────────────────────────────────────────────

const recurringLabel: Record<RecurringInterval, string> = {
  daily:   'Daily',
  weekly:  'Weekly',
  monthly: 'Monthly',
  custom:  'Custom',
}

export function RecurringBadge({ interval }: { interval: RecurringInterval }) {
  return (
    <span className="badge bg-violet-950 text-violet-400">
      <RefreshCw size={10} />
      {recurringLabel[interval]}
    </span>
  )
}
