import type { ReactNode } from 'react'

interface NavItem { id: string; label: string; icon: string }

interface PortalLayoutProps {
  logo: string
  role: string
  roleColor: string
  navItems: NavItem[]
  activeNav: string
  onNavChange: (id: string) => void
  children: ReactNode
  darkMode: boolean
  toggleDark: () => void
  onLogout: () => void
  notifCount?: number
  avatarInitials?: string
  avatarBg?: string
  headerRight?: ReactNode
}

export default function PortalLayout({
  logo, role, roleColor, navItems, activeNav, onNavChange,
  children, darkMode, toggleDark, onLogout, notifCount = 0,
  avatarInitials = 'JD', avatarBg = '#22313f', headerRight,
}: PortalLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>

      {/* ── Sidebar ── */}
      <aside className="flex flex-col w-60 flex-shrink-0 border-r"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#22313f' }}>
            <span className="text-white font-bold text-sm" style={{ fontFamily: 'Plus Jakarta Sans' }}>O</span>
          </div>
          <div>
            <div className="font-bold text-sm leading-none" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>OJTern</div>
            <div className="text-[10px] mt-0.5 font-semibold" style={{ color: roleColor }}>{role}</div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const active = activeNav === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNavChange(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all hover:opacity-90"
                style={{
                  backgroundColor: active ? '#e4f1fe' : 'transparent',
                  color:           active ? '#22313f' : 'var(--muted-foreground)',
                  fontFamily:      'Plus Jakarta Sans',
                  fontWeight:      active ? 600 : 500,
                }}
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:opacity-80 transition-all"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'Plus Jakarta Sans' }}
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header
          className="flex items-center justify-between px-6 py-3.5 border-b flex-shrink-0"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div
              className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg border text-sm"
              style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
            >
              <span>🔍</span>
              <span style={{ fontFamily: 'Inter' }}>Search {logo}…</span>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 ml-4">
            {headerRight}

            <button
              onClick={toggleDark}
              className="w-8 h-8 rounded-lg flex items-center justify-center border hover:opacity-80 transition-opacity"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center border relative hover:opacity-80 transition-opacity"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}
            >
              <span className="text-sm">🔔</span>
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {notifCount}
                </span>
              )}
            </button>

            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer"
              style={{ backgroundColor: avatarBg, fontFamily: 'Plus Jakarta Sans' }}
            >
              {avatarInitials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
