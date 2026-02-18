import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus, Search, SlidersHorizontal, ClipboardList } from 'lucide-react'
import { useTaskStore } from '../../store/taskStore'
import { TaskCard } from './TaskCard'
import { TaskModal } from './TaskModal'
import type { FilterStatus, SortMode, Task } from '../../types'

const STATUS_FILTERS: { id: FilterStatus; label: string }[] = [
  { id: 'all',         label: 'All' },
  { id: 'pending',     label: 'Pending' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed',   label: 'Completed' },
]

const SORT_OPTIONS: { id: SortMode; label: string }[] = [
  { id: 'deadline',  label: 'Deadline' },
  { id: 'priority',  label: 'Priority' },
  { id: 'energy',    label: 'Energy' },
  { id: 'manual',    label: 'Manual' },
  { id: 'created',   label: 'Newest' },
]

export function TaskList() {
  const { filterStatus, sortMode, searchQuery, setFilter, setSort, setSearch, reorderTasks, getFiltered } =
    useTaskStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showSortMenu, setShowSortMenu] = useState(false)

  const tasks = getFiltered()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorderTasks(String(active.id), String(over.id))
    }
  }

  function openCreate() {
    setEditingTask(null)
    setModalOpen(true)
  }

  function openEdit(task: Task) {
    setEditingTask(task)
    setModalOpen(true)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-white">Tasks</h1>
          <p className="text-xs text-gray-600 mt-0.5">{tasks.length} tasks</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={15} />
          Add Task
        </button>
      </div>

      {/* Search + Sort */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            className="input pl-8"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowSortMenu((v) => !v)}
            className="btn-ghost"
          >
            <SlidersHorizontal size={14} />
            {SORT_OPTIONS.find((s) => s.id === sortMode)?.label}
          </button>
          {showSortMenu && (
            <div className="absolute right-0 top-full mt-1 z-20 w-36 bg-[#111827] border border-[#1f2937] rounded-lg shadow-xl overflow-hidden">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => { setSort(opt.id); setShowSortMenu(false) }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                    sortMode === opt.id
                      ? 'bg-purple-950/60 text-purple-300'
                      : 'text-gray-400 hover:bg-[#1f2937] hover:text-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex items-center gap-1.5 mb-5 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              filterStatus === f.id
                ? 'bg-purple-600 text-white'
                : 'bg-[#1a1a2e] text-gray-500 hover:text-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ClipboardList size={36} className="text-gray-700 mb-3" />
            <p className="text-sm text-gray-600">No tasks yet.</p>
            <p className="text-xs text-gray-700 mt-1">Click "Add Task" to get started.</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <AnimatePresence>
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} onEdit={openEdit} />
                ))}
              </AnimatePresence>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Create / Edit modal */}
      <TaskModal open={modalOpen} onClose={() => setModalOpen(false)} task={editingTask} />
    </div>
  )
}
