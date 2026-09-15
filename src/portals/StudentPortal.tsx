import { useState, useEffect } from 'react'
import PortalLayout from '../components/PortalLayout'
import { api, type Application, type Internship } from '../services/api'

const navItems = [
  { id: 'dashboard',       label: 'Dashboard',            icon: 'fa-solid fa-house' },
  { id: 'recommendations', label: 'Recommendations',      icon: 'fa-solid fa-wand-magic-sparkles' },
  { id: 'tracker',         label: 'Application Tracker',  icon: 'fa-solid fa-clipboard-list' },
  { id: 'profile',         label: 'Profile Settings',     icon: 'fa-solid fa-user' },
]

type AppStatus = 'Pending' | 'Approved' | 'Returned for Correction' | 'Accepted' | 'Rejected'

const statusConfig: Record<AppStatus, { bg: string; text: string; dot: string; icon: string }> = {
  'Pending':                 { bg: 'bg-amber-50 dark:bg-amber-950/40',     text: 'text-amber-700 dark:text-amber-400',    dot: 'bg-amber-400',  icon: 'fa-solid fa-clock' },
  'Approved':                { bg: 'bg-blue-50 dark:bg-blue-950/40',       text: 'text-blue-700 dark:text-blue-400',      dot: 'bg-blue-400',   icon: 'fa-solid fa-clipboard-check' },
  'Returned for Correction': { bg: 'bg-orange-50 dark:bg-orange-950/40',   text: 'text-orange-700 dark:text-orange-400',  dot: 'bg-orange-400', icon: 'fa-solid fa-triangle-exclamation' },
  'Accepted':                { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400',dot: 'bg-emerald-400',icon: 'fa-solid fa-circle-check' },
  'Rejected':                { bg: 'bg-red-50 dark:bg-red-950/40',         text: 'text-red-700 dark:text-red-400',        dot: 'bg-red-400',    icon: 'fa-solid fa-circle-xmark' },
}

interface StudentPortalProps { darkMode: boolean; toggleDark: () => void; onLogout: () => void }

export default function StudentPortal({ darkMode, toggleDark, onLogout }: StudentPortalProps) {
  const [activeNav,        setActiveNav]        = useState('dashboard')
  const [internships,      setInternships]      = useState<Internship[]>([])
  const [applications,     setApplications]     = useState<Application[]>([])
  const [loading,          setLoading]          = useState(true)
  const [modalInternship,  setModalInternship]  = useState<Internship | null>(null)
  const [selectedApp,      setSelectedApp]      = useState<Application | null>(null)
  const [fileUploaded,     setFileUploaded]     = useState(false)
  const [submitted,        setSubmitted]        = useState(false)
  const [reuploadFile,     setReuploadFile]     = useState(false)
  const [isUpdatingDoc,    setIsUpdatingDoc]    = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [interns, apps] = await Promise.all([
        api.getInternships(),
        api.getApplications(),
      ])
      setInternships(interns)
      setApplications(apps)
    } catch (e) {
      console.error('Failed to fetch data from MongoDB:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async () => {
    if (!modalInternship) return
    setSubmitted(true)
    try {
      await api.createApplication({
        student: 'Maria Reyes',
        studentId: '2021-00132',
        program: 'BS Computer Science',
        year: '3rd Year',
        company: modalInternship.company,
        role: modalInternship.title,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        submitted: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'Pending',
        urgency: 'Normal',
        matchScore: modalInternship.match,
        skills: modalInternship.skills,
      })
      const apps = await api.getApplications()
      setApplications(apps)
    } catch (err) {
      console.error('Error submitting application:', err)
    }
    setTimeout(() => {
      setSubmitted(false)
      setModalInternship(null)
      setFileUploaded(false)
      setActiveNav('tracker')
    }, 1200)
  }

  const handleResubmitCorrection = async () => {
    if (!selectedApp) return
    setIsUpdatingDoc(true)
    try {
      await api.updateApplication(selectedApp.id, {
        status: 'Pending',
        submitted: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      })
      const apps = await api.getApplications()
      setApplications(apps)
      setSelectedApp(prev => prev ? { ...prev, status: 'Pending' } : null)
      setReuploadFile(false)
    } catch (err) {
      console.error('Failed to resubmit document:', err)
    } finally {
      setIsUpdatingDoc(false)
    }
  }

  return (
    <>
      <PortalLayout
        logo="internships" role="Student Portal" roleColor="#8dc6ff"
        navItems={navItems} activeNav={activeNav} onNavChange={setActiveNav}
        darkMode={darkMode} toggleDark={toggleDark} onLogout={onLogout}
        notifCount={applications.filter(a => a.status === 'Pending').length} avatarInitials="MR" avatarBg="#22313f"
      >
        {/* ── DASHBOARD ── */}
        {activeNav === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ── Left Column (Profile & Stacked Graphic Cards) ── */}
            <div className="lg:col-span-4 xl:col-span-4 space-y-6">

              {/* 1. User Profile Card */}
              <div
                className="rounded-3xl p-6 border shadow-xs flex flex-col items-center text-center relative overflow-hidden"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
              >
                {/* Rounded Avatar with verified indicator */}
                <div className="relative mb-3">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md"
                    style={{ backgroundColor: '#22313f', fontFamily: 'Plus Jakarta Sans' }}
                  >
                    MR
                  </div>
                  <span
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[9px] text-white shadow-xs"
                    title="Active Student Account"
                  >
                    <i className="fa-solid fa-check" />
                  </span>
                </div>

                <h3 className="text-base font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                  Maria Reyes
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                  BS Computer Science · 3rd Year
                </p>

                {/* Split Metrics: Rendered vs Remaining */}
                <div
                  className="w-full mt-5 pt-4 border-t flex items-center justify-around"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="text-center">
                    <span className="text-[10px] uppercase tracking-wider block font-semibold" style={{ color: 'var(--muted-foreground)' }}>
                      Rendered
                    </span>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <span className="text-sm font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                        120 hrs
                      </span>
                      <i className="fa-solid fa-arrow-up text-[10px] text-emerald-500" />
                    </div>
                  </div>

                  <div className="h-7 w-[1px]" style={{ backgroundColor: 'var(--border)' }} />

                  <div className="text-center">
                    <span className="text-[10px] uppercase tracking-wider block font-semibold" style={{ color: 'var(--muted-foreground)' }}>
                      Remaining
                    </span>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <span className="text-sm font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                        380 hrs
                      </span>
                      <i className="fa-solid fa-arrow-down text-[10px] text-[#4a90d8]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Stacked Graphic Visual Cards (Credit Card Style) */}
              <div className="space-y-4">
                {/* Card One: Active Placement Card (Blue Tone) */}
                <div
                  className="rounded-3xl p-5 text-white relative overflow-hidden shadow-sm transition-transform hover:-translate-y-0.5 cursor-pointer"
                  onClick={() => setActiveNav('tracker')}
                  style={{ background: 'linear-gradient(135deg, #4a90d8 0%, #8dc6ff 100%)' }}
                >
                  {/* Abstract wavy circles */}
                  <div className="absolute right-0 bottom-0 w-32 h-32 rounded-full bg-white/15 -mb-10 -mr-10 pointer-events-none" />
                  <div className="absolute right-12 top-0 w-24 h-24 rounded-full bg-white/10 -mt-8 pointer-events-none" />

                  <div className="relative z-10 flex flex-col justify-between h-36">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider uppercase opacity-85">Primary Placement</span>
                        <h4 className="text-sm font-bold mt-0.5" style={{ fontFamily: 'Plus Jakarta Sans' }}>Accenture Philippines</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-xs">
                        98% Match
                      </span>
                    </div>

                    <div className="font-mono text-xs tracking-wider opacity-90">
                      2021-00132 · SE Intern
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider block opacity-75">Hours Validated</span>
                        <span className="text-xs font-bold font-mono">120 / 500 hrs</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Two: Academic Endorsement Status Card (Slate/Navy Tone) */}
                <div
                  className="rounded-3xl p-5 text-white relative overflow-hidden shadow-sm transition-transform hover:-translate-y-0.5 cursor-pointer"
                  onClick={() => setActiveNav('profile')}
                  style={{ background: 'linear-gradient(135deg, #22313f 0%, #34495e 100%)' }}
                >
                  {/* Abstract wavy shapes */}
                  <div className="absolute right-0 top-0 w-36 h-36 rounded-full bg-white/5 -mr-10 -mt-10 pointer-events-none" />
                  <div className="absolute left-1/2 bottom-0 w-24 h-24 rounded-full bg-white/5 -mb-8 pointer-events-none" />

                  <div className="relative z-10 flex flex-col justify-between h-36">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider uppercase text-[#8dc6ff]">Academic Endorsement</span>
                        <h4 className="text-sm font-bold mt-0.5" style={{ fontFamily: 'Plus Jakarta Sans' }}>PUP Manila College of CS</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        Verified
                      </span>
                    </div>

                    <div className="font-mono text-xs tracking-wider opacity-85">
                      OJT-MOA-2026-0441
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider block text-slate-400">Coordinator</span>
                        <span className="text-xs font-bold">Prof. Elena Gomez</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Quick Action Card ("+ Add New Card" Style) */}
              <div
                onClick={() => setActiveNav('recommendations')}
                className="rounded-3xl p-4 border shadow-xs flex items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <div
                  className="w-12 h-12 rounded-2xl border flex items-center justify-center text-xl transition-colors group-hover:bg-[#e4f1fe]"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)', backgroundColor: 'var(--muted)' }}
                >
                  <i className="fa-solid fa-plus text-sm" />
                </div>
                <div>
                  <div className="font-bold text-sm" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                    Apply for New Internship
                  </div>
                  <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {internships.length} Active Openings Available
                  </div>
                </div>
              </div>

            </div>

            {/* ── Right Column (Main Workspace) ── */}
            <div className="lg:col-span-8 xl:col-span-8 space-y-6">

              {/* 1. Hero Feature Card ("Credit Card Bill" style) */}
              <div
                className="rounded-3xl p-6 border shadow-xs relative overflow-hidden"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                    OJT Requirement &amp; Placement Status
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveNav('tracker')}
                      className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90 shadow-sm cursor-pointer"
                      style={{ backgroundColor: '#22313f', fontFamily: 'Plus Jakarta Sans' }}
                    >
                      Open Tracker
                    </button>
                    <button
                      onClick={() => setActiveNav('profile')}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-semibold border hover:opacity-80 transition-opacity flex items-center gap-1 cursor-pointer"
                      style={{ borderColor: 'var(--border)', color: 'var(--foreground)', backgroundColor: 'var(--muted)' }}
                    >
                      <span>More</span>
                      <i className="fa-solid fa-chevron-down text-[10px]" />
                    </button>
                  </div>
                </div>

                {/* Horizontal metrics row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                  <div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>
                      <i className="fa-solid fa-clock text-[10px] text-amber-500" />
                      <span>Total Target</span>
                    </div>
                    <div className="text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                      500 hrs
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>
                      <i className="fa-solid fa-circle-check text-[10px] text-emerald-500" />
                      <span>Verified Hours</span>
                    </div>
                    <div className="text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                      120 hrs
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>
                      <i className="fa-solid fa-paper-plane text-[10px] text-blue-500" />
                      <span>Applications</span>
                    </div>
                    <div className="text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                      {applications.length}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>
                      <i className="fa-solid fa-chart-line text-[10px] text-indigo-500" />
                      <span>Completion</span>
                    </div>
                    <div className="text-xl font-bold text-emerald-600" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                      24%
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Top Matches Card Row ("Auto Pay" style) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                    Top Internship Matches
                  </h3>
                  <button
                    onClick={() => setActiveNav('recommendations')}
                    className="text-xs font-semibold hover:underline cursor-pointer"
                    style={{ color: 'var(--primary)' }}
                  >
                    View All
                  </button>
                </div>

                {/* Horizontal partner pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {internships.slice(0, 3).map((item) => {
                    return (
                      <div
                        key={item.id}
                        onClick={() => setModalInternship(item)}
                        className="rounded-2xl p-4 border flex items-center justify-between transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer shadow-xs"
                        style={{
                          backgroundColor: 'var(--card)',
                          borderColor: 'var(--border)',
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-11 h-11 rounded-xl border flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-xs"
                            style={{
                              backgroundColor: 'var(--muted)',
                              borderColor: 'var(--border)',
                              color: 'var(--foreground)',
                            }}
                          >
                            {item.logo && item.logo.startsWith('fa-') ? (
                              <i className={item.logo} />
                            ) : (
                              item.company.charAt(0)
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                              {item.company}
                            </div>
                            <div className="text-[11px] truncate mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                              {item.title}
                            </div>
                          </div>
                        </div>

                        <span
                          className="px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-xs flex-shrink-0 ml-2 border"
                          style={{
                            backgroundColor: 'var(--muted)',
                            borderColor: 'var(--border)',
                            color: '#10B981',
                          }}
                        >
                          {item.match}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 3. Transaction History Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                    Recent Applications &amp; Activity
                  </h3>
                  <button
                    onClick={() => setActiveNav('tracker')}
                    className="text-xs font-semibold hover:underline cursor-pointer"
                    style={{ color: 'var(--primary)' }}
                  >
                    View All
                  </button>
                </div>

                {/* Clean Transaction-style List */}
                <div
                  className="rounded-3xl border divide-y overflow-hidden shadow-xs"
                  style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                >
                  {applications.length === 0 ? (
                    <div className="py-10 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      No applications recorded yet. Click "Apply for New Internship" to begin!
                    </div>
                  ) : (
                    applications.slice(0, 5).map((app) => {
                      const cfg = statusConfig[app.status] || statusConfig['Pending']
                      const isSelected = selectedApp?.id === app.id
                      return (
                        <div
                          key={app.id}
                          onClick={() => setSelectedApp(app)}
                          className={`p-4 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                            isSelected ? 'ring-2 ring-inset ring-[#8dc6ff] bg-[#e4f1fe]/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs border"
                              style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
                            >
                              {app.company.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold truncate" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                                {app.company}
                              </div>
                              <div className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                                {app.role}
                              </div>
                            </div>
                          </div>

                          <div className="hidden sm:block text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            BS Computer Science
                          </div>

                          <div className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>
                            {app.submitted || app.date || '13 Apr 2026'}
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${cfg.bg} ${cfg.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                              <span>{app.status}</span>
                            </span>
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                              <i className="fa-solid fa-chevron-right text-xs" />
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── RECOMMENDATIONS ── */}
        {activeNav === 'recommendations' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>Recommended Internships</h2>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Ranked by skill &amp; program match · {internships.length} active postings available</p>
              </div>
              <div className="flex gap-2">
                {['All Programs', 'BGC', 'Remote'].map(f => (
                  <button key={f} className="px-3 py-1.5 rounded-lg text-xs font-medium border hover:opacity-80"
                    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--muted-foreground)', fontFamily: 'Plus Jakarta Sans' }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading internships...</div>
            ) : internships.length === 0 ? (
              <div className="rounded-xl border p-12 text-center space-y-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <i className="fa-solid fa-briefcase text-4xl text-gray-400" />
                <h3 className="font-bold text-base" style={{ color: 'var(--foreground)' }}>No Internship Postings Found</h3>
                <p className="text-xs max-w-md mx-auto" style={{ color: 'var(--muted-foreground)' }}>
                  There are currently no active internship postings. Postings created in the Industry Partner portal will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {internships.map(i => <InternshipCard key={i.id} internship={i} onApply={() => setModalInternship(i)} />)}
              </div>
            )}
          </div>
        )}

        {/* ── TRACKER ── */}
        {activeNav === 'tracker' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>Application Tracker</h2>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Real-time status of your applications · Click any row or View Details</p>
              </div>
              <button onClick={fetchData} className="px-3 py-1.5 rounded-lg text-xs font-medium border hover:opacity-80 flex items-center gap-1.5" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                <i className="fa-solid fa-rotate text-[11px]" />
                <span>Refresh</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {(Object.keys(statusConfig) as AppStatus[]).map(s => (
                <div key={s} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  <div className={`w-2 h-2 rounded-full ${statusConfig[s].dot}`} />
                  {s}
                </div>
              ))}
            </div>
            <div className="rounded-3xl border overflow-hidden shadow-xs" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
              <table className="w-full">
                <thead>
                  <tr className="text-xs font-semibold border-b" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}>
                    {['Company', 'Role', 'Date Applied', 'Status', 'Action'].map(h => (
                      <th key={h} className="text-left px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Fetching applications...
                      </td>
                    </tr>
                  ) : applications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        <div className="flex flex-col items-center gap-2">
                          <i className="fa-solid fa-file-circle-question text-3xl text-gray-400" />
                          <span className="font-semibold" style={{ color: 'var(--foreground)' }}>No applications found</span>
                          <span className="text-xs">Submit an application from the Recommendations tab to track it here.</span>
                          <button onClick={() => setActiveNav('recommendations')} className="mt-2 text-xs px-3 py-1.5 rounded-lg text-white font-semibold flex items-center gap-1.5" style={{ backgroundColor: '#22313f' }}>
                            <i className="fa-solid fa-magnifying-glass text-[10px]" />
                            <span>Browse Internships</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    applications.map(app => {
                      const cfg = statusConfig[app.status] || statusConfig['Pending']
                      return (
                        <tr key={app.id} className="border-b last:border-0 transition-colors cursor-pointer"
                          style={{ borderColor: 'var(--border)' }}
                          onClick={() => setSelectedApp(app)}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e4f1fe33')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <td className="px-5 py-3.5 font-semibold text-sm" style={{ color: 'var(--foreground)', fontFamily: 'Plus Jakarta Sans' }}>{app.company}</td>
                          <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--muted-foreground)' }}>{app.role}</td>
                          <td className="px-5 py-3.5 text-sm font-mono" style={{ color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>{app.date || app.submitted || '—'}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                              {app.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                            {app.status === 'Returned for Correction' ? (
                              <button
                                onClick={() => { setSelectedApp(app); setReuploadFile(true); }}
                                className="text-xs px-3 py-1.5 rounded-lg font-medium text-white hover:opacity-90 flex items-center gap-1.5 shadow-sm"
                                style={{ backgroundColor: '#F97316' }}
                              >
                                <i className="fa-solid fa-arrow-up-from-bracket text-[10px]" />
                                <span>Re-upload Doc</span>
                              </button>
                            ) : app.status === 'Accepted' ? (
                              <button
                                onClick={() => setSelectedApp(app)}
                                className="text-xs px-3 py-1 rounded-lg font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 flex items-center gap-1.5 transition-colors"
                              >
                                <i className="fa-solid fa-circle-check" />
                                <span>Placement Details</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setSelectedApp(app)}
                                className="text-xs px-3 py-1.5 rounded-lg font-medium border hover:opacity-80 flex items-center gap-1.5 transition-colors"
                                style={{ borderColor: 'var(--border)', color: 'var(--foreground)', backgroundColor: 'var(--muted)' }}
                              >
                                <i className="fa-solid fa-eye text-[10px] text-gray-500" />
                                <span>View Details</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        {activeNav === 'profile' && (
          <div className="space-y-5 max-w-2xl">
            <h2 className="text-lg font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>Profile Settings</h2>
            <div className="rounded-3xl border p-6 space-y-4 shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-4 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: '#22313f' }}>MR</div>
                <div>
                  <div className="font-bold text-base" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>Maria Reyes</div>
                  <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>maria.reyes@pup.edu.ph</div>
                  <div className="text-xs mt-1 px-2 py-0.5 rounded-full inline-block font-semibold" style={{ backgroundColor: '#e4f1fe', color: '#22313f' }}>Student · 2021-00132</div>
                </div>
              </div>
              {[
                { label: 'Program',            val: 'BS Computer Science' },
                { label: 'Year Level',         val: '3rd Year' },
                { label: 'University',         val: 'Polytechnic University of the Philippines' },
                { label: 'Required OJT Hours', val: '500 hours' },
                { label: 'Completed Hours',    val: '120 hours' },
                { label: 'Coordinator',        val: 'Prof. Elena Gomez' },
              ].map(f => (
                <div key={f.label} className="flex justify-between text-sm">
                  <span style={{ color: 'var(--muted-foreground)' }}>{f.label}</span>
                  <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{f.val}</span>
                </div>
              ))}
              <div className="pt-2">
                <div className="text-xs font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Registered Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {['React', 'Node.js', 'TypeScript', 'Tailwind CSS', 'Git', 'REST APIs', 'PostgreSQL', 'Figma'].map(s => (
                    <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: '#e4f1fe', color: '#22313f' }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </PortalLayout>

      {/* ── MODAL: 1-Click Application ── */}
      {modalInternship && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="rounded-2xl border p-6 max-w-lg w-full space-y-5 shadow-2xl"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit" style={{ backgroundColor: '#e4f1fe', color: '#22313f' }}>
                  <i className="fa-solid fa-bolt text-[10px]" />
                  <span>1-Click Fast Apply</span>
                </span>
                <h3 className="text-lg font-bold mt-1" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>{modalInternship.title}</h3>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{modalInternship.company} · {modalInternship.location}</p>
              </div>
              <button onClick={() => setModalInternship(null)} className="text-sm p-1 hover:opacity-70" style={{ color: 'var(--muted-foreground)' }}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'var(--muted)' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>Skill Compatibility Match</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <i className="fa-solid fa-chart-pie text-[11px]" />
                  <span>{modalInternship.match}% Match</span>
                </span>
              </div>
              <div className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'var(--muted)' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>Auto-attached Profile</span>
                <span className="font-semibold" style={{ color: 'var(--foreground)' }}>Maria Reyes · BSCS 3rd Year</span>
              </div>
            </div>

            {/* Document upload zone */}
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--foreground)' }}>Required: Endorsement Letter / Resume</label>
              <div
                onClick={() => setFileUploaded(true)}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  fileUploaded ? 'border-emerald-500 bg-emerald-50/20' : 'hover:border-[#22313f]'
                }`}
                style={{ borderColor: fileUploaded ? '#10B981' : 'var(--border)' }}
              >
                {fileUploaded ? (
                  <div className="text-xs font-semibold text-emerald-600 flex items-center justify-center gap-1.5">
                    <i className="fa-solid fa-check" />
                    <span>Maria_Reyes_Endorsement_Letter.pdf attached</span>
                  </div>
                ) : (
                  <div>
                    <i className="fa-solid fa-cloud-arrow-up text-2xl mb-1 text-gray-400" />
                    <div className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Click to attach signed Endorsement Letter</div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>PDF up to 10MB</div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setModalInternship(null)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold border hover:opacity-80"
                style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>Cancel</button>
              <button onClick={handleSubmit} disabled={!fileUploaded}
                className="flex-grow py-2.5 px-6 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                style={{ backgroundColor: fileUploaded ? '#22313f' : undefined, color: 'white', fontFamily: 'Plus Jakarta Sans' }}>
                {submitted ? (
                  <>
                    <i className="fa-solid fa-check" />
                    <span>Application Submitted!</span>
                  </>
                ) : (
                  <>
                    <span>Submit Application</span>
                    <i className="fa-solid fa-arrow-right text-xs" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Application Details & Tracking Timeline ── */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="rounded-2xl border p-6 max-w-xl w-full space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b pb-4" style={{ borderColor: 'var(--border)' }}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusConfig[selectedApp.status].bg} ${statusConfig[selectedApp.status].text}`}>
                    <i className={`${statusConfig[selectedApp.status].icon} text-[10px]`} />
                    <span>{selectedApp.status}</span>
                  </span>
                  <span className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>
                    ID: #{String(selectedApp.id).slice(-6)}
                  </span>
                </div>
                <h3 className="text-lg font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                  {selectedApp.role}
                </h3>
                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  {selectedApp.company}
                </p>
              </div>
              <button
                onClick={() => { setSelectedApp(null); setReuploadFile(false); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center border hover:opacity-70 transition-opacity"
                style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Application Stages Timeline */}
            <div className="p-4 rounded-xl space-y-3" style={{ backgroundColor: 'var(--muted)' }}>
              <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--foreground)', fontFamily: 'Plus Jakarta Sans' }}>
                Application Journey
              </div>
              <div className="grid grid-cols-4 gap-2 relative">
                {[
                  { step: '1. Applied', active: true, done: true, icon: 'fa-solid fa-paper-plane' },
                  { step: '2. Coordinator', active: true, done: selectedApp.status === 'Approved' || selectedApp.status === 'Accepted', warn: selectedApp.status === 'Returned for Correction', icon: 'fa-solid fa-signature' },
                  { step: '3. Screening', active: selectedApp.status === 'Approved' || selectedApp.status === 'Accepted', done: selectedApp.status === 'Accepted', icon: 'fa-solid fa-users-viewfinder' },
                  { step: '4. Placement', active: selectedApp.status === 'Accepted', done: selectedApp.status === 'Accepted', icon: 'fa-solid fa-award' },
                ].map((s, i) => (
                  <div key={s.step} className="flex flex-col items-center text-center gap-1.5">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        s.done ? 'bg-emerald-500 text-white' :
                        s.warn ? 'bg-orange-500 text-white animate-bounce' :
                        s.active ? 'bg-[#22313f] text-white' :
                        'bg-gray-200 dark:bg-gray-700 text-gray-400'
                      }`}
                    >
                      <i className={s.icon} />
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: s.active ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                      {s.step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Remark Box */}
            {selectedApp.status === 'Returned for Correction' && (
              <div className="p-4 rounded-xl border border-orange-300 bg-orange-50 dark:bg-orange-950/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-orange-700 dark:text-orange-400">
                  <i className="fa-solid fa-triangle-exclamation text-sm" />
                  <span>Coordinator Revision Remark</span>
                </div>
                <p className="text-xs text-orange-800 dark:text-orange-300 leading-relaxed">
                  "The endorsement document signature or dry seal is incomplete. Please re-upload a clear signed copy to proceed with endorsement."
                </p>

                {/* Dropzone for re-upload */}
                <div className="pt-2">
                  <label className="text-xs font-semibold block mb-1 text-orange-900 dark:text-orange-300">
                    Upload Corrected Endorsement Letter (PDF)
                  </label>
                  <div
                    onClick={() => setReuploadFile(true)}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                      reuploadFile ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20' : 'border-orange-300 hover:border-orange-500'
                    }`}
                  >
                    {reuploadFile ? (
                      <div className="text-xs font-semibold text-emerald-600 flex items-center justify-center gap-2">
                        <i className="fa-solid fa-circle-check text-base" />
                        <span>Maria_Reyes_Endorsement_Signed_Revised.pdf attached</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <i className="fa-solid fa-cloud-arrow-up text-xl text-orange-500" />
                        <div className="text-xs font-semibold text-orange-800 dark:text-orange-200">
                          Click to select revised PDF document
                        </div>
                        <div className="text-[10px] text-orange-600 dark:text-orange-400">Max size 10MB</div>
                      </div>
                    )}
                  </div>
                </div>

                {reuploadFile && (
                  <button
                    onClick={handleResubmitCorrection}
                    disabled={isUpdatingDoc}
                    className="w-full mt-2 py-2.5 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#F97316', fontFamily: 'Plus Jakarta Sans' }}
                  >
                    {isUpdatingDoc ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin" />
                        <span>Submitting update...</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-paper-plane" />
                        <span>Submit Corrected Document to Coordinator</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {selectedApp.status === 'Accepted' && (
              <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 flex items-start gap-3">
                <i className="fa-solid fa-circle-check text-emerald-600 text-lg mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-emerald-800 dark:text-emerald-300">Placement Officially Confirmed!</div>
                  <p className="text-emerald-700 dark:text-emerald-400 leading-relaxed">
                    You have been placed at <strong>{selectedApp.company}</strong> as <strong>{selectedApp.role}</strong>. Please check your institutional email for onboarding schedules and coordinator instructions.
                  </p>
                </div>
              </div>
            )}

            {selectedApp.status === 'Pending' && (
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/30 flex items-start gap-3">
                <i className="fa-solid fa-clock text-blue-600 text-lg mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-blue-800 dark:text-blue-300">Pending Coordinator Review</div>
                  <p className="text-blue-700 dark:text-blue-400 leading-relaxed">
                    Your application is currently in queue for academic endorsement verification by Prof. Elena Gomez.
                  </p>
                </div>
              </div>
            )}

            {/* Profile & Document Meta Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
                <span className="block text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Applicant Profile</span>
                <span className="font-bold" style={{ color: 'var(--foreground)' }}>Maria Reyes (2021-00132)</span>
                <span className="block text-[10px]" style={{ color: 'var(--muted-foreground)' }}>BS Computer Science · 3rd Year</span>
              </div>
              <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
                <span className="block text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Compatibility Match</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <i className="fa-solid fa-star text-[10px]" />
                  <span>{selectedApp.matchScore || 98}% Match Score</span>
                </span>
                <span className="block text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Based on curricular alignment</span>
              </div>
            </div>

            {/* Attached Endorsement File */}
            <div className="p-3 rounded-xl border flex items-center justify-between" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-red-500 bg-red-50 dark:bg-red-950/30">
                  <i className="fa-solid fa-file-pdf text-base" />
                </div>
                <div>
                  <div className="font-semibold text-xs" style={{ color: 'var(--foreground)' }}>Maria_Reyes_Endorsement_Letter.pdf</div>
                  <div className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Submitted {selectedApp.submitted || selectedApp.date || 'Feb 2025'} · 2.4 MB</div>
                </div>
              </div>
              <button
                onClick={() => alert('Downloading endorsement letter document preview...')}
                className="text-xs px-3 py-1.5 rounded-lg border hover:opacity-80 flex items-center gap-1"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                <i className="fa-solid fa-download text-[10px]" />
                <span>View PDF</span>
              </button>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={() => { setSelectedApp(null); setReuploadFile(false); }}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold border hover:opacity-80"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function InternshipCard({ internship, onApply }: { internship: Internship; onApply: () => void }) {
  const matchColor = internship.match >= 95 ? '#10B981' : internship.match >= 88 ? '#22313f' : '#F59E0B'
  const isFaIcon = internship.logo && (internship.logo.startsWith('fa-') || internship.logo.includes('fa-'))
  
  return (
    <div className="rounded-2xl border p-5 flex flex-col gap-3 shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg border text-[#22313f] dark:text-[#8dc6ff] shadow-xs"
            style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
            {isFaIcon ? <i className={internship.logo} /> : (internship.logo || <i className="fa-solid fa-building" />)}
          </div>
          <div>
            <div className="text-xs font-semibold" style={{ color: 'var(--foreground)', fontFamily: 'Plus Jakarta Sans' }}>{internship.company}</div>
            <div className="text-[10px] flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
              <i className="fa-solid fa-location-dot text-[9px]" />
              <span>{internship.location}</span>
            </div>
          </div>
        </div>
        <div className="px-2.5 py-1 rounded-xl text-xs font-bold text-white flex-shrink-0 flex items-center gap-1 shadow-xs" style={{ backgroundColor: matchColor }}>
          <span>{internship.match}%</span>
          <i className="fa-solid fa-star text-[9px]" />
        </div>
      </div>

      <div>
        <div className="font-bold text-sm mb-1.5" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>{internship.title}</div>
        <div className="flex flex-wrap gap-1.5">
          {internship.skills?.map(s => (
            <span key={s} className="px-2 py-0.5 rounded-lg text-[10px] font-medium" style={{ backgroundColor: '#e4f1fe', color: '#22313f' }}>{s}</span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <span className="text-[10px] px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
          {internship.type} · {internship.slots} slots
        </span>
        <button onClick={onApply}
          className="text-xs px-3.5 py-1.5 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
          style={{ backgroundColor: '#22313f', fontFamily: 'Plus Jakarta Sans' }}>
          Apply Now
        </button>
      </div>
    </div>
  )
}
