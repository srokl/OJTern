import { useState, useEffect } from 'react'
import PortalLayout from '../components/PortalLayout'
import { api, type Posting, type Application } from '../services/api'

const navItems = [
  { id: 'postings',  label: 'Postings Manager',    icon: '📋' },
  { id: 'screening', label: 'Candidate Screening',  icon: '🔍' },
  { id: 'company',   label: 'Company Profile',      icon: '🏢' },
]

const skillColors = [
  'bg-[#e4f1fe] text-[#22313f]',
  'bg-[#d0e8fd] text-[#22313f]',
  'bg-[#bed9f7] text-[#22313f]',
  'bg-[#34495e]/10 text-[#34495e]',
  'bg-[#22313f]/10 text-[#22313f]',
]

interface PartnerPortalProps { darkMode: boolean; toggleDark: () => void; onLogout: () => void }

export default function PartnerPortal({ darkMode, toggleDark, onLogout }: PartnerPortalProps) {
  const [activeNav,         setActiveNav]         = useState('postings')
  const [postings,          setPostings]          = useState<Posting[]>([])
  const [candidates,        setCandidates]        = useState<Application[]>([])
  const [loading,           setLoading]           = useState(true)
  const [postingFormOpen,   setPostingFormOpen]   = useState(false)
  const [candidateStatuses, setCandidateStatuses] = useState<Record<string | number, string>>({})
  const [newPosting,        setNewPosting]        = useState({ title: '', slots: '', programs: '', skills: '' })
  const [isSubmitting,      setIsSubmitting]      = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [posts, apps] = await Promise.all([
        api.getPostings(),
        api.getApplications(),
      ])
      setPostings(posts)
      setCandidates(apps)
    } catch (err) {
      console.error('Failed to load data from MongoDB:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getCandidateStatus = (id: string | number, def: string) => candidateStatuses[id] ?? def

  const handleCreatePosting = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPosting.title || !newPosting.slots) return
    setIsSubmitting(true)
    try {
      await api.createPosting({
        title: newPosting.title,
        slots: Number(newPosting.slots) || 1,
        filled: 0,
        programs: newPosting.programs ? newPosting.programs.split(',').map(s => s.trim()) : ['BS Computer Science'],
        skills: newPosting.skills ? newPosting.skills.split(',').map(s => s.trim()) : ['React', 'TypeScript'],
        status: 'Active',
        applicants: 0,
        posted: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      })
      setNewPosting({ title: '', slots: '', programs: '', skills: '' })
      setPostingFormOpen(false)
      const updated = await api.getPostings()
      setPostings(updated)
    } catch (err) {
      console.error('Failed to create posting in MongoDB:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateCandidate = async (id: string | number, status: string) => {
    setCandidateStatuses(prev => ({ ...prev, [id]: status }))
    try {
      await api.updateApplication(id, { status: (status === 'Declined' ? 'Rejected' : status) as any })
      const updated = await api.getApplications()
      setCandidates(updated)
    } catch (err) {
      console.error('Failed to update candidate status:', err)
    }
  }

  const totalSlots = postings.reduce((acc, p) => acc + Number(p.slots || 0), 0)
  const totalFilled = postings.reduce((acc, p) => acc + Number(p.filled || 0), 0)
  const totalApplicants = postings.reduce((acc, p) => acc + Number(p.applicants || 0), 0) + candidates.length

  return (
    <>
      <PortalLayout
        logo="postings" role="Industry Partner" roleColor="#8dc6ff"
        navItems={navItems} activeNav={activeNav} onNavChange={setActiveNav}
        darkMode={darkMode} toggleDark={toggleDark} onLogout={onLogout}
        notifCount={candidates.filter(c => c.status === 'Pending').length} avatarInitials="AP" avatarBg="#34495e"
      >

        {/* ── POSTINGS MANAGER ── */}
        {activeNav === 'postings' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>Postings Manager</h2>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Manage your internship openings backed by MongoDB</p>
              </div>
              <div className="flex gap-2">
                <button onClick={fetchData} className="px-3 py-2 rounded-xl text-xs font-medium border hover:opacity-80" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                  ↻ Refresh
                </button>
                <button onClick={() => setPostingFormOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#22313f', fontFamily: 'Plus Jakarta Sans' }}>
                  + Create New Posting
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Total Postings',  val: String(postings.length),  icon: '📋' },
                { label: 'Active Openings', val: String(postings.filter(p => p.status === 'Active').length),  icon: '🟢' },
                { label: 'Total Applicants',val: String(totalApplicants), icon: '👥' },
                { label: 'Slots Filled',    val: `${totalFilled}/${totalSlots}`, icon: '🎯' },
              ].map(s => (
                <div key={s.label} className="rounded-xl border p-3 flex items-center gap-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <span className="text-xl">{s.icon}</span>
                  <div>
                    <div className="text-lg font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>{s.val}</div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <table className="w-full">
                <thead>
                  <tr className="text-xs font-semibold border-b" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}>
                    {['Position', 'Programs', 'Skills', 'Slots', 'Applicants', 'Posted', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Loading postings from MongoDB...
                      </td>
                    </tr>
                  ) : postings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-3xl">📋</span>
                          <span className="font-semibold" style={{ color: 'var(--foreground)' }}>No internship postings found in MongoDB</span>
                          <span className="text-xs">Create your first internship posting to begin receiving student applications.</span>
                          <button onClick={() => setPostingFormOpen(true)} className="mt-2 text-xs px-3 py-1.5 rounded-lg text-white font-semibold" style={{ backgroundColor: '#22313f' }}>
                            + Create New Posting
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    postings.map(p => (
                      <tr key={p.id} className="border-b last:border-0 transition-colors" style={{ borderColor: 'var(--border)' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e4f1fe22')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                        <td className="px-5 py-3.5 font-semibold text-sm" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>{p.title}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {p.programs?.map(prog => (
                              <span key={prog} className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: '#e4f1fe', color: '#22313f' }}>{prog.replace('BS ', '')}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {p.skills?.slice(0, 2).map((s, i) => (
                              <span key={s} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${skillColors[i % skillColors.length]}`}>{s}</span>
                            ))}
                            {p.skills && p.skills.length > 2 && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>+{p.skills.length - 2}</span>}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm font-mono" style={{ color: 'var(--foreground)', fontFamily: 'JetBrains Mono' }}>{p.filled || 0}/{p.slots}</td>
                        <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--muted-foreground)' }}>{p.applicants || 0}</td>
                        <td className="px-5 py-3.5 text-xs font-mono" style={{ color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>{p.posted}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            p.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                            p.status === 'Filled' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex gap-2">
                            <button onClick={() => setActiveNav('screening')} className="text-xs hover:underline" style={{ color: '#22313f' }}>Screen</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CANDIDATE SCREENING ── */}
        {activeNav === 'screening' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>Candidate Screening</h2>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Verified students applying for your postings</p>
              </div>
            </div>

            {/* RBAC notice */}
            <div className="rounded-xl border p-4 flex items-center gap-3"
              style={{ backgroundColor: '#e4f1fe', borderColor: '#8dc6ff' }}>
              <span className="text-xl">🔒</span>
              <div>
                <div className="text-sm font-semibold" style={{ fontFamily: 'Plus Jakarta Sans', color: '#22313f' }}>Coordinator-Verified Applicants Only</div>
                <div className="text-xs" style={{ color: '#34495e' }}>
                  BR-03: Real-time candidate roster connected to MongoDB.
                </div>
              </div>
              <div className="ml-auto flex-shrink-0">
                <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ backgroundColor: '#8dc6ff', color: '#22313f' }}>MongoDB Live</span>
              </div>
            </div>

            {/* Candidate cards */}
            {loading ? (
              <div className="py-12 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading candidate applications...</div>
            ) : candidates.length === 0 ? (
              <div className="rounded-xl border p-12 text-center space-y-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="text-4xl">👥</div>
                <h3 className="font-bold text-base" style={{ color: 'var(--foreground)' }}>No Candidates Currently in Database</h3>
                <p className="text-xs max-w-md mx-auto" style={{ color: 'var(--muted-foreground)' }}>
                  Candidate applications submitted by students will appear here for screening and review.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {candidates.map(c => {
                  const currentStatus = getCandidateStatus(c.id, c.status)
                  return (
                    <div key={c.id} className="rounded-xl border p-5 space-y-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: '#22313f' }}>
                          {c.student ? c.student.split(' ').map(n => n[0]).join('').slice(0, 2) : 'ST'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>{c.student}</div>
                          <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{c.program} · {c.year}</div>
                          <div className="text-xs font-medium mt-0.5" style={{ color: 'var(--foreground)' }}>→ {c.role || c.company}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <div className="text-lg font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: '#22313f' }}>{c.matchScore || 90}%</div>
                          <div className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>compatibility</div>
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-[10px] text-emerald-600 font-semibold">{c.status}</span>
                          </div>
                        </div>
                      </div>

                      {/* Skills */}
                      <div>
                        <div className="text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Skill Compatibility</div>
                        <div className="flex flex-wrap gap-1">
                          {c.skills?.map((s, i) => (
                            <span key={s} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${skillColors[i % skillColors.length]}`}>{s}</span>
                          ))}
                        </div>
                      </div>

                      {/* Compatibility bars */}
                      <div className="space-y-1.5">
                        {[
                          { label: 'Technical Skills', pct: Math.min(100, (c.matchScore || 85) + 2) },
                          { label: 'Program Match',    pct: Math.min(100, (c.matchScore || 85) - 5) },
                          { label: 'Availability',     pct: 95 },
                        ].map(bar => (
                          <div key={bar.label} className="flex items-center gap-2">
                            <span className="text-[10px] w-28 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}>{bar.label}</span>
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
                              <div className="h-full rounded-full" style={{ width: `${bar.pct}%`, backgroundColor: '#22313f' }} />
                            </div>
                            <span className="text-[10px] font-mono w-8 text-right" style={{ color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>{bar.pct}%</span>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      {currentStatus === 'Accepted' ? (
                        <div className="text-center py-2 rounded-lg text-sm font-semibold bg-emerald-100 text-emerald-700">🎉 Candidate Accepted</div>
                      ) : currentStatus === 'Declined' || currentStatus === 'Rejected' ? (
                        <div className="text-center py-2 rounded-lg text-sm font-semibold bg-red-50 text-red-500">✕ Candidate Declined</div>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdateCandidate(c.id, 'Accepted')}
                            className="flex-1 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90"
                            style={{ backgroundColor: '#10B981', fontFamily: 'Plus Jakarta Sans' }}>
                            ✓ Accept Candidate
                          </button>
                          <button onClick={() => handleUpdateCandidate(c.id, 'Declined')}
                            className="flex-1 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90"
                            style={{ backgroundColor: '#EF4444', fontFamily: 'Plus Jakarta Sans' }}>
                            ✕ Decline
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── COMPANY PROFILE ── */}
        {activeNav === 'company' && (
          <div className="space-y-5 max-w-2xl">
            <h2 className="text-lg font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>Company Profile</h2>
            <div className="rounded-xl border p-6 space-y-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-4 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>🔷</div>
                <div>
                  <div className="font-bold text-lg" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>Accenture Philippines</div>
                  <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>partner@accenture.com.ph</div>
                  <div className="text-xs mt-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 inline-block font-semibold">✓ Verified Partner</div>
                </div>
              </div>
              {[
                { label: 'Industry',       val: 'Information Technology & Services' },
                { label: 'Office Location',val: 'BGC, Taguig City, Metro Manila' },
                { label: 'MOA Status',     val: 'Active — Expires Dec 2026' },
                { label: 'Total Slots',    val: String(totalSlots) },
                { label: 'OJT Supervisor', val: 'Andrea Cruz, Talent Acquisition Lead' },
              ].map(f => (
                <div key={f.label} className="flex justify-between text-sm">
                  <span style={{ color: 'var(--muted-foreground)' }}>{f.label}</span>
                  <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{f.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </PortalLayout>

      {/* ── CREATE POSTING MODAL ── */}
      {postingFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreatePosting} className="rounded-2xl border p-6 max-w-md w-full space-y-4 shadow-2xl"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>Create New Internship Posting</h3>
              <button type="button" onClick={() => setPostingFormOpen(false)} className="text-sm p-1" style={{ color: 'var(--muted-foreground)' }}>✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--foreground)' }}>Position Title</label>
                <input required type="text" placeholder="e.g. Backend Developer Intern" value={newPosting.title}
                  onChange={e => setNewPosting(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--foreground)' }}>Available Slots</label>
                <input required type="number" min="1" placeholder="e.g. 3" value={newPosting.slots}
                  onChange={e => setNewPosting(p => ({ ...p, slots: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--foreground)' }}>Target Programs (comma-separated)</label>
                <input type="text" placeholder="e.g. BS Computer Science, BS IT" value={newPosting.programs}
                  onChange={e => setNewPosting(p => ({ ...p, programs: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--foreground)' }}>Required Skills (comma-separated)</label>
                <input type="text" placeholder="e.g. React, Node.js, SQL" value={newPosting.skills}
                  onChange={e => setNewPosting(p => ({ ...p, skills: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setPostingFormOpen(false)} className="flex-1 py-2 rounded-lg text-sm font-semibold border hover:opacity-80"
                style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>Cancel</button>
              <button type="submit" disabled={isSubmitting} className="flex-1 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#22313f', fontFamily: 'Plus Jakarta Sans' }}>
                {isSubmitting ? 'Saving to MongoDB...' : 'Save Posting'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
