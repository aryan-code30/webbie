import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './components/UI/Sidebar'
import { Header } from './components/UI/Header'
import { TaskList } from './components/Tasks/TaskList'
import { useThemeStore } from './store/themeStore'

type Page = 'tasks' | 'focus' | 'checkin' | 'analytics' | 'ai'

const PAGE_LABELS: Record<Page, string> = {
  tasks:     'Tasks',
  focus:     'Focus Mode & Pomodoro',
  checkin:   'Daily Check-ins',
  analytics: 'Analytics Dashboard',
  ai:        'AI Task Planner',
}

const PAGE_EMOJIS: Record<Page, string> = {
  tasks: '✅', focus: '⏱️', checkin: '🌅', analytics: '📊', ai: '✨',
}

function ComingSoon({ page }: { page: Page }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-20">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="text-5xl mb-5"
        style={{ animation: 'float 4s ease-in-out infinite' }}
      >
        {PAGE_EMOJIS[page]}
      </motion.div>
      <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        {PAGE_LABELS[page]}
      </h2>
      <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
        Coming in the next phase.
      </p>
      <div
        className="mt-4 px-3 py-1.5 rounded-full text-xs"
        style={{ background: 'var(--glow)', color: 'var(--accent-light)', border: '1px solid var(--border)' }}
      >
        Planned ✓
      </div>
    </div>
  )
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
}

function App() {
  const [page, setPage] = useState<Page>('tasks')
  const { theme } = useThemeStore()

  // Ensure theme attribute is set on HTML element on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      <Sidebar active={page} onChange={(id) => setPage(id as Page)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="h-full"
            >
              <div className="max-w-3xl mx-auto px-8 py-8 h-full">
                {page === 'tasks'     && <TaskList />}
                {page === 'focus'     && <ComingSoon page="focus" />}
                {page === 'checkin'   && <ComingSoon page="checkin" />}
                {page === 'analytics' && <ComingSoon page="analytics" />}
                {page === 'ai'        && <ComingSoon page="ai" />}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default App
