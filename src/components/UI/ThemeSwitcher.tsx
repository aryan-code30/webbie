import { motion } from 'framer-motion'
import { useThemeStore, THEMES } from '../../store/themeStore'

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore()

  return (
    <div className="px-3 py-3">
      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Theme
      </p>
      <div className="flex gap-2">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            title={t.label}
            className="relative rounded-full transition-transform hover:scale-110"
            style={{
              width: 22, height: 22,
              background: t.preview,
              border: theme === t.id ? `2px solid ${t.accent}` : '2px solid transparent',
              boxShadow: theme === t.id ? `0 0 8px ${t.accent}60` : 'none',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
            }}
          >
            {/* Accent dot in the center */}
            <span
              className="absolute rounded-full"
              style={{
                width: 8, height: 8,
                background: t.accent,
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.9,
              }}
            />
            {theme === t.id && (
              <motion.span
                layoutId="theme-ring"
                className="absolute inset-0 rounded-full"
                style={{ border: `2px solid ${t.accent}`, boxShadow: `0 0 10px ${t.accent}` }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
