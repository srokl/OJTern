import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line
} from 'recharts'
import PortalLayout from '../components/PortalLayout'
import { api, type UserItem } from '../services/api'

const navItems = [
  { id: 'analytics', label: 'Analytics Overview', icon: 'fa-solid fa-chart-line' },
  { id: 'users',     label: 'User Management',    icon: 'fa-solid fa-users-gear' },
  { id: 'reports',   label: 'Generate Reports',   icon: 'fa-solid fa-file-invoice' },
]

const placementByProgram = [
  { program: 'BS CS', placements: 48, applications: 62, partners: 12 },
  { program: 'BS IT', placements: 37, applications: 51, partners: 9 },
  { program: 'BS IS', placements: 22, applications: 31, partners: 7 },
  { program: 'BS CE', placements: 15, applications: 22, partners: 5 },
  { program: 'BS CpE', placements: 12, applications: 18, partners: 4 },
]

const placementByCompany = [
  { company: 'Accenture', placements: 18 },
  { company: 'Globe Telecom', placements: 14 },
  { company: 'BDO Unibank', placements: 11 },
  { company: 'PLDT', placements: 9 },
  { company: 'Converge ICT', placements: 8 },
  { company: 'Jollibee', placements: 7 },
  { company: 'SM Tech', placements: 6 },
]

const monthlyTrend = [
  { month: 'Sep', placements: 18, applications: 24 },
  { month: 'Oct', placements: 23, applications: 31 },
  { month: 'Nov', placements: 19, applications: 28 },
  { month: 'Dec', placements: 12, applications: 16 },
  { month: 'Jan', placements: 27, applications: 38 },
  { month: 'Feb', placements: 35, applications: 46 },
]

type Role = 'Student' | 'OJT Coordinator' | 'Industry Partner' | 'Administrator'

interface AdminPortalProps {
  darkMode: boolean
  toggleDark: () => void
  onLogout: () => void
}

const chartTheme = (dark: boolean) => ({
  bg: dark ? '#1E293B' : '#FFFFFF',
  text: dark ? '#94A3B8' : '#64748B',
  grid: dark ? '#334155' : '#E2E8F0',
})

export default function AdminPortal({ darkMode, toggleDark, onLogout }: AdminPortalProps) {
  const [activeNav, setActiveNav] = useState('analytics')
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [userRoles, setUserRoles] = useState<Record<string | number, Role>>({})
  const [reportFormat, setReportFormat] = useState('PDF')
  const [reportMonth, setReportMonth] = useState('February 2025')
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Student' as Role })
  const [dbStatus, setDbStatus] = useState<string>('Checking...')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await api.getUsers()
      setUsers(data)
    } catch (err) {
      console.error('Failed to fetch users from MongoDB:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkDb = async () => {
    try {
      const health = await api.getHealth()
      setDbStatus(health.status === 'connected' ? `Connected (${health.database})` : 'Disconnected')
    } catch (e) {
      setDbStatus('Error connecting to MongoDB')
    }
  }

  useEffect(() => {
    fetchUsers()
    checkDb()
  }, [])

  const ct = chartTheme(darkMode)

  const getUserRole = (u: UserItem): Role => userRoles[u.id] ?? u.role

  const handleRoleChange = async (userId: string | number, newRole: Role) => {
    setUserRoles(prev => ({ ...prev, [userId]: newRole }))
    try {
      await api.updateUser(userId, { role: newRole })
      const updated = await api.getUsers()
      setUsers(updated)
    } catch (err) {
      console.error('Failed to update user role in MongoDB:', err)
    }
  }

  const handleToggleStatus = async (u: UserItem) => {
    const nextStatus = u.status === 'Active' ? 'Inactive' : 'Active'
    try {
      await api.updateUser(u.id, { status: nextStatus })
      const updated = await api.getUsers()
      setUsers(updated)
    } catch (err) {
      console.error('Failed to update user status in MongoDB:', err)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUser.name || !newUser.email) return
    try {
      await api.createUser({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: 'Active',
      })
      setNewUser({ name: '', email: '', role: 'Student' })
      setInviteModalOpen(false)
      const updated = await api.getUsers()
      setUsers(updated)
    } catch (err) {
      console.error('Failed to create user in MongoDB:', err)
    }
  }

  return (
    <PortalLayout
      logo="platform"
      role="Administrator"
      roleColor="#34495e"
      navItems={navItems}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      darkMode={darkMode}
      toggleDark={toggleDark}
      onLogout={onLogout}
      notifCount={1}
      avatarInitials="AD"
      avatarBg="#22313f"
    >
      {/* ANALYTICS OVERVIEW */}
      {activeNav === 'analytics' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total Placed Students', val: '134', change: '+18% MoM', icon: 'fa-solid fa-bullseye', color: '#10B981' },
              { label: 'Active Industry Partners', val: '24', change: '+3 this month', icon: 'fa-solid fa-building', color: '#22313f' },
              { label: 'Registered System Users', val: String(users.length), change: 'Live from MongoDB', icon: 'fa-solid fa-users', color: '#8dc6ff' },
              { label: 'MongoDB Connection', val: dbStatus.startsWith('Connected') ? 'Online' : 'Offline', change: dbStatus, icon: 'fa-solid fa-database', color: '#10B981' },
            ].map(s => (
              <div
                key={s.label}
                className="rounded-xl border p-4 space-y-2"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: '#e4f1fe', color: s.color }}>
                    <i className={s.icon} />
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#e4f1fe', color: '#22313f' }}>{s.change}</span>
                </div>
                <div className="text-2xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: s.color }}>{s.val}</div>
                <div className="text-xs font-medium" style={{ color: 'var(--foreground)', fontFamily: 'Plus Jakarta Sans' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Placements by program */}
            <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <h3 className="font-semibold text-sm mb-4" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                Placements vs. Applications by Program
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={placementByProgram} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false} />
                  <XAxis dataKey="program" tick={{ fill: ct.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: ct.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: ct.bg, borderColor: ct.grid, borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: darkMode ? '#F1F5F9' : '#0F172A', fontWeight: 600 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, color: ct.text }} />
                  <Bar dataKey="applications" name="Applications" fill="#8dc6ff" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="placements" name="Placements" fill="#22313f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Placements by top companies */}
            <div className="rounded-xl border p-5 flex flex-col" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <h3 className="font-semibold text-sm mb-4" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                Top Placement Companies (YTD)
              </h3>
              <div className="space-y-3 flex-1 flex flex-col justify-around">
                {placementByCompany.map((c, i) => (
                  <div key={c.company} className="flex items-center gap-3">
                    <span className="text-xs w-24 truncate font-medium" style={{ color: 'var(--foreground)' }}>{c.company}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(c.placements / placementByCompany[0].placements) * 100}%`,
                          backgroundColor: `hsl(${210 + i * 8}, 40%, ${30 + i * 5}%)`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono flex-shrink-0" style={{ color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>{c.placements}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly trend */}
          <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h3 className="font-semibold text-sm mb-4" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
              Monthly Application & Placement Trend
            </h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: ct.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: ct.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: ct.bg, borderColor: ct.grid, borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: darkMode ? '#F1F5F9' : '#0F172A', fontWeight: 600 }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: ct.text }} />
                <Line type="monotone" dataKey="applications" name="Applications" stroke="#8dc6ff" strokeWidth={2} dot={{ fill: '#8dc6ff', r: 3 }} />
                <Line type="monotone" dataKey="placements" name="Placements" stroke="#22313f" strokeWidth={2.5} dot={{ fill: '#22313f', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* USER MANAGEMENT */}
      {activeNav === 'users' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>User Management</h2>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Manage user accounts stored in MongoDB database</p>
            </div>
            <div className="flex gap-2">
              <button onClick={fetchUsers} className="px-3 py-2 rounded-xl text-xs font-medium border hover:opacity-80 flex items-center gap-1.5" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                <i className="fa-solid fa-rotate text-xs" />
                <span>Refresh</span>
              </button>
              <button onClick={() => setInviteModalOpen(true)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 flex items-center gap-1.5" style={{ backgroundColor: '#22313f', fontFamily: 'Plus Jakarta Sans' }}>
                <i className="fa-solid fa-user-plus text-xs" />
                <span>Invite User</span>
              </button>
            </div>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <table className="w-full">
              <thead>
                <tr className="text-xs font-semibold border-b" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}>
                  <th className="text-left px-5 py-3">User</th>
                  <th className="text-left px-5 py-3">Email</th>
                  <th className="text-left px-5 py-3">Role</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Last Login</th>
                  <th className="text-left px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      Loading users from MongoDB...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      <div className="flex flex-col items-center gap-2">
                        <i className="fa-solid fa-user-slash text-3xl text-gray-400" />
                        <span className="font-semibold" style={{ color: 'var(--foreground)' }}>No users found in MongoDB database</span>
                        <span className="text-xs">Invite new users or create accounts to populate this table.</span>
                        <button onClick={() => setInviteModalOpen(true)} className="mt-2 text-xs px-3 py-1.5 rounded-lg text-white font-semibold flex items-center gap-1.5" style={{ backgroundColor: '#22313f' }}>
                          <i className="fa-solid fa-user-plus text-[10px]" />
                          <span>Invite First User</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map(u => {
                    const role = getUserRole(u)
                    return (
                      <tr key={u.id} className="border-b last:border-0 hover:bg-slate-500/10 transition-colors" style={{ borderColor: 'var(--border)' }}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ backgroundColor: '#22313f' }}
                            >
                              {u.name ? u.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'US'}
                            </div>
                            <div>
                              <div className="font-semibold text-sm" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>{u.name}</div>
                              <div className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Since {u.joined || '2025'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs font-mono" style={{ color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>{u.email}</td>
                        <td className="px-5 py-3.5">
                          <select
                            className="text-xs px-2 py-1 rounded-lg font-semibold border-0 outline-none cursor-pointer"
                            value={role}
                            onChange={e => handleRoleChange(u.id, e.target.value as Role)}
                            style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}
                          >
                            {(['Student', 'OJT Coordinator', 'Industry Partner', 'Administrator'] as Role[]).map(r => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-400' : 'bg-gray-300'}`} />
                            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{u.status}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>{u.lastLogin || 'Recent'}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex gap-1.5">
                            <button onClick={() => alert(`Reset password link sent to ${u.email}`)} className="text-xs px-2.5 py-1 rounded-lg border hover:opacity-80 flex items-center gap-1" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                              <i className="fa-solid fa-key text-[10px]" />
                              <span>Reset PW</span>
                            </button>
                            <button onClick={() => handleToggleStatus(u)} className={`text-xs px-2.5 py-1 rounded-lg border hover:opacity-80 flex items-center gap-1 ${u.status === 'Active' ? 'border-red-200 text-red-500' : 'border-emerald-200 text-emerald-600'}`}>
                              <i className={`fa-solid ${u.status === 'Active' ? 'fa-user-xmark' : 'fa-user-check'} text-[10px]`} />
                              <span>{u.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                            </button>
                          </div>
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

      {/* REPORTS */}
      {activeNav === 'reports' && (
        <div className="space-y-5 max-w-2xl">
          <div>
            <h2 className="text-lg font-bold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>Generate Placement Reports</h2>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Export placement data for administrative and accreditation use</p>
          </div>

          <div className="rounded-xl border p-6 space-y-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h3 className="font-semibold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>Monthly Placement Report</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Report Month</label>
                <select
                  className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                  value={reportMonth}
                  onChange={e => setReportMonth(e.target.value)}
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  {['September 2024', 'October 2024', 'November 2024', 'December 2024', 'January 2025', 'February 2025'].map(m => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Academic Program</label>
                <select className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                  <option>All Programs</option>
                  <option>BS Computer Science</option>
                  <option>BS Information Technology</option>
                  <option>BS Information Systems</option>
                  <option>BS Computer Engineering</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Partner Company</label>
                <select className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                  <option>All Companies</option>
                  <option>Accenture Philippines</option>
                  <option>Globe Telecom</option>
                  <option>BDO Unibank</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Export Format</label>
                <div className="flex gap-2">
                  {['PDF', 'CSV'].map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => setReportFormat(fmt)}
                      className="flex-1 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all flex items-center justify-center gap-1.5"
                      style={{
                        borderColor: reportFormat === fmt ? '#22313f' : 'var(--border)',
                        backgroundColor: reportFormat === fmt ? '#e4f1fe' : 'var(--muted)',
                        color: reportFormat === fmt ? '#22313f' : 'var(--muted-foreground)',
                        fontFamily: 'Plus Jakarta Sans',
                      }}
                    >
                      <i className={fmt === 'PDF' ? 'fa-solid fa-file-pdf text-red-500' : 'fa-solid fa-file-csv text-emerald-600'} />
                      <span>{fmt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                className="w-full py-3 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                style={{ backgroundColor: '#22313f', fontFamily: 'Plus Jakarta Sans' }}
              >
                <i className="fa-solid fa-file-export" />
                <span>Generate Monthly Placement Report — {reportMonth} ({reportFormat})</span>
              </button>
              <p className="text-[10px] text-center mt-2" style={{ color: 'var(--muted-foreground)' }}>
                Report will include placement rates by program, company, and individual student records.
              </p>
            </div>
          </div>

          {/* Previous reports */}
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
              <h4 className="text-sm font-semibold" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>Recent Reports</h4>
            </div>
            {[
              { name: 'January 2025 Placement Report', generated: 'Feb 5, 2025', format: 'PDF', size: '248 KB' },
              { name: 'December 2024 Placement Report', generated: 'Jan 4, 2025', format: 'CSV', size: '84 KB' },
              { name: 'November 2024 Placement Report', generated: 'Dec 3, 2024', format: 'PDF', size: '221 KB' },
            ].map(r => (
              <div key={r.name} className="flex items-center gap-4 px-5 py-3.5 border-b last:border-0 hover:bg-slate-500/10 transition-colors" style={{ borderColor: 'var(--border)' }}>
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-lg">
                  <i className={r.format === 'PDF' ? 'fa-solid fa-file-pdf text-red-500' : 'fa-solid fa-file-csv text-emerald-600'} />
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: 'var(--foreground)', fontFamily: 'Plus Jakarta Sans' }}>{r.name}</div>
                  <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Generated {r.generated} · {r.size}</div>
                </div>
                <button className="text-xs px-3 py-1.5 rounded-lg border hover:opacity-80 font-medium flex items-center gap-1" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                  <i className="fa-solid fa-download text-[10px]" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── INVITE USER MODAL ── */}
      {inviteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateUser} className="rounded-2xl border p-6 max-w-md w-full space-y-4 shadow-2xl"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>Invite / Add System User</h3>
              <button type="button" onClick={() => setInviteModalOpen(false)} className="text-sm p-1" style={{ color: 'var(--muted-foreground)' }}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--foreground)' }}>Full Name</label>
                <input required type="text" placeholder="e.g. Juan dela Cruz" value={newUser.name}
                  onChange={e => setNewUser(u => ({ ...u, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--foreground)' }}>Email Address</label>
                <input required type="email" placeholder="e.g. user@university.edu.ph" value={newUser.email}
                  onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--foreground)' }}>System Role</label>
                <select value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value as Role }))}
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                  <option value="Student">Student</option>
                  <option value="OJT Coordinator">OJT Coordinator</option>
                  <option value="Industry Partner">Industry Partner</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setInviteModalOpen(false)} className="flex-1 py-2 rounded-lg text-sm font-semibold border hover:opacity-80"
                style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>Cancel</button>
              <button type="submit" className="flex-1 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 flex items-center justify-center gap-1.5"
                style={{ backgroundColor: '#22313f', fontFamily: 'Plus Jakarta Sans' }}>
                <i className="fa-solid fa-floppy-disk text-xs" />
                <span>Save User to MongoDB</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </PortalLayout>
  )
}
