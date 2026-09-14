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

const statusConfig: Record<AppStatus, { bg: string; text: string; dot: string }> = {
  'Pending':                 { bg: 'bg-amber-50 dark:bg-amber-950/40',     text: 'text-amber-700 dark:text-amber-400',    dot: 'bg-amber-400' },
  'Approved':                { bg: 'bg-blue-50 dark:bg-blue-950/40',       text: 'text-blue-700 dark:text-blue-400',      dot: 'bg-blue-400' },
  'Returned for Correction': { bg: 'bg-orange-50 dark:bg-orange-950/40',   text: 'text-orange-700 dark:text-orange-400',  dot: 'bg-orange-400' },
  'Accepted':                { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400',dot: 'bg-emerald-400' },
  'Rejected':                { bg: 'bg-red-50 dark:bg-red-950/40',         text: 'text-red-700 dark:text-red-400',        dot: 'bg-red-400' },
}

interface StudentPortalProps { darkMode: boolean; toggleDark: () => void; onLogout: () => void }

export default function StudentPortal({ darkMode, toggleDark, onLogout }: StudentPortalProps) {
  const [activeNav,        setActiveNav]        = useState('dashboard')
  const [internships,      setInternships]      = useState<Internship[]>([])
  const [applications,     setApplications]     = useState<Application[]>([])
  const [loading,          setLoading]          = useState(true)
  const [modalInternship,  setModalInternship]  = useState<Internship | null>(null)
  const [fileUploaded,     setFileUploaded]     = useState(false)
  const [submitted,        setSubmitted]        = useState(false)

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
          <div className="space-y-6">
            {/* Welcome banner */}
            <div className="rounded-2xl p-6 text-white relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #22313f 0%, #34495e 100%)' }}>
              <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
              <div className="absolute right-16 bottom-0 w-32 h-32 rounded-full bg-white/5 translate-y-1/2" />
              <div className="relative">
                <p className="text-sm mb-1" style={{ color: '#8dc6ff' }}>Good morning,</p>
                <h1 className="text-2xl font-extrabold mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>Maria Reyes</h1>
                <p className="text-sm mb-5" style={{ color: '#8dc6ff' }}>BS Computer Science · 3rd Year · PUP Manila</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 max-w-xs">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="font-medium">OJT Hours Progress</span>
                      <span className="font-mono" style={{ color: '#8dc6ff' }}>120 / 500 hrs</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                      <div className="h-full rounded-full bg-white" style={{ width: '24%' }} />
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: '#8dc6ff' }}>24% complete · 380 hours remaining</p>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-3xl font-extrabold" style={{ fontFamily: 'Plus Jakarta Sans' }}>{applications.length}</div>
                    <div className="text-xs" style={{ color: '#8dc6ff' }}>Applications sent</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Available Internships', val: String(internships.length), icon: 'fa-solid fa-briefcase', color: '#22313f' },
                { label: 'Applied',               val: String(applications.length),  icon: 'fa-solid fa-paper-plane', color: '#8dc6ff' },
                { label: 'Approved',              val: String(applications.filter(a => a.status === 'Approved' || a.status === 'Accepted').length),  icon: 'fa-solid fa-circle-check', color: '#10B981' },
                { label: 'Pending Review',        val: String(applications.filter(a => a.status === 'Pending').length),  icon: 'fa-solid fa-hourglass-half', color: '#F59E0B' },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#e4f1fe', color: s.color }}>
                      <i className={s.icon} />
                    </span>
                    <span className="text-2xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: s.color }}>{s.val}</span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Recommendations preview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>Top Recommendations</h2>
                <button onClick={() => setActiveNav('recommendations')} className="text-xs font-medium hover:underline flex items-center gap-1" style={{ color: '#22313f' }}>
                  <span>View all {internships.length}</span>
                  <i className="fa-solid fa-arrow-right text-[10px]" />
                </button>
              </div>

              {loading ? (
                <div className="py-8 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading internships from MongoDB...</div>
              ) : internships.length === 0 ? (
                <div className="rounded-xl border p-8 text-center space-y-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <i className="fa-solid fa-folder-open text-3xl text-gray-400" />
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>No internships listed in MongoDB database</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Check back soon or ask your industry partners to post new openings.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {internships.slice(0, 3).map(i => <InternshipCard key={i.id} internship={i} onApply={() => setModalInternship(i)} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── RECOMMENDATIONS ── */}
        {activeNav === 'recommendations' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>Recommended Internships</h2>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Ranked by skill &amp; program match · {internships.length} live from MongoDB</p>
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
              <div className="py-12 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading internships from MongoDB...</div>
            ) : internships.length === 0 ? (
              <div className="rounded-xl border p-12 text-center space-y-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <i className="fa-solid fa-briefcase text-4xl text-gray-400" />
                <h3 className="font-bold text-base" style={{ color: 'var(--foreground)' }}>No Internship Postings Found</h3>
                <p className="text-xs max-w-md mx-auto" style={{ color: 'var(--muted-foreground)' }}>
                  There are currently no active internship postings in MongoDB. Postings created in the Industry Partner portal will appear here automatically.
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
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Real-time status of your applications from MongoDB</p>
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
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
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
                        Fetching applications from MongoDB...
                      </td>
                    </tr>
                  ) : applications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        <div className="flex flex-col items-center gap-2">
                          <i className="fa-solid fa-file-circle-question text-3xl text-gray-400" />
                          <span className="font-semibold" style={{ color: 'var(--foreground)' }}>No applications found in MongoDB database</span>
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
                        <tr key={app.id} className="border-b last:border-0 transition-colors"
                          style={{ borderColor: 'var(--border)' }}
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
                          <td className="px-5 py-3.5">
                            {app.status === 'Returned for Correction' ? (
                              <button className="text-xs px-3 py-1.5 rounded-lg font-medium text-white hover:opacity-90 flex items-center gap-1" style={{ backgroundColor: '#F97316' }}>
                                <i className="fa-solid fa-arrow-up-from-bracket text-[10px]" />
                                <span>Re-upload Doc</span>
                              </button>
                            ) : app.status === 'Accepted' ? (
                              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                                <i className="fa-solid fa-circle-check" />
                                <span>Placement Confirmed</span>
                              </span>
                            ) : (
                              <button className="text-xs px-3 py-1.5 rounded-lg font-medium border hover:opacity-80" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                                View Details
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
            <div className="rounded-xl border p-6 space-y-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
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
                    <span>Submitted to MongoDB!</span>
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
    </>
  )
}

function InternshipCard({ internship, onApply }: { internship: Internship; onApply: () => void }) {
  const matchColor = internship.match >= 95 ? '#10B981' : internship.match >= 88 ? '#22313f' : '#F59E0B'
  const isFaIcon = internship.logo && (internship.logo.startsWith('fa-') || internship.logo.includes('fa-'))
  
  return (
    <div className="rounded-xl border p-4 flex flex-col gap-3 hover:shadow-md transition-all hover:-translate-y-0.5"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg border text-[#22313f] dark:text-[#8dc6ff]"
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
        <div className="px-2 py-1 rounded-lg text-xs font-bold text-white flex-shrink-0 flex items-center gap-1" style={{ backgroundColor: matchColor }}>
          <span>{internship.match}%</span>
          <i className="fa-solid fa-star text-[9px]" />
        </div>
      </div>

      <div>
        <div className="font-bold text-sm mb-1" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>{internship.title}</div>
        <div className="flex flex-wrap gap-1">
          {internship.skills?.map(s => (
            <span key={s} className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: '#e4f1fe', color: '#22313f' }}>{s}</span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <span className="text-[10px] px-2 py-1 rounded-full font-medium" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
          {internship.type} · {internship.slots} slots
        </span>
        <button onClick={onApply}
          className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#22313f', fontFamily: 'Plus Jakarta Sans' }}>
          Apply Now
        </button>
      </div>
    </div>
  )
}
