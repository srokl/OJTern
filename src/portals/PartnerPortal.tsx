import { useState, useEffect } from 'react'
import PortalLayout from '../components/PortalLayout'
import { api, type Posting, type Application } from '../services/api'

const navItems = [
  { id: 'postings',  label: 'Postings Manager',    icon: 'fa-solid fa-clipboard-list' },
  { id: 'screening', label: 'Candidate Screening',  icon: 'fa-solid fa-users-viewfinder' },
  { id: 'company',   label: 'Company Profile',      icon: 'fa-solid fa-building' },
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
  const [newPosting,        setNewPosting]        = useState({ title: '', slots: '', programs: '', skills: '', location: 'BGC, Taguig' })
  const [isSubmitting,      setIsSubmitting]      = useState(false)

  // Company Profile State (FR-02)
  const [companyProfile,    setCompanyProfile]    = useState({
    name: 'Accenture Philippines',
    email: 'partner@accenture.com.ph',
    industry: 'Information Technology & Services',
    location: 'BGC, Taguig City, Metro Manila',
    moaStatus: 'Active — Expires Dec 2026',
    supervisor: 'Andrea Cruz, Talent Acquisition Lead',
    description: 'Global professional services company providing consulting, digital, and technology solutions.',
  })
  const [companyDraft,      setCompanyDraft]      = useState({ ...companyProfile })
  const [companySavedToast, setCompanySavedToast] = useState(false)

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
        location: newPosting.location || 'BGC, Taguig',
      })
      setNewPosting({ title: '', slots: '', programs: '', skills: '', location: 'BGC, Taguig' })
      setPostingFormOpen(false)
      const updated = await api.getPostings()
      setPostings(updated)
    } catch (err) {
      console.error('Failed to create posting in MongoDB:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTogglePostingStatus = async (post: Posting) => {
    const nextStatus = post.status === 'Active' ? 'Filled' : 'Active'
    try {
      await api.updatePosting(post.id, { status: nextStatus })
      const updated = await api.getPostings()
      setPostings(updated)
    } catch (err) {
      console.error('Failed to update posting status:', err)
    }
  }

  const handleUpdateCandidate = async (id: string | number, status: string) => {
    setCandidateStatuses(prev => ({ ...prev, [id]: status }))
    try {
      await api.updateApplication(id, { status: (status === 'Declined' ? 'Rejected' : status) as any })
      const updated = await api.getApplications()
      setCandidates(updated)
      if (status === 'Accepted') {
        const matchingApp = candidates.find(c => c.id === id)
        if (matchingApp) {
          const matchPost = postings.find(p => p.title.toLowerCase().includes(matchingApp.role?.toLowerCase() || ''))
          if (matchPost) {
            await api.updatePosting(matchPost.id, { filled: (Number(matchPost.filled) || 0) + 1 })
            const updatedPosts = await api.getPostings()
            setPostings(updatedPosts)
          }
        }
      }
    } catch (err) {
      console.error('Failed to update candidate status:', err)
    }
  }

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault()
    setCompanyProfile({ ...companyDraft })
    setCompanySavedToast(true)
    setTimeout(() => setCompanySavedToast(false), 3000)
  }

  // Filter candidates per BR-03: only coordinator-approved applicants are visible to Industry Partners
  const verifiedCandidates = candidates.filter(c =>
    c.status === 'Approved' || c.status === 'Accepted' || c.status === 'Declined' || c.status === 'Rejected'
  )

  const pendingApprovalCount = candidates.filter(c => c.status === 'Approved').length
  const totalSlots = postings.reduce((acc, p) => acc + Number(p.slots || 0), 0)
  const totalFilled = postings.reduce((acc, p) => acc + Number(p.filled || 0), 0)
  const totalApplicants = postings.reduce((acc, p) => acc + Number(p.applicants || 0), 0) + verifiedCandidates.length

  return (
    <>
      <PortalLayout
        logo="postings" role="Industry Partner" roleColor="#8dc6ff"
        navItems={navItems} activeNav={activeNav} onNavChange={setActiveNav}
        darkMode={darkMode} toggleDark={toggleDark} onLogout={onLogout}
        notifCount={pendingApprovalCount} avatarInitials="AP" avatarBg="#34495e"
      >

        {/* ── POSTINGS MANAGER ── */}
        {activeNav === 'postings' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>Postings Manager</h2>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Manage your internship openings</p>
              </div>
              <div className="flex gap-2">
                <button onClick={fetchData} className="px-3 py-2 rounded-xl text-xs font-medium border hover:opacity-80 flex items-center gap-1.5" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                  <i className="fa-solid fa-rotate text-xs" />
                  <span>Refresh</span>
                </button>
                <button onClick={() => setPostingFormOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#22313f', fontFamily: 'Plus Jakarta Sans' }}>
                  <i className="fa-solid fa-plus text-xs" />
                  <span>Create New Posting</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Total Postings',  val: String(postings.length),  icon: 'fa-solid fa-clipboard' },
                { label: 'Active Openings', val: String(postings.filter(p => p.status === 'Active').length),  icon: 'fa-solid fa-circle-dot text-emerald-500' },
                { label: 'Total Applicants',val: String(totalApplicants), icon: 'fa-solid fa-users' },
                { label: 'Slots Filled',    val: `${totalFilled}/${totalSlots}`, icon: 'fa-solid fa-bullseye' },
              ].map(s => (
                <div key={s.label} className="rounded-xl border p-3 flex items-center gap-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center text-base" style={{ backgroundColor: '#e4f1fe', color: '#22313f' }}>
                    <i className={s.icon} />
                  </span>
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
                      Loading postings...
                    </td>
                  </tr>
                ) : postings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      <div className="flex flex-col items-center gap-2">
                        <i className="fa-solid fa-clipboard-question text-3xl text-gray-400" />
                        <span className="font-semibold" style={{ color: 'var(--foreground)' }}>No internship postings found</span>
                          <span className="text-xs">Create your first internship posting to begin receiving student applications.</span>
                          <button onClick={() => setPostingFormOpen(true)} className="mt-2 text-xs px-3 py-1.5 rounded-lg text-white font-semibold flex items-center gap-1.5" style={{ backgroundColor: '#22313f' }}>
                            <i className="fa-solid fa-plus text-[10px]" />
                            <span>Create New Posting</span>
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
                          <button
                            onClick={() => handleTogglePostingStatus(p)}
                            title="Click to toggle Active / Filled"
                            className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-opacity hover:opacity-80 cursor-pointer flex items-center gap-1.5 ${
                              p.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                              p.status === 'Filled' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-600'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'Active' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                            <span>{p.status}</span>
                          </button>
                        </td>
                        <td className="px-5 py-3.5">
                          <button onClick={() => setActiveNav('screening')} className="text-xs hover:underline flex items-center gap-1" style={{ color: '#22313f' }}>
                            <span>Screen</span>
                            <i className="fa-solid fa-arrow-right text-[10px]" />
                          </button>
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
              <i className="fa-solid fa-shield-halved text-xl text-[#22313f]" />
              <div>
                <div className="text-sm font-semibold" style={{ fontFamily: 'Plus Jakarta Sans', color: '#22313f' }}>Coordinator-Verified Applicants Only</div>
                <div className="text-xs" style={{ color: '#34495e' }}>
                  BR-03: Real-time candidate roster connected to database.
                </div>
              </div>
              <div className="ml-auto flex-shrink-0">
                <span className="text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1.5" style={{ backgroundColor: '#8dc6ff', color: '#22313f' }}>
                  <i className="fa-solid fa-database text-[10px]" />
                  <span>Database Live</span>
                </span>
              </div>
            </div>

            {/* Candidate cards (BR-03: Only coordinator-approved applicants) */}
            {loading ? (
              <div className="py-12 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading candidate applications...</div>
            ) : verifiedCandidates.length === 0 ? (
              <div className="rounded-xl border p-12 text-center space-y-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <i className="fa-solid fa-user-check text-4xl text-gray-400" />
                <h3 className="font-bold text-base" style={{ color: 'var(--foreground)' }}>No Coordinator-Approved Candidates Yet</h3>
                <p className="text-xs max-w-md mx-auto" style={{ color: 'var(--muted-foreground)' }}>
                  Under <strong>Business Rule BR-03</strong>, only candidates reviewed and officially approved by an OJT coordinator will appear here for company screening. Raw pending applications are screened by the coordinator first.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {verifiedCandidates.map(c => {
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
                        <div className="text-center py-2 rounded-lg text-sm font-semibold bg-emerald-100 text-emerald-700 flex items-center justify-center gap-1.5">
                          <i className="fa-solid fa-circle-check" />
                          <span>Candidate Accepted</span>
                        </div>
                      ) : currentStatus === 'Declined' || currentStatus === 'Rejected' ? (
                        <div className="text-center py-2 rounded-lg text-sm font-semibold bg-red-50 text-red-500 flex items-center justify-center gap-1.5">
                          <i className="fa-solid fa-circle-xmark" />
                          <span>Candidate Declined</span>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdateCandidate(c.id, 'Accepted')}
                            className="flex-1 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90 flex items-center justify-center gap-1.5"
                            style={{ backgroundColor: '#10B981', fontFamily: 'Plus Jakarta Sans' }}>
                            <i className="fa-solid fa-check" />
                            <span>Accept Candidate</span>
                          </button>
                          <button onClick={() => handleUpdateCandidate(c.id, 'Declined')}
                            className="flex-1 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90 flex items-center justify-center gap-1.5"
                            style={{ backgroundColor: '#EF4444', fontFamily: 'Plus Jakarta Sans' }}>
                            <i className="fa-solid fa-xmark" />
                            <span>Decline</span>
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

        {/* ── COMPANY PROFILE (FR-02) ── */}
        {activeNav === 'company' && (
          <div className="space-y-5 max-w-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>Company Profile</h2>
              {companySavedToast && (
                <div className="text-xs px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <i className="fa-solid fa-circle-check" />
                  <span>Company profile updated successfully!</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveCompany} className="rounded-xl border p-6 space-y-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-4 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl border text-[#22313f] dark:text-[#8dc6ff]" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
                  <i className="fa-solid fa-building" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-lg" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>{companyProfile.name}</div>
                  <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{companyProfile.email}</div>
                  <div className="text-xs mt-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 inline-flex items-center gap-1 font-semibold">
                    <i className="fa-solid fa-circle-check text-[10px]" />
                    <span>Verified Industry Partner</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Company Name</label>
                  <input
                    type="text"
                    value={companyDraft.name}
                    onChange={e => setCompanyDraft(c => ({ ...c, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                    style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Industry Classification</label>
                  <input
                    type="text"
                    value={companyDraft.industry}
                    onChange={e => setCompanyDraft(c => ({ ...c, industry: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                    style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Office Location</label>
                  <input
                    type="text"
                    value={companyDraft.location}
                    onChange={e => setCompanyDraft(c => ({ ...c, location: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                    style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>OJT Supervisor / Contact</label>
                  <input
                    type="text"
                    value={companyDraft.supervisor}
                    onChange={e => setCompanyDraft(c => ({ ...c, supervisor: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                    style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Company Description</label>
                <textarea
                  rows={3}
                  value={companyDraft.description}
                  onChange={e => setCompanyDraft(c => ({ ...c, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>

              <div className="pt-3 border-t flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  MOA Status: <strong className="text-emerald-600">{companyProfile.moaStatus}</strong> · {totalSlots} Total Slots Offered
                </span>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
                  style={{ backgroundColor: '#22313f', fontFamily: 'Plus Jakarta Sans' }}
                >
                  <i className="fa-solid fa-floppy-disk text-xs" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </PortalLayout>

      {/* ── CREATE POSTING MODAL (FR-03) ── */}
      {postingFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreatePosting} className="rounded-2xl border p-6 max-w-md w-full space-y-4 shadow-2xl"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>Create New Internship Posting</h3>
              <button type="button" onClick={() => setPostingFormOpen(false)} className="text-sm p-1 cursor-pointer" style={{ color: 'var(--muted-foreground)' }}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--foreground)' }}>Position Title</label>
                <input required type="text" placeholder="e.g. Backend Developer Intern" value={newPosting.title}
                  onChange={e => setNewPosting(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--foreground)' }}>Available Slots</label>
                  <input required type="number" min="1" placeholder="e.g. 3" value={newPosting.slots}
                    onChange={e => setNewPosting(p => ({ ...p, slots: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                    style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--foreground)' }}>Work Location</label>
                  <select
                    value={newPosting.location}
                    onChange={e => setNewPosting(p => ({ ...p, location: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm border outline-none cursor-pointer"
                    style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  >
                    <option>BGC, Taguig</option>
                    <option>Makati City</option>
                    <option>Pasig / Ortigas</option>
                    <option>Remote</option>
                    <option>Hybrid (Metro Manila)</option>
                  </select>
                </div>
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
              <button type="button" onClick={() => setPostingFormOpen(false)} className="flex-1 py-2 rounded-lg text-sm font-semibold border hover:opacity-80 cursor-pointer"
                style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>Cancel</button>
              <button type="submit" disabled={isSubmitting} className="flex-1 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                style={{ backgroundColor: '#22313f', fontFamily: 'Plus Jakarta Sans' }}>
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin text-xs" />
                    <span>Saving posting...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-floppy-disk text-xs" />
                    <span>Publish Opening</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
