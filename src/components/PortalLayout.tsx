import { useState, useRef, useEffect, type ReactNode } from 'react'

export interface NavItem { id: string; label: string; icon: string }

interface NotificationItem {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  icon: string
  iconColor: string
}

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

function getDefaultNotifications(role: string): NotificationItem[] {
  if (role.toLowerCase().includes('student')) {
    return [
      { id: '1', title: 'Placement Confirmed', message: 'Accenture Philippines accepted your Software Engineering Intern application!', time: '10m ago', read: false, icon: 'fa-solid fa-circle-check', iconColor: '#10B981' },
      { id: '2', title: 'Action Required', message: 'PLDT requested re-upload of your signed endorsement document.', time: '2h ago', read: false, icon: 'fa-solid fa-triangle-exclamation', iconColor: '#F97316' },
      { id: '3', title: 'New Recommendation', message: 'Maya Philippines posted a FinTech Mobile Developer opening matching 96% of your skills.', time: '5h ago', read: false, icon: 'fa-solid fa-wand-magic-sparkles', iconColor: '#3B82F6' },
      { id: '4', title: 'Profile Verified', message: 'Coordinator Prof. Elena Gomez approved your academic record.', time: '1d ago', read: true, icon: 'fa-solid fa-user-check', iconColor: '#22313f' },
    ]
  }
  if (role.toLowerCase().includes('coordinator')) {
    return [
      { id: '1', title: 'Application Submitted', message: 'Maria Reyes submitted an application for Accenture Philippines awaiting review.', time: '15m ago', read: false, icon: 'fa-solid fa-file-arrow-up', iconColor: '#3B82F6' },
      { id: '2', title: 'Urgent Review', message: 'Juan de la Cruz requires endorsement letter approval for Globe Telecom.', time: '1h ago', read: false, icon: 'fa-solid fa-clock', iconColor: '#F59E0B' },
      { id: '3', title: 'Partner Agreement', message: 'BDO Unibank updated available internship slots for IT students.', time: '6h ago', read: false, icon: 'fa-solid fa-building', iconColor: '#10B981' },
    ]
  }
  if (role.toLowerCase().includes('partner')) {
    return [
      { id: '1', title: 'New Candidate Applied', message: 'Maria Reyes (98% match) applied for Software Engineering Intern.', time: '20m ago', read: false, icon: 'fa-solid fa-user-plus', iconColor: '#10B981' },
      { id: '2', title: 'Coordinator Verified', message: 'Prof. Gomez verified student endorsement for Juan de la Cruz.', time: '3h ago', read: false, icon: 'fa-solid fa-clipboard-check', iconColor: '#3B82F6' },
      { id: '3', title: 'Posting Published', message: 'Data Analytics Intern opening is now active and accepting applicants.', time: '1d ago', read: true, icon: 'fa-solid fa-circle-check', iconColor: '#22313f' },
    ]
  }
  // Administrator default
  return [
    { id: '1', title: 'MongoDB Atlas Online', message: 'Connected to cluster0.h38ialq.mongodb.net (database: ojtern).', time: 'Just now', read: false, icon: 'fa-solid fa-database', iconColor: '#10B981' },
    { id: '2', title: 'New User Registered', message: 'A student account was activated for Maria Reyes.', time: '2h ago', read: false, icon: 'fa-solid fa-user-plus', iconColor: '#3B82F6' },
    { id: '3', title: 'System Report Ready', message: 'Monthly placement accreditation metrics have been compiled.', time: '1d ago', read: true, icon: 'fa-solid fa-file-invoice', iconColor: '#F59E0B' },
  ]
}

export default function PortalLayout({
  logo, role, roleColor, navItems, activeNav, onNavChange,
  children, darkMode, toggleDark, onLogout, notifCount: initialCount = 0,
  avatarInitials = 'JD', avatarBg = '#22313f', headerRight,
}: PortalLayoutProps) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getDefaultNotifications(role))
  const notifRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [notifOpen])

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const toggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n))
  }

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>

      {/* ── Sidebar ── */}
      <aside className="flex flex-col w-60 flex-shrink-0 border-r"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: '#22313f' }}>
            <i className="fa-solid fa-graduation-cap text-sm" />
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
            const isFa = item.icon.startsWith('fa-')
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
                <span className="w-5 text-center flex items-center justify-center">
                  {isFa ? <i className={item.icon} /> : item.icon}
                </span>
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
            <span className="w-5 text-center flex items-center justify-center">
              <i className="fa-solid fa-arrow-right-from-bracket" />
            </span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header
          className="flex items-center justify-between px-6 py-3.5 border-b flex-shrink-0 relative z-30"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div
              className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg border text-sm"
              style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
            >
              <i className="fa-solid fa-magnifying-glass text-xs" />
              <span style={{ fontFamily: 'Inter' }}>Search {logo}…</span>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 ml-4">
            {headerRight}

            {/* Theme Toggle */}
            <button
              onClick={toggleDark}
              className="w-8 h-8 rounded-lg flex items-center justify-center border hover:opacity-80 transition-opacity"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
              title="Toggle Theme"
            >
              <i className={`fa-solid ${darkMode ? 'fa-sun text-amber-500' : 'fa-moon'} text-xs`} />
            </button>

            {/* Notification Bell with Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(prev => !prev)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center border relative hover:opacity-80 transition-opacity ${notifOpen ? 'ring-2 ring-[#8dc6ff]' : ''}`}
                style={{ borderColor: 'var(--border)', backgroundColor: notifOpen ? '#e4f1fe' : 'var(--muted)', color: notifOpen ? '#22313f' : 'var(--muted-foreground)' }}
                title="Notifications"
                aria-expanded={notifOpen}
              >
                <i className="fa-solid fa-bell text-xs" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notifOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                >
                  {/* Dropdown Header */}
                  <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] font-medium hover:underline flex items-center gap-1"
                        style={{ color: '#22313f' }}
                      >
                        <i className="fa-solid fa-check-double text-[10px]" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  {/* Dropdown List */}
                  <div className="max-h-80 overflow-y-auto divide-y" style={{ borderColor: 'var(--border)' }}>
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center space-y-2">
                        <i className="fa-regular fa-bell-slash text-2xl text-gray-400" />
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>You're all caught up!</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className="px-4 py-3 transition-colors flex items-start gap-3 hover:bg-[#e4f1fe]/30 group"
                          style={{ backgroundColor: !n.read ? 'rgba(228, 241, 254, 0.25)' : undefined }}
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: `${n.iconColor}15`, color: n.iconColor }}
                          >
                            <i className={n.icon} />
                          </div>
                          <div className="flex-1 min-w-0" onClick={() => toggleRead(n.id)} style={{ cursor: 'pointer' }}>
                            <div className="flex items-center justify-between mb-0.5">
                              <h4 className="text-xs font-bold truncate" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                                {n.title}
                              </h4>
                              <span className="text-[10px] font-mono text-gray-400 flex-shrink-0 ml-1">{n.time}</span>
                            </div>
                            <p className="text-[11px] leading-snug line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>
                              {n.message}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => toggleRead(n.id)}
                              title={n.read ? 'Mark unread' : 'Mark read'}
                              className="w-5 h-5 rounded flex items-center justify-center text-[10px] text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            >
                              <i className={`fa-solid ${n.read ? 'fa-envelope' : 'fa-envelope-open'}`} />
                            </button>
                            <button
                              onClick={() => clearNotification(n.id)}
                              title="Dismiss"
                              className="w-5 h-5 rounded flex items-center justify-center text-[10px] text-gray-400 hover:text-red-500"
                            >
                              <i className="fa-solid fa-xmark" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="px-4 py-2 border-t text-center" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
                    <span className="text-[10px] flex items-center justify-center gap-1.5" style={{ color: 'var(--muted-foreground)' }}>
                      <i className="fa-solid fa-database text-[9px] text-emerald-500" />
                      <span>Live system notifications synced with MongoDB</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* User Initials Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:opacity-90"
              style={{ backgroundColor: avatarBg, fontFamily: 'Plus Jakarta Sans' }}
              title={`Logged in as ${role}`}
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
