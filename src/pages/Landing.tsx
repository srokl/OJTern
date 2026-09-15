import { useState } from 'react'

type Role = 'student' | 'coordinator' | 'partner' | 'admin'

interface LandingProps {
  onLogin: (role: Role) => void
  darkMode: boolean
  toggleDark: () => void
}

const roles: { id: Role; label: string; icon: string; desc: string }[] = [
  { id: 'student',     label: 'Student',          icon: 'fa-solid fa-graduation-cap', desc: 'Find internships matching your skills and program' },
  { id: 'coordinator', label: 'OJT Coordinator',   icon: 'fa-solid fa-clipboard-check', desc: 'Review applications and manage student placements' },
  { id: 'partner',     label: 'Industry Partner',  icon: 'fa-solid fa-building', desc: 'Post internships and screen approved candidates' },
  { id: 'admin',       label: 'Administrator',     icon: 'fa-solid fa-shield-halved', desc: 'Manage platform users, roles, and view analytics' },
]

export default function Landing({ onLogin, darkMode, toggleDark }: LandingProps) {
  const [selected, setSelected] = useState<Role>('student')
  const [email, setEmail]       = useState('demo@university.edu')
  const [password, setPassword] = useState('••••••••')

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--background)' }}>

      {/* ── Left branding panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 p-10 relative overflow-hidden"
        style={{ backgroundColor: '#22313f' }}
      >
        {/* decorative circles */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-[#22313f]">
              <i className="fa-solid fa-graduation-cap text-lg" />
            </div>
            <span className="text-white text-2xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>OJTern</span>
          </div>

          <h1 className="text-white text-4xl font-extrabold leading-tight mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Your OJT journey<br />starts here.
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: '#8dc6ff' }}>
            Intelligent internship matching for students, coordinators, and industry partners — cloud integrated.
          </p>
        </div>

        <div className="relative space-y-4">
          {[
            { label: 'Active Postings',  val: '247',   sub: 'from 89 verified companies' },
            { label: 'Students Placed',  val: '1,832', sub: 'this academic year' },
            { label: 'Match Accuracy',   val: '94%',   sub: 'skill-to-role alignment' },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-4 backdrop-blur-sm rounded-xl px-4 py-3" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <div>
                <div className="text-white text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>{stat.val}</div>
                <div className="text-xs" style={{ color: '#8dc6ff' }}>{stat.label} · {stat.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right login panel ── */}
      <div className="flex-1 flex flex-col">

        {/* Top bar */}
        <div className="flex justify-between items-center px-8 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: '#22313f' }}>
              <i className="fa-solid fa-graduation-cap text-sm" />
            </div>
            <span className="font-bold text-lg" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>OJTern</span>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            <i className="fa-solid fa-database text-xs text-emerald-500" />
            <span>Enterprise OJT Platform · Live Cloud Synchronized</span>
          </div>
          <button
            onClick={toggleDark}
            className="w-9 h-9 rounded-lg flex items-center justify-center border hover:opacity-80 transition-opacity"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', color: 'var(--muted-foreground)' }}
            title="Toggle Dark Mode"
          >
            <i className={`fa-solid ${darkMode ? 'fa-sun text-amber-500' : 'fa-moon'} text-xs`} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                Sign in to your portal
              </h2>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Select your role, then enter your credentials.
              </p>
            </div>

            {/* Role selector */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {roles.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelected(r.id)}
                  className="p-3 rounded-xl text-left transition-all border-2"
                  style={{
                    backgroundColor: selected === r.id ? '#e4f1fe' : 'var(--card)',
                    borderColor:     selected === r.id ? '#22313f' : 'var(--border)',
                  }}
                >
                  <div className="text-xl mb-1 text-[#22313f]">
                    <i className={r.icon} />
                  </div>
                  <div className="text-xs font-semibold" style={{ color: 'var(--foreground)', fontFamily: 'Plus Jakarta Sans' }}>{r.label}</div>
                  <div className="text-[10px] leading-snug mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{r.desc}</div>
                </button>
              ))}
            </div>

            {/* Credentials */}
            <div className="space-y-3 mb-5">
              {[
                { label: 'Email address', type: 'email',    val: email,    set: setEmail },
                { label: 'Password',      type: 'password', val: password, set: setPassword },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>{f.label}</label>
                  <input
                    type={f.type}
                    value={f.val}
                    onChange={e => f.set(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => onLogin(selected)}
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99] flex items-center justify-center gap-2"
              style={{ backgroundColor: '#22313f', color: '#ffffff', fontFamily: 'Plus Jakarta Sans' }}
            >
              <span>Continue to {roles.find(r => r.id === selected)?.label} Portal</span>
              <i className="fa-solid fa-arrow-right text-xs" />
            </button>

            <p className="text-center text-xs mt-4" style={{ color: 'var(--muted-foreground)' }}>
              Click any role above to enter the portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
