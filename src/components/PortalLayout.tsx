import { useState, useRef, useEffect, type ReactNode } from 'react'

export interface NavItem { id: string; label: string; icon: string }

interface NotificationItem {
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
      title: 'MongoDB Atlas Synchronized',
      message: 'Connected to cluster0.h38ialq.mongodb.net (database: ojtern).',
      detail: 'All primary collections (applications, internships, postings, users) are actively synchronized with the cloud MongoDB replica set.',
      metaBadge: 'Cluster Status: Healthy',
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
      message: 'Student account created and stored into MongoDB database.',
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
}: PortalLayoutProps) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
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

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    if (expandedId === id) setExpandedId(null)
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
                  className="absolute right-0 mt-2 w-80 sm:w-96 md:w-[420px] rounded-2xl border shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                >
                  {/* Dropdown Header */}
                  <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>Notifications</span>
                      {unreadCount > 0 ? (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">
                          {unreadCount} unread
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
                          Up to date
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
                  <div className="max-h-96 overflow-y-auto divide-y" style={{ borderColor: 'var(--border)' }}>
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center space-y-2">
                        <i className="fa-regular fa-bell-slash text-3xl text-gray-400" />
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>You have no notifications at this time.</p>
                      </div>
                    ) : (
                      notifications.map(n => {
                        const isExpanded = expandedId === n.id
                        return (
                          <div
                            key={n.id}
                            className={`transition-colors border-b last:border-0 ${!n.read ? 'bg-[#e4f1fe]/25' : ''}`}
                            style={{ borderColor: 'var(--border)' }}
                          >
                            {/* Summary row */}
                            <div
                              onClick={() => toggleExpand(n.id)}
                              className="px-4 py-3 flex items-start gap-3 hover:bg-[#e4f1fe]/40 cursor-pointer select-none transition-colors"
                            >
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5"
                                style={{ backgroundColor: `${n.iconColor}15`, color: n.iconColor }}
                              >
                                <i className={n.icon} />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <h4 className={`text-xs truncate ${!n.read ? 'font-bold' : 'font-semibold'}`} style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                                      {n.title}
                                    </h4>
                                    {!n.read && (
                                      <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                                    )}
                                  </div>
                                  <span className="text-[10px] font-mono text-gray-400 flex-shrink-0">{n.time}</span>
                                </div>

                                <p className={`text-[11px] leading-snug ${isExpanded ? '' : 'line-clamp-2'}`} style={{ color: 'var(--muted-foreground)' }}>
                                  {n.message}
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5 flex-shrink-0 mt-1" onClick={e => e.stopPropagation()}>
                                <button
                                  onClick={() => toggleExpand(n.id)}
                                  className="w-5 h-5 rounded flex items-center justify-center text-[10px] text-gray-400 hover:text-[#22313f]"
                                  title={isExpanded ? 'Collapse' : 'Expand details'}
                                >
                                  <i className={`fa-solid fa-chevron-down transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                                <button
                                  onClick={() => clearNotification(n.id)}
                                  className="w-5 h-5 rounded flex items-center justify-center text-[10px] text-gray-400 hover:text-red-500"
                                  title="Dismiss"
                                >
                                  <i className="fa-solid fa-xmark" />
                                </button>
                              </div>
                            </div>

                            {/* Expanded Detail Panel & Direct Link */}
                            {isExpanded && (
                              <div
                                className="px-4 pb-3.5 pt-1 pl-15 space-y-2.5 animate-in fade-in duration-150 border-t border-dashed"
                                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}
                              >
                                {n.metaBadge && (
                                  <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#e4f1fe', color: '#22313f' }}>
                                    {n.metaBadge}
                                  </span>
                                )}

                                {n.detail && (
                                  <p className="text-xs leading-relaxed" style={{ color: 'var(--foreground)' }}>
                                    {n.detail}
                                  </p>
                                )}

                                {n.targetNav && (
                                  <div className="pt-1 flex items-center gap-2">
                                    <button
                                      onClick={() => handleNotificationAction(n)}
                                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90 flex items-center gap-1.5 shadow-sm"
                                      style={{ backgroundColor: '#22313f', fontFamily: 'Plus Jakarta Sans' }}
                                    >
                                      <span>{n.actionLabel || 'Go to Details'}</span>
                                      <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
                                    </button>
                                    <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                                      Switches tab directly
                                    </span>
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
                  <div className="px-4 py-2.5 border-t flex items-center justify-between text-[10px]" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
                    <span className="flex items-center gap-1.5" style={{ color: 'var(--muted-foreground)' }}>
                      <i className="fa-solid fa-database text-[9px] text-emerald-500" />
                      <span>Synced with MongoDB</span>
                    </span>
                    <span style={{ color: 'var(--muted-foreground)' }}>
                      Click item to expand or view link
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
