import { useState } from 'react'
import { Sidebar } from './components/UI/Sidebar'
import { TaskList } from './components/Tasks/TaskList'

type Page = 'tasks' | 'focus' | 'checkin' | 'analytics' | 'ai'

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <p className="text-4xl mb-4">🚧</p>
      <h2 className="text-lg font-semibold text-white mb-1">{label}</h2>
      <p className="text-sm text-gray-600">Coming in the next phase.</p>
    </div>
  )
}

function App() {
  const [page, setPage] = useState<Page>('tasks')

  return (
    <div className="flex h-screen overflow-hidden bg-[#0d0d0d]">
      <Sidebar active={page} onChange={(id) => setPage(id as Page)} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-8 h-full">
          {page === 'tasks'     && <TaskList />}
          {page === 'focus'     && <ComingSoon label="Focus Mode + Pomodoro" />}
          {page === 'checkin'   && <ComingSoon label="Daily Check-ins" />}
          {page === 'analytics' && <ComingSoon label="Analytics Dashboard" />}
          {page === 'ai'        && <ComingSoon label="AI Task Planner" />}
        </div>
      </main>
    </div>
  )
}

export default App
