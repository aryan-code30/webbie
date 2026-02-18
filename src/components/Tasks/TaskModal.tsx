import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { Modal } from '../UI/Modal'
import { useTaskStore } from '../../store/taskStore'
import type { Task, TaskPriority, EnergyLevel } from '../../types'

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

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      energyLevel: form.energyLevel,
      estimatedMinutes: form.estimatedMinutes ? Number(form.estimatedMinutes) : undefined,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      subtasks,
    }

    if (isEdit && task) {
      updateTask(task.id, payload)
    } else {
      addTask(payload)
    }
    onClose()
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  })

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Task' : 'New Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Title *</label>
          <input className="input" placeholder="What needs to be done?" autoFocus {...field('title')} />
          {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Optional details..."
            {...field('description')}
          />
        </div>

        {/* Priority + Energy row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Priority</label>
            <select className="input" {...field('priority')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Energy</label>
            <select className="input" {...field('energyLevel')}>
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
            <input type="date" className="input" {...field('dueDate')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Est. Minutes</label>
            <input
              type="number"
              min="1"
              className="input"
              placeholder="e.g. 30"
              {...field('estimatedMinutes')}
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Tags <span className="text-gray-600">(comma-separated)</span>
          </label>
          <input className="input" placeholder="design, frontend, urgent" {...field('tags')} />
        </div>

        {/* Subtasks */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Subtasks</label>
          <div className="flex gap-2">
            <input
              className="input"
              placeholder="Add a subtask..."
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubtask() } }}
            />
            <button type="button" onClick={addSubtask} className="btn-ghost flex-shrink-0">
              <Plus size={14} />
            </button>
          </div>
          {subtasks.length > 0 && (
            <ul className="mt-2 space-y-1">
              {subtasks.map((st) => (
                <li key={st.id} className="flex items-center justify-between px-2 py-1 rounded bg-[#0d0d0d] text-xs text-gray-400">
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
