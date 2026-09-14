import { useState, useEffect } from 'react'
import PortalLayout from '../components/PortalLayout'
import { api, type Application } from '../services/api'

const navItems = [
  { id: 'verification', label: 'Verification Hub',    icon: 'fa-solid fa-list-check' },
  { id: 'partners',     label: 'Partner Management',  icon: 'fa-solid fa-building' },
  { id: 'reports',      label: 'Reports & Analytics', icon: 'fa-solid fa-chart-pie' },
]

type AppStatus = 'Pending' | 'Approved' | 'Returned for Correction' | 'Rejected' | 'Accepted'

const urgencyConfig: Record<string, { bg: string; text: string }> = {
  High:   { bg: 'bg-red-50 dark:bg-red-950/30',    text: 'text-red-600 dark:text-red-400' },
  Normal: { bg: 'bg-blue-50 dark:bg-blue-950/30',  text: 'text-blue-600 dark:text-blue-400' },
  Low:    { bg: 'bg-gray-50 dark:bg-gray-800',      text: 'text-gray-500 dark:text-gray-400' },
}

interface CoordinatorPortalProps { darkMode: boolean; toggleDark: () => void; onLogout: () => void }

export default function CoordinatorPortal({ darkMode, toggleDark, onLogout }: CoordinatorPortalProps) {
  const [activeNav,    setActiveNav]    = useState('verification')
  const [applications, setApplications] = useState<Application[]>([])
  const [selected,     setSelected]     = useState<Application | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [statusMap,    setStatusMap]    = useState<Record<string | number, AppStatus>>({})
  const [commentOpen,  setCommentOpen]  = useState(false)
  const [comment,      setComment]      = useState('')
  const [filterProgram,setFilterProgram]= useState('All')

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const data = await api.getApplications()
      setApplications(data)
      if (data.length > 0) {
        setSelected(prev => (prev ? (data.find(d => d.id === prev.id) || data[0]) : data[0]))
      } else {
        setSelected(null)
      }
    } catch (err) {
      console.error('Failed to fetch applications from MongoDB:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const getStatus = (app: Application): AppStatus => statusMap[app.id] ?? (app.status as AppStatus)

  const setStatus = async (id: number | string, status: AppStatus) => {
    setStatusMap(prev => ({ ...prev, [id]: status }))
    try {
      await api.updateApplication(id, { status: status as any })
      const updated = await api.getApplications()
      setApplications(updated)
    } catch (err) {
      console.error('Failed to update status in MongoDB:', err)
    }
  }

  const filtered = filterProgram === 'All'
    ? applications
    : applications.filter(a => a.program?.includes(filterProgram))

  const pendingCount = applications.filter(a => getStatus(a) === 'Pending').length
  const approvedCount = applications.filter(a => getStatus(a) === 'Approved' || getStatus(a) === 'Accepted').length

  const stats = [
    { label: 'Pending Reviews',     val: String(pendingCount),  icon: 'fa-solid fa-hourglass-half', color: '#F59E0B' },
    { label: 'Approved Candidates', val: String(approvedCount), icon: 'fa-solid fa-circle-check', color: '#3B82F6' },
    { label: 'Total Applications',  val: String(applications.length),  icon: 'fa-solid fa-folder-closed', color: '#8dc6ff' },
    { label: 'Placements Confirmed',val: String(applications.filter(a => getStatus(a) === 'Accepted').length), icon: 'fa-solid fa-bullseye', color: '#10B981' },
  ]

  return (
    <PortalLayout
      logo="applications" role="Coordinator Portal" roleColor="#8dc6ff"
      navItems={navItems} activeNav={activeNav} onNavChange={setActiveNav}
      darkMode={darkMode} toggleDark={toggleDark} onLogout={onLogout}
      notifCount={pendingCount} avatarInitials="RC" avatarBg="#34495e"
    >

      {/* ── VERIFICATION HUB ── */}
      {activeNav === 'verification' && (
        <div className="space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {stats.map(s => (
              <div key={s.label} className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: '#e4f1fe', color: s.color }}>
                    <i className={s.icon} />
                  </span>
                  <span className="text-2xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: s.color }}>{s.val}</span>
                </div>
                <div className="text-xs font-medium" style={{ color: 'var(--foreground)', fontFamily: 'Plus Jakarta Sans' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Split-screen or Empty State */}
          {loading ? (
            <div className="rounded-xl border p-12 text-center text-sm" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
              Loading applications from MongoDB...
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-xl border p-12 text-center space-y-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <i className="fa-solid fa-folder-open text-4xl text-gray-400" />
              <h3 className="font-bold text-base" style={{ color: 'var(--foreground)' }}>No Applications in MongoDB Database</h3>
              <p className="text-xs max-w-md mx-auto" style={{ color: 'var(--muted-foreground)' }}>
                Applications submitted by students will appear here in real-time for verification and document review.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-4 h-[calc(100vh-280px)] min-h-[500px]">

              {/* Left: application list */}
              <div className="col-span-2 rounded-xl border flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="px-4 py-3 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
                  <span className="font-semibold text-sm" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>Pending Applications</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
                    {pendingCount} pending
                  </span>
                </div>

                {/* Filter chips */}
                <div className="px-3 py-2 border-b flex gap-1 overflow-x-auto flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
                  {['All', 'CS', 'IT', 'IS', 'CE'].map(f => {
                    const mapped = f === 'CS' ? 'Computer Science' : f === 'IT' ? 'Information Technology' : f === 'IS' ? 'Information Systems' : f === 'CE' ? 'Computer Engineering' : 'All'
                    const active = filterProgram === mapped
                    return (
                      <button key={f} onClick={() => setFilterProgram(mapped)}
                        className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                        style={{ backgroundColor: active ? '#22313f' : 'var(--muted)', color: active ? '#ffffff' : 'var(--muted-foreground)' }}>
                        {f}
                      </button>
                    )
                  })}
                </div>

                <div className="flex-1 overflow-y-auto">
                  {filtered.map(app => {
                    const status     = getStatus(app)
                    const urg        = urgencyConfig[app.urgency || 'Normal'] || urgencyConfig['Normal']
                    const isSelected = selected?.id === app.id
                    return (
                      <button key={app.id} onClick={() => setSelected(app)}
                        className="w-full text-left px-4 py-3 border-b hover:opacity-90 transition-colors"
                        style={{
                          borderColor:     'var(--border)',
                          backgroundColor: isSelected ? '#e4f1fe' : undefined,
                          borderLeft:      isSelected ? '3px solid #22313f' : '3px solid transparent',
                        }}>
                        <div className="flex items-start justify-between mb-1">
                          <div className="font-semibold text-sm" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>{app.student}</div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${urg.bg} ${urg.text}`}>{app.urgency || 'Normal'}</span>
                        </div>
                        <div className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>{app.program} · {app.year}</div>
                        <div className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{app.company}</div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[10px]" style={{ color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>{app.submitted || app.date}</span>
                          {status !== 'Pending' && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                              status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                              status === 'Returned for Correction' ? 'bg-orange-100 text-orange-700' :
                              status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-red-100 text-red-700'
                            }`}>{status}</span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Right: detail panel */}
              {selected ? (
                <div className="col-span-3 rounded-xl border flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  {/* Student header */}
                  <div className="px-5 py-4 border-b flex items-center gap-4 flex-shrink-0" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base" style={{ backgroundColor: '#22313f' }}>
                      {selected.student ? selected.student.split(' ').map(n => n[0]).join('').slice(0, 2) : 'ST'}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>{selected.student}</div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{selected.studentId} · {selected.program} · {selected.year}</div>
                      <div className="text-xs mt-0.5 font-medium" style={{ color: 'var(--foreground)' }}>
                        Applying to: {selected.company} — {selected.role}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: '#22313f' }}>{selected.matchScore || 90}%</div>
                      <div className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Match Score</div>
                      <div className="flex gap-1 mt-1 flex-wrap justify-end">
                        {selected.skills?.map(s => (
                          <span key={s} className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: '#e4f1fe', color: '#22313f' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* PDF preview */}
                  <div className="flex-1 overflow-y-auto p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold text-sm flex items-center gap-2" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                        <i className="fa-solid fa-file-pdf text-red-500" />
                        <span>Endorsement Document Preview</span>
                      </h3>
                      <span className="text-xs cursor-pointer hover:underline flex items-center gap-1" style={{ color: '#22313f' }}>
                        <span>Open in new tab</span>
                        <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
                      </span>
                    </div>
                    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ backgroundColor: '#1E1E2E', borderColor: '#333' }}>
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                        </div>
                        <span className="text-xs font-mono text-gray-400">Endorsement_Letter_{selected.studentId || selected.id}.pdf</span>
                      </div>
                      <div className="p-6 bg-white dark:bg-zinc-900 text-xs space-y-3" style={{ color: '#333' }}>
                        <div className="border-b pb-3 flex justify-between items-start">
                          <div>
                            <div className="font-bold text-sm text-[#22313f] dark:text-blue-400">POLYTECHNIC UNIVERSITY OF THE PHILIPPINES</div>
                            <div className="text-[10px] text-gray-500">Office of the OJT Coordinator · College of Computer Studies</div>
                          </div>
                          <div className="font-mono text-[10px] text-gray-400">{selected.submitted || selected.date}</div>
                        </div>
                        <p className="leading-relaxed dark:text-zinc-200">
                          To whom it may concern at <strong>{selected.company}</strong>,<br />
                          This is to certify that <strong>{selected.student}</strong> ({selected.studentId || 'N/A'}), a bona fide {selected.year} student of {selected.program}, is hereby endorsed for the position of <strong>{selected.role}</strong>.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action bar */}
                  <div className="px-5 py-4 border-t flex gap-3 flex-shrink-0" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
                    <button onClick={() => setStatus(selected.id, 'Approved')} disabled={getStatus(selected) === 'Approved'}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1.5"
                      style={{ backgroundColor: '#10B981', fontFamily: 'Plus Jakarta Sans' }}>
                      <i className="fa-solid fa-check" />
                      <span>Approve Candidate</span>
                    </button>
                    <button onClick={() => setCommentOpen(true)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 border-2 flex items-center justify-center gap-1.5"
                      style={{ borderColor: '#F97316', color: '#F97316', fontFamily: 'Plus Jakarta Sans' }}>
                      <i className="fa-solid fa-rotate-left" />
                      <span>Return for Correction</span>
                    </button>
                    <button onClick={() => setStatus(selected.id, 'Rejected')} disabled={getStatus(selected) === 'Rejected'}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1.5"
                      style={{ backgroundColor: '#EF4444', fontFamily: 'Plus Jakarta Sans' }}>
                      <i className="fa-solid fa-xmark" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* ── PARTNER MANAGEMENT ── */}
      {activeNav === 'partners' && (
        <div className="space-y-5">
          <h2 className="text-lg font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>Partner Management</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { company: 'Accenture Philippines', industry: 'Technology',         slots: 12, status: 'Verified',             joined: 'Jan 2024' },
              { company: 'Globe Telecom',         industry: 'Telecommunications', slots: 8,  status: 'Verified',             joined: 'Mar 2024' },
              { company: 'BDO Unibank',           industry: 'Banking & Finance',  slots: 6,  status: 'Verified',             joined: 'Feb 2024' },
              { company: 'Converge ICT',          industry: 'Technology',         slots: 9,  status: 'Pending Verification', joined: 'Feb 2025' },
            ].map(p => (
              <div key={p.company} className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold flex items-center gap-2" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                    <i className="fa-solid fa-building text-sm text-[#22313f]" />
                    <span>{p.company}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${p.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    <i className={p.status === 'Verified' ? 'fa-solid fa-circle-check text-[10px]' : 'fa-solid fa-clock text-[10px]'} />
                    <span>{p.status}</span>
                  </span>
                </div>
                <div className="text-xs space-y-1" style={{ color: 'var(--muted-foreground)' }}>
                  <div>Industry: {p.industry}</div>
                  <div>Available Slots: {p.slots}</div>
                  <div>Partner Since: {p.joined}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── REPORTS ── */}
      {activeNav === 'reports' && (
        <div className="space-y-5">
          <h2 className="text-lg font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>Reports &amp; Analytics</h2>
          <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h3 className="font-semibold mb-4" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>Generate Monthly Placement Report</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Month / Year',    options: ['January 2025', 'February 2025'] },
                { label: 'Company',         options: ['All Companies', 'Accenture Philippines'] },
                { label: 'Export Format',   options: ['PDF', 'CSV'] },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>{f.label}</label>
                  <select className="w-full px-3 py-2 rounded-lg text-sm border" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                    {f.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <button className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 flex items-center gap-2" style={{ backgroundColor: '#22313f' }}>
              <i className="fa-solid fa-file-export" />
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Return-for-correction modal ── */}
      {commentOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ backgroundColor: 'var(--card)' }}>
            <h3 className="font-bold flex items-center gap-2" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
              <i className="fa-solid fa-triangle-exclamation text-orange-500" />
              <span>Return for Correction</span>
            </h3>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Provide a correction note for <strong>{selected.student}</strong>. This status will be updated directly in MongoDB.
            </p>
            <textarea rows={4} placeholder="e.g., The endorsement document signature is missing. Please re-upload a signed copy…"
              value={comment} onChange={e => setComment(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none resize-none"
              style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
            <div className="flex gap-3">
              <button onClick={() => setCommentOpen(false)} className="flex-1 py-2.5 rounded-lg text-sm border font-semibold" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>Cancel</button>
              <button onClick={() => { setStatus(selected.id, 'Returned for Correction'); setCommentOpen(false); setComment('') }}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 flex items-center justify-center gap-1.5" style={{ backgroundColor: '#F97316' }}>
                <i className="fa-solid fa-paper-plane text-xs" />
                <span>Save Correction Notice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  )
}
