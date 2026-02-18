import { CheckSquare, BarChart2, Timer, Calendar, Sparkles, Settings } from 'lucide-react'
import { ThemeSwitcher } from './ThemeSwitcher'

interface NavItem { id: string; label: string; icon: React.ReactNode }

const NAV_ITEMS: NavItem[] = [
  { id: 'tasks',     label: 'Tasks',      icon: <CheckSquare size={17} /> },
  { id: 'focus',     label: 'Focus',      icon: <Timer size={17} /> },
  { id: 'checkin',   label: 'Check-in',   icon: <Calendar size={17} /> },
  { id: 'analytics', label: 'Analytics',  icon: <BarChart2 size={17} /> },
  { id: 'ai',        label: 'AI Planner', icon: <Sparkles size={17} /> },
]

interface SidebarProps {
  active: string
  onChange: (id: string) => void
}

export function Sidebar({ active, onChange }: SidebarProps) {
  return (
    <aside
      className="w-52 flex-shrink-0 h-screen flex flex-col"
      style={{ borderRight: '1px solid var(--border)', background: 'var(--bg-primary)' }}
    >
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          {/* Logo mark */}
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
            style={{ background: 'var(--accent)' }}
          >
            W
          </div>
          <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            webbie
          </span>
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', marginLeft: '2.25rem' }}>
          your focus space
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`nav-item ${active === item.id ? 'active' : ''}`}
          >
            <span style={{ color: active === item.id ? 'var(--accent)' : 'var(--text-muted)' }}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bottom section */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        {/* Theme switcher */}
        <ThemeSwitcher />

        {/* Settings */}
        <div className="px-2.5 pb-3">
          <button className="nav-item">
            <Settings size={17} style={{ color: 'var(--text-muted)' }} />
            Settings
          </button>
        </div>
      </div>
    </aside>
  )
}
