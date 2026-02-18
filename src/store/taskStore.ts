import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'
import { addDays, addWeeks, addMonths } from 'date-fns'
import type {
  Task,
  TaskStatus,
  TaskPriority,
  EnergyLevel,
  Subtask,
  FilterStatus,
  SortMode,
  RecurringInterval,
} from '../types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function priorityScore(p: TaskPriority): number {
  return { critical: 4, high: 3, medium: 2, low: 1 }[p]
}

function energyScore(e: EnergyLevel): number {
  return { high: 3, medium: 2, low: 1 }[e]
}

function sortTasks(tasks: Task[], mode: SortMode): Task[] {
  const copy = [...tasks]
  switch (mode) {
    case 'deadline':
      return copy.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      })
    case 'priority':
      return copy.sort((a, b) => priorityScore(b.priority) - priorityScore(a.priority))
    case 'energy':
      return copy.sort((a, b) => energyScore(b.energyLevel) - energyScore(a.energyLevel))
    case 'manual':
      return copy.sort((a, b) => a.order - b.order)
    case 'created':
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    default:
      return copy
  }
}

function nextOccurrenceDate(from: Date, interval: RecurringInterval, customDays?: number): Date {
  switch (interval) {
    case 'daily':   return addDays(from, 1)
    case 'weekly':  return addWeeks(from, 1)
    case 'monthly': return addMonths(from, 1)
    case 'custom':  return addDays(from, customDays ?? 1)
  }
}

// ─── Store types ─────────────────────────────────────────────────────────────

interface TaskState {
  tasks: Task[]
  filterStatus: FilterStatus
  sortMode: SortMode
  searchQuery: string

  // Active timer — only one task can be timed at a time
  timerTaskId: string | null
  timerStartedAt: string | null // ISO string

  // Actions
  addTask: (input: Partial<Task> & { title: string }) => Task
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  setStatus: (id: string, status: TaskStatus) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  addSubtask: (taskId: string, title: string) => void
  deleteSubtask: (taskId: string, subtaskId: string) => void
  reorderTasks: (activeId: string, overId: string) => void
  setFilter: (status: FilterStatus) => void
  setSort: (mode: SortMode) => void
  setSearch: (q: string) => void
  getFiltered: () => Task[]

  // Timer actions
  startTimer: (taskId: string) => void
  stopTimer: () => void
  addActualMinutes: (taskId: string, minutes: number) => void
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      filterStatus: 'all',
      sortMode: 'deadline',
      searchQuery: '',
      timerTaskId: null,
      timerStartedAt: null,

      addTask: (input) => {
        const { tasks } = get()
        const newTask: Task = {
          id: uuid(),
          title: input.title,
          description: input.description ?? '',
          status: input.status ?? 'pending',
          priority: input.priority ?? 'medium',
          energyLevel: input.energyLevel ?? 'medium',
          estimatedMinutes: input.estimatedMinutes,
          actualMinutes: 0,
          dueDate: input.dueDate,
          tags: input.tags ?? [],
          subtasks: input.subtasks ?? [],
          recurring: input.recurring,
          focusSessions: 0,
          createdAt: new Date().toISOString(),
          order: tasks.length,
        }
        set({ tasks: [...tasks, newTask] })
        return newTask
      },

      updateTask: (id, updates) => {
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }))
      },

      deleteTask: (id) => {
        const { timerTaskId } = get()
        if (timerTaskId === id) {
          set({ timerTaskId: null, timerStartedAt: null })
        }
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
      },

      setStatus: (id, status) => {
        const { tasks } = get()
        const task = tasks.find((t) => t.id === id)
        if (!task) return

        // Stop timer if this task was being timed
        if (status === 'completed' && get().timerTaskId === id) {
          get().stopTimer()
        }

        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, status, completedAt: status === 'completed' ? new Date().toISOString() : undefined }
              : t
          ),
        }))

        // Auto-spawn next recurring task on completion
        if (status === 'completed' && task.recurring) {
          const base = task.dueDate ? new Date(task.dueDate) : new Date()
          const nextDate = nextOccurrenceDate(base, task.recurring.interval, task.recurring.customDays)
          const nextISO = nextDate.toISOString()

          const { tasks: currentTasks } = get()
          const nextTask: Task = {
            id: uuid(),
            title: task.title,
            description: task.description,
            status: 'pending',
            priority: task.priority,
            energyLevel: task.energyLevel,
            estimatedMinutes: task.estimatedMinutes,
            actualMinutes: 0,
            dueDate: nextISO,
            tags: task.tags,
            subtasks: task.subtasks.map((st) => ({ ...st, completed: false })),
            recurring: { ...task.recurring, nextOccurrence: nextISO },
            focusSessions: 0,
            createdAt: new Date().toISOString(),
            order: currentTasks.length,
          }
          set((s) => ({ tasks: [...s.tasks, nextTask] }))
        }
      },

      toggleSubtask: (taskId, subtaskId) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  subtasks: t.subtasks.map((st) =>
                    st.id === subtaskId ? { ...st, completed: !st.completed } : st
                  ),
                }
              : t
          ),
        }))
      },

      addSubtask: (taskId, title) => {
        const subtask: Subtask = { id: uuid(), title, completed: false }
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, subtasks: [...t.subtasks, subtask] } : t
          ),
        }))
      },

      deleteSubtask: (taskId, subtaskId) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? { ...t, subtasks: t.subtasks.filter((st) => st.id !== subtaskId) }
              : t
          ),
        }))
      },

      reorderTasks: (activeId, overId) => {
        const { tasks } = get()
        const activeIdx = tasks.findIndex((t) => t.id === activeId)
        const overIdx = tasks.findIndex((t) => t.id === overId)
        if (activeIdx === -1 || overIdx === -1) return
        const reordered = [...tasks]
        const [moved] = reordered.splice(activeIdx, 1)
        reordered.splice(overIdx, 0, moved)
        set({ tasks: reordered.map((t, i) => ({ ...t, order: i })) })
      },

      setFilter: (filterStatus) => set({ filterStatus }),
      setSort: (sortMode) => set({ sortMode }),
      setSearch: (searchQuery) => set({ searchQuery }),

      getFiltered: () => {
        const { tasks, filterStatus, sortMode, searchQuery } = get()
        let filtered = tasks

        if (filterStatus !== 'all') {
          filtered = filtered.filter((t) => t.status === filterStatus)
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          filtered = filtered.filter(
            (t) =>
              t.title.toLowerCase().includes(q) ||
              t.description?.toLowerCase().includes(q) ||
              t.tags.some((tag) => tag.toLowerCase().includes(q))
          )
        }

        return sortTasks(filtered, sortMode)
      },

      // ─── Timer ───────────────────────────────────────────────────────────

      startTimer: (taskId) => {
        const { timerTaskId, timerStartedAt } = get()
        // If another task is running, save its time first
        if (timerTaskId && timerStartedAt && timerTaskId !== taskId) {
          const elapsed = Math.floor(
            (Date.now() - new Date(timerStartedAt).getTime()) / 60000
          )
          if (elapsed > 0) get().addActualMinutes(timerTaskId, elapsed)
        }
        set({ timerTaskId: taskId, timerStartedAt: new Date().toISOString() })
        // Also flip status to in_progress if pending
        const task = get().tasks.find((t) => t.id === taskId)
        if (task?.status === 'pending') {
          set((s) => ({
            tasks: s.tasks.map((t) =>
              t.id === taskId ? { ...t, status: 'in_progress' } : t
            ),
          }))
        }
      },

      stopTimer: () => {
        const { timerTaskId, timerStartedAt } = get()
        if (!timerTaskId || !timerStartedAt) return
        const elapsed = Math.floor(
          (Date.now() - new Date(timerStartedAt).getTime()) / 60000
        )
        if (elapsed > 0) get().addActualMinutes(timerTaskId, elapsed)
        set({ timerTaskId: null, timerStartedAt: null })
      },

      addActualMinutes: (taskId, minutes) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, actualMinutes: t.actualMinutes + minutes } : t
          ),
        }))
      },
    }),
    {
      name: 'webbie-tasks',
      // Don't persist active timer (reset on page load)
      partialize: (s) => ({
        tasks: s.tasks,
        filterStatus: s.filterStatus,
        sortMode: s.sortMode,
        searchQuery: s.searchQuery,
      }),
    }
  )
)
