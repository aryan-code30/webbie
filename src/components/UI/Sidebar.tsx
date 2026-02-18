import { CheckSquare, BarChart2, Timer, Calendar, Sparkles, Settings } from 'lucide-react'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { id: 'tasks',     label: 'Tasks',     icon: <CheckSquare size={18} /> },
  { id: 'focus',     label: 'Focus',     icon: <Timer size={18} /> },
  { id: 'checkin',   label: 'Check-in',  icon: <Calendar size={18} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={18} /> },
  { id: 'ai',        label: 'AI Planner',icon: <Sparkles size={18} /> },
]

interface SidebarProps {
  active: string
  onChange: (id: string) => void
}

export function Sidebar({ active, onChange }: SidebarProps) {
  return (
    <aside className="w-56 flex-shrink-0 h-screen flex flex-col border-r border-[#1f2937] bg-[#0d0d0d]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#1f2937]">
        <span className="text-xl font-bold tracking-tight">
          <span className="text-white">web</span>
          <span className="text-purple-400">bie</span>
        </span>
        <p className="text-xs text-gray-600 mt-0.5">Your focus space</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-purple-950/60 text-purple-300 shadow-sm'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-[#1f2937]'
              }`}
            >
              <span className={isActive ? 'text-purple-400' : 'text-gray-600'}>{item.icon}</span>
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-[#1f2937]">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:text-gray-300 hover:bg-[#1f2937] transition-colors">
          <Settings size={18} />
          Settings
        </button>
      </div>
    </aside>
  )
}
