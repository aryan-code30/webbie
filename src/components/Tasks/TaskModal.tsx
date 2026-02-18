import { useState, useEffect } from 'react'
import { Plus, X, RefreshCw } from 'lucide-react'
import { Modal } from '../UI/Modal'
import { useTaskStore } from '../../store/taskStore'
import type { Task, TaskPriority, EnergyLevel, RecurringInterval } from '../../types'

interface TaskModalProps {
  open: boolean
  onClose: () => void
  task?: Task | null
}

const emptyForm = {
  title: '',
  description: '',
  priority: 'medium' as TaskPriority,
  energyLevel: 'medium' as EnergyLevel,
  estimatedMinutes: '',
  dueDate: '',
  tags: '',
  recurring: false,
  recurringInterval: 'weekly' as RecurringInterval,
  recurringCustomDays: '7',
}

export function TaskModal({ open, onClose, task }: TaskModalProps) {
  const { addTask, updateTask } = useTaskStore()
  const [form, setForm] = useState(emptyForm)
  const [subtaskInput, setSubtaskInput] = useState('')
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([])
  const [error, setError] = useState('')

  const isEdit = !!task

  useEffect(() => {
    if (open) {
      if (task) {
        setForm({
          title: task.title,
          description: task.description ?? '',
          priority: task.priority,
          energyLevel: task.energyLevel,
          estimatedMinutes: task.estimatedMinutes ? String(task.estimatedMinutes) : '',
          dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
          tags: task.tags.join(', '),
          recurring: !!task.recurring,
          recurringInterval: task.recurring?.interval ?? 'weekly',
          recurringCustomDays: String(task.recurring?.customDays ?? 7),
        })
        setSubtasks(task.subtasks)
      } else {
        setForm(emptyForm)
        setSubtasks([])
      }
      setError('')
    }
  }, [open, task])

  function addSubtask() {
    if (!subtaskInput.trim()) return
    setSubtasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: subtaskInput.trim(), completed: false },
    ])
    setSubtaskInput('')
  }

  function removeSubtask(id: string) {
    setSubtasks((prev) => prev.filter((s) => s.id !== id))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }

    const dueDateISO = form.dueDate ? new Date(form.dueDate).toISOString() : undefined

    const recurringConfig = form.recurring
      ? {
          interval: form.recurringInterval,
          customDays:
            form.recurringInterval === 'custom' ? Number(form.recurringCustomDays) : undefined,
          nextOccurrence: dueDateISO ?? new Date().toISOString(),
        }
      : undefined

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      energyLevel: form.energyLevel,
      estimatedMinutes: form.estimatedMinutes ? Number(form.estimatedMinutes) : undefined,
      dueDate: dueDateISO,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      subtasks,
      recurring: recurringConfig,
    }

    if (isEdit && task) {
      updateTask(task.id, payload)
    } else {
      addTask(payload)
    }
    onClose()
  }

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const inputField = (key: keyof typeof form) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  })

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Task' : 'New Task'} width="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Title *</label>
          <input
            className="input"
            placeholder="What needs to be done?"
            autoFocus
            {...inputField('title')}
          />
          {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Optional details..."
            {...inputField('description')}
          />
        </div>

        {/* Priority + Energy row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Priority</label>
            <select className="input" {...inputField('priority')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Energy Required</label>
            <select className="input" {...inputField('energyLevel')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Due date + Estimated time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Due Date</label>
            <input type="date" className="input" {...inputField('dueDate')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Est. Minutes</label>
            <input
              type="number"
              min="1"
              className="input"
              placeholder="e.g. 30"
              {...inputField('estimatedMinutes')}
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Tags <span className="text-gray-600">(comma-separated)</span>
          </label>
          <input className="input" placeholder="design, frontend, urgent" {...inputField('tags')} />
        </div>

        {/* ─── Recurring ─────────────────────────────────────────────── */}
        <div className="rounded-lg border border-[#1f2937] p-3 space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-2 text-xs font-medium text-gray-300">
              <RefreshCw size={13} className="text-violet-400" />
              Repeat this task
            </span>
            {/* Toggle */}
            <button
              type="button"
              onClick={() => setField('recurring', !form.recurring)}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                form.recurring ? 'bg-violet-600' : 'bg-[#374151]'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  form.recurring ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </label>

          {form.recurring && (
            <div className="space-y-3">
              {/* Interval selector */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Repeat every</label>
                <div className="flex gap-2">
                  {(['daily', 'weekly', 'monthly', 'custom'] as RecurringInterval[]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setField('recurringInterval', opt)}
                      className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        form.recurringInterval === opt
                          ? 'bg-violet-600 text-white'
                          : 'bg-[#0d0d0d] text-gray-500 hover:text-gray-300 border border-[#1f2937]'
                      }`}
                    >
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom days input */}
              {form.recurringInterval === 'custom' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Every N days
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="input"
                    placeholder="e.g. 3"
                    {...inputField('recurringCustomDays')}
                  />
                </div>
              )}

              <p className="text-xs text-gray-600">
                When you complete this task, a new one will appear automatically with the next due date.
              </p>
            </div>
          )}
        </div>

        {/* ─── Subtasks ──────────────────────────────────────────────── */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Subtasks</label>
          <div className="flex gap-2">
            <input
              className="input"
              placeholder="Add a subtask..."
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); addSubtask() }
              }}
            />
            <button type="button" onClick={addSubtask} className="btn-ghost flex-shrink-0">
              <Plus size={14} />
            </button>
          </div>
          {subtasks.length > 0 && (
            <ul className="mt-2 space-y-1">
              {subtasks.map((st) => (
                <li
                  key={st.id}
                  className="flex items-center justify-between px-2 py-1 rounded bg-[#0d0d0d] text-xs text-gray-400"
                >
                  {st.title}
                  <button type="button" onClick={() => removeSubtask(st.id)}>
                    <X size={12} className="text-gray-600 hover:text-rose-400" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" className="btn-primary">
            {isEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
