import { useState, useRef, useEffect, type ReactNode } from 'react'

export interface NavItem { id: string; label: string; icon: string }

export interface NotificationItem {
  id: string
  title: string
  message: string
  detail?: string
  time: string
  read: boolean
  icon: string
  iconColor: string
  targetNav?: string
  actionLabel?: string
  metaBadge?: string
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
  customNotifications?: NotificationItem[]
}

function getDefaultNotifications(role: string): NotificationItem[] {
  if (role.toLowerCase().includes('student')) {
    return [
      {
        id: '1',
        title: 'Placement Confirmed',
        message: 'Accenture Philippines accepted your Software Engineering Intern application!',
        detail: 'Congratulations! Your application has been reviewed and officially approved by Accenture Talent Acquisition. Your OJT coordinator will provide your onboarding instructions and orientation schedule.',
        metaBadge: 'Accepted · 98% Match',
        time: '10m ago',
        read: false,
        icon: 'fa-solid fa-circle-check',
        iconColor: '#10B981',
        targetNav: 'tracker',
        actionLabel: 'Open Application Tracker',
      },
      {
        id: '2',
        title: 'Document Returned for Correction',
        message: 'PLDT Enterprise requested re-upload of your signed endorsement document.',
        detail: 'The endorsement letter submitted on Feb 5 was returned: "Please ensure the College of Computer Studies dry seal and coordinator signature are clearly visible before final approval."',
        metaBadge: 'Action Required',
        time: '2h ago',
        read: false,
        icon: 'fa-solid fa-triangle-exclamation',
        iconColor: '#F97316',
        targetNav: 'tracker',
        actionLabel: 'Re-upload Document in Tracker',
      },
      {
        id: '3',
        title: 'High-Match Internship Recommendation',
        message: 'Maya Philippines posted a FinTech Mobile Developer opening matching 96% of your skills.',
        detail: 'Ranked #1 for your profile based on React Native, TypeScript, and REST APIs. Location: Mandaluyong (Hybrid). 2 open slots remaining.',
        metaBadge: '96% Skill Compatibility',
        time: '5h ago',
        read: false,
        icon: 'fa-solid fa-wand-magic-sparkles',
        iconColor: '#3B82F6',
        targetNav: 'recommendations',
        actionLabel: 'View Opening & Fast Apply',
      },
      {
        id: '4',
        title: 'Profile & Hours Verified',
        message: 'Coordinator Prof. Elena Gomez approved your academic record and OJT hours.',
        detail: 'Your 120 completed OJT hours out of 500 required have been officially audited and validated on your student profile.',
        metaBadge: 'Profile Audited',
        time: '1d ago',
        read: true,
        icon: 'fa-solid fa-user-check',
        iconColor: '#22313f',
        targetNav: 'profile',
        actionLabel: 'View Profile Settings',
      },
    ]
  }
  if (role.toLowerCase().includes('coordinator')) {
    return [
      {
        id: '1',
        title: 'Application Awaiting Verification',
        message: 'Maria Reyes submitted an application for Accenture Philippines.',
        detail: 'Student ID 2021-00132 (BS Computer Science, 3rd Year) submitted a signed endorsement letter and resume for Software Engineering Intern (98% match).',
        metaBadge: 'Pending Verification · High Priority',
        time: '15m ago',
        read: false,
        icon: 'fa-solid fa-file-arrow-up',
        iconColor: '#3B82F6',
        targetNav: 'verification',
        actionLabel: 'Review Application in Hub',
      },
      {
        id: '2',
        title: 'Urgent Candidate Endorsement',
        message: 'Juan de la Cruz requires endorsement letter approval for Globe Telecom.',
        detail: 'The IT Infrastructure opening has limited slots remaining. Candidate has a 91% match with verified skills in Linux and AWS.',
        metaBadge: 'Urgent Review',
        time: '1h ago',
        read: false,
        icon: 'fa-solid fa-clock',
        iconColor: '#F59E0B',
        targetNav: 'verification',
        actionLabel: 'Open Verification Queue',
      },
      {
        id: '3',
        title: 'Partner MOA Update',
        message: 'BDO Unibank updated available internship slots for IT & IS students.',
        detail: 'Partner agreement active. Available slots adjusted to 6 for the 2nd Semester academic cohort.',
        metaBadge: 'Verified Partner',
        time: '6h ago',
        read: false,
        icon: 'fa-solid fa-building',
        iconColor: '#10B981',
        targetNav: 'partners',
        actionLabel: 'Manage Partner Agreements',
      },
    ]
  }
  if (role.toLowerCase().includes('partner')) {
    return [
      {
        id: '1',
        title: 'New Candidate Applied',
        message: 'Maria Reyes (98% match) applied for Software Engineering Intern.',
        detail: 'Coordinator-approved applicant with certified skills in React, Node.js, and TypeScript ready for your technical screening interview.',
        metaBadge: 'Candidate Screening',
        time: '20m ago',
        read: false,
        icon: 'fa-solid fa-user-plus',
        iconColor: '#10B981',
        targetNav: 'screening',
        actionLabel: 'Screen Candidate Now',
      },
      {
        id: '2',
        title: 'Coordinator Endorsement Verified',
        message: 'Prof. Elena Gomez approved student endorsement for Juan de la Cruz.',
        detail: 'Candidate meets all institutional prerequisites and is authorized to commence interview procedures.',
        metaBadge: 'Endorsed',
        time: '3h ago',
        read: false,
        icon: 'fa-solid fa-clipboard-check',
        iconColor: '#3B82F6',
        targetNav: 'screening',
        actionLabel: 'Review Candidate Profile',
      },
      {
        id: '3',
        title: 'Internship Posting Live',
        message: 'Data Analytics Intern opening is now active and published in the catalog.',
        detail: 'Students in BS Information Systems and BS Computer Science can now view and submit applications.',
        metaBadge: 'Active Role',
        time: '1d ago',
        read: true,
        icon: 'fa-solid fa-circle-check',
        iconColor: '#22313f',
        targetNav: 'postings',
        actionLabel: 'Manage Postings',
      },
    ]
  }
  // Administrator default
  return [
    {
      id: '1',
      title: 'Cloud Database Synchronized',
      message: 'All system services and live records connected.',
      detail: 'All primary collections (applications, internships, postings, users) are actively synchronized with the cloud database.',
      metaBadge: 'Database: Online',
      time: 'Just now',
      read: false,
      icon: 'fa-solid fa-database',
      iconColor: '#10B981',
      targetNav: 'analytics',
      actionLabel: 'View Analytics Overview',
    },
    {
      id: '2',
      title: 'New System User Registered',
      message: 'Student account created and stored in system records.',
      detail: 'Maria Reyes (BS Computer Science) was added to the institutional user directory with active role permissions.',
      metaBadge: 'User Management',
      time: '2h ago',
      read: false,
      icon: 'fa-solid fa-user-plus',
      iconColor: '#3B82F6',
      targetNav: 'users',
      actionLabel: 'Open User Directory',
    },
    {
      id: '3',
      title: 'Monthly Accreditation Report Ready',
      message: 'Monthly placement accreditation metrics compiled successfully.',
      detail: '134 cumulative placements across 24 verified industry partners compiled for CHED/depEd compliance export.',
      metaBadge: 'Reports & Audits',
      time: '1d ago',
      read: true,
      icon: 'fa-solid fa-file-invoice',
      iconColor: '#F59E0B',
      targetNav: 'reports',
      actionLabel: 'Generate & Export Reports',
    },
  ]
}

export default function PortalLayout({
  logo, role, roleColor, navItems, activeNav, onNavChange,
  children, darkMode, toggleDark, onLogout, notifCount: initialCount = 0,
  avatarInitials = 'JD', avatarBg = '#22313f', headerRight,
  customNotifications,
}: PortalLayoutProps) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => customNotifications || getDefaultNotifications(role))
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (customNotifications) {
      setNotifications(customNotifications)
    }
  }, [customNotifications])

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

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id)
    // Also mark as read when expanding
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const handleNotificationAction = (n: NotificationItem) => {
    // Mark as read
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item))
    // Close dropdown
    setNotifOpen(false)
    // Navigate to target view if defined
    if (n.targetNav) {
      onNavChange(n.targetNav)
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (notifFilter === 'unread') return !n.read
    return true
  })

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>

      {/* ── Slim Icon Dock Sidebar (Easy Bank style) ── */}
      <aside
        className="flex flex-col w-[76px] flex-shrink-0 border-r py-4 items-center justify-between select-none z-40 shadow-sm"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        {/* Top: Brand Mark */}
        <div className="flex flex-col items-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform hover:scale-105"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            title={`OJTern Platform - ${role}`}
          >
            <i className="fa-solid fa-graduation-cap text-base" />
          </div>
          <span
            className="text-[10px] font-extrabold tracking-tight mt-1.5 uppercase"
            style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}
          >
            OJTern
          </span>
        </div>

        {/* Center: Vertical Icon Stack with Floating Tooltips */}
        <nav className="flex flex-col items-center gap-3 my-auto py-2">
          {navItems.map(item => {
            const active = activeNav === item.id
            const isFa = item.icon.startsWith('fa-')
            return (
              <button
                key={item.id}
                onClick={() => onNavChange(item.id)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-base transition-all relative group cursor-pointer ${
                  active ? 'shadow-sm' : 'hover:opacity-85'
                }`}
                style={{
                  backgroundColor: active ? 'var(--primary)' : 'transparent',
                  color: active ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                }}
                aria-label={item.label}
              >
                <span className="flex items-center justify-center text-base">
                  {isFa ? <i className={item.icon} /> : item.icon}
                </span>

                {/* Left Active Indicator Bar */}
                {active && (
                  <span
                    className="absolute -left-[14px] w-1.5 h-6 rounded-r-full"
                    style={{ backgroundColor: '#8dc6ff' }}
                  />
                )}

                {/* Floating Tooltip */}
                <span className="absolute left-16 px-3 py-1.5 bg-[#22313f] text-white text-xs font-semibold rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>

        {/* Bottom: Sign Out Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={onLogout}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-base transition-all hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-500 cursor-pointer relative group"
            style={{ color: 'var(--muted-foreground)' }}
            aria-label="Sign Out"
          >
            <i className="fa-solid fa-arrow-right-from-bracket" />
            <span className="absolute left-16 px-3 py-1.5 bg-[#22313f] text-white text-xs font-semibold rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* ── Main Canvas ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Floating Header Pills Row */}
        <header className="px-6 pt-5 pb-2 md:px-8 md:pt-6 flex-shrink-0 flex items-center justify-between gap-4 relative z-30">
          {/* Search Capsule Input Card */}
          <div className="flex-1 max-w-xl">
            <div
              className="flex items-center justify-between px-5 py-3 rounded-2xl border shadow-xs"
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <input
                type="text"
                placeholder={`Search ${logo}…`}
                className="bg-transparent border-none outline-none text-sm w-full font-medium"
                style={{ color: 'var(--foreground)', fontFamily: 'Plus Jakarta Sans' }}
              />
              <i className="fa-solid fa-magnifying-glass text-sm ml-3" style={{ color: 'var(--muted-foreground)' }} />
            </div>
          </div>

          {/* Right Action Button Cards */}
          <div className="flex items-center gap-3">
            {headerRight}

            {/* Theme Toggle Button Card */}
            <button
              onClick={toggleDark}
              className="w-11 h-11 rounded-2xl border shadow-xs flex items-center justify-center transition-all hover:opacity-80 cursor-pointer"
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              title="Toggle Theme"
            >
              <i className={`fa-solid ${darkMode ? 'fa-sun text-amber-400' : 'fa-moon text-[#22313f] dark:text-[#8dc6ff]'} text-sm`} />
            </button>

            {/* Notification Popover Dropdown Card */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(prev => !prev)}
                className={`w-11 h-11 rounded-2xl border shadow-xs flex items-center justify-center relative transition-all hover:opacity-80 cursor-pointer ${
                  notifOpen ? 'ring-2 ring-[#8dc6ff]' : ''
                }`}
                style={{
                  backgroundColor: notifOpen ? '#e4f1fe' : 'var(--card)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                }}
                title="Notifications"
                aria-expanded={notifOpen}
              >
                <i className="fa-regular fa-bell text-base" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notifOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 sm:w-96 md:w-[420px] rounded-3xl border shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                >
                  {/* Dropdown Header */}
                  <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>Notifications</span>
                      {unreadCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">
                          {unreadCount} unread
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
                          Up to date
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs font-medium hover:underline cursor-pointer"
                        style={{ color: '#22313f' }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex border-b text-xs px-4 pt-2 gap-4" style={{ borderColor: 'var(--border)' }}>
                    <button
                      onClick={() => setNotifFilter('all')}
                      className={`pb-2 font-semibold border-b-2 transition-all cursor-pointer ${notifFilter === 'all' ? 'border-[#22313f] text-[#22313f]' : 'border-transparent text-slate-400'}`}
                      style={{ color: notifFilter === 'all' ? 'var(--foreground)' : 'var(--muted-foreground)' }}
                    >
                      All ({notifications.length})
                    </button>
                    <button
                      onClick={() => setNotifFilter('unread')}
                      className={`pb-2 font-semibold border-b-2 transition-all cursor-pointer ${notifFilter === 'unread' ? 'border-[#22313f] text-[#22313f]' : 'border-transparent text-slate-400'}`}
                      style={{ color: notifFilter === 'unread' ? 'var(--foreground)' : 'var(--muted-foreground)' }}
                    >
                      Unread ({unreadCount})
                    </button>
                  </div>

                  {/* Notification List */}
                  <div className="max-h-[360px] overflow-y-auto divide-y" style={{ borderColor: 'var(--border)' }}>
                    {filteredNotifications.length === 0 ? (
                      <div className="py-8 text-center" style={{ color: 'var(--muted-foreground)' }}>
                        <i className="fa-solid fa-bell-slash text-2xl mb-2 opacity-50 block" />
                        <p className="text-xs">No notifications in this view</p>
                      </div>
                    ) : (
                      filteredNotifications.map(n => {
                        const isExpanded = expandedId === n.id
                        return (
                          <div
                            key={n.id}
                            className={`p-4 transition-colors cursor-pointer ${!n.read ? 'bg-[#e4f1fe]/40 dark:bg-slate-800/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/20'}`}
                            onClick={() => toggleExpand(n.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm mt-0.5 shadow-xs"
                                style={{ backgroundColor: '#e4f1fe', color: n.iconColor }}
                              >
                                <i className={n.icon} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="font-bold text-xs truncate" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                                    {n.title}
                                  </span>
                                  <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}>{n.time}</span>
                                </div>
                                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                                  {n.message}
                                </p>
                                {n.metaBadge && (
                                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#e4f1fe] text-[#22313f] border border-[#bed9f7]">
                                    {n.metaBadge}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                {!n.read && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                                    className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 text-xs"
                                    title="Mark as read"
                                  >
                                    <i className="fa-solid fa-check" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => { e.stopPropagation(); clearNotification(n.id); }}
                                  className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 text-xs"
                                  title="Dismiss notification"
                                >
                                  <i className="fa-solid fa-xmark" />
                                </button>
                              </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t pl-11 text-xs space-y-2.5 animate-in fade-in duration-150" style={{ borderColor: 'var(--border)' }}>
                                {n.detail && (
                                  <p className="leading-relaxed rounded-xl p-2.5 bg-white/80 dark:bg-slate-900/50 border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                                    {n.detail}
                                  </p>
                                )}
                                {n.targetNav && (
                                  <div className="pt-1 flex items-center gap-2">
                                    <button
                                      onClick={() => handleNotificationAction(n)}
                                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90 flex items-center gap-1.5 shadow-sm cursor-pointer"
                                      style={{ backgroundColor: '#22313f', fontFamily: 'Plus Jakarta Sans' }}
                                    >
                                      <span>{n.actionLabel || 'Go to Details'}</span>
                                      <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="px-5 py-3 border-t flex items-center justify-between text-[10px]" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
                    <span className="flex items-center gap-1.5" style={{ color: 'var(--muted-foreground)' }}>
                      <i className="fa-solid fa-database text-[9px] text-emerald-500" />
                      <span>Synced in real-time</span>
                    </span>
                    <span style={{ color: 'var(--muted-foreground)' }}>
                      Click item to expand
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar Card */}
            <div
              className="flex items-center gap-2 pl-1 cursor-pointer select-none group"
              title={`Logged in as ${role}`}
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-xs font-bold shadow-xs transition-transform group-hover:scale-105"
                style={{ backgroundColor: avatarBg || '#22313f', fontFamily: 'Plus Jakarta Sans' }}
              >
                {avatarInitials}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Canvas */}
        <main className="flex-1 overflow-y-auto px-6 py-5 md:px-8 md:py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
