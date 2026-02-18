// ─── Task ────────────────────────────────────────────────────────────────────

export type TaskStatus = 'pending' | 'in_progress' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'
export type EnergyLevel = 'low' | 'medium' | 'high'
export type RecurringInterval = 'daily' | 'weekly' | 'monthly' | 'custom'

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface RecurringConfig {
  interval: RecurringInterval
  customDays?: number
  nextOccurrence: string // ISO date string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  energyLevel: EnergyLevel
  estimatedMinutes?: number
  actualMinutes: number
  dueDate?: string // ISO date string
  tags: string[]
  subtasks: Subtask[]
  recurring?: RecurringConfig
  focusSessions: number
  createdAt: string
  completedAt?: string
  order: number // for manual reordering
}

// ─── Focus Session ───────────────────────────────────────────────────────────

export interface FocusSession {
  id: string
  taskId?: string
  startedAt: string
  endedAt?: string
  durationMinutes: number
  completed: boolean
}

// ─── Daily Check-in ──────────────────────────────────────────────────────────

export type MoodScore = 1 | 2 | 3 | 4 | 5

export interface DailyCheckIn {
  id: string
  date: string // YYYY-MM-DD
  morningGoals: string[]
  eveningReflection?: string
  mood?: MoodScore
  createdAt: string
}

// ─── UI helpers ──────────────────────────────────────────────────────────────

export type FilterStatus = TaskStatus | 'all'
export type SortMode = 'deadline' | 'priority' | 'energy' | 'manual' | 'created'
