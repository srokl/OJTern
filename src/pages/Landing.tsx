import { useState } from 'react'
import { api } from '../services/api'

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
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [selected, setSelected] = useState<Role>('student')
  const [name, setName]         = useState('Maria Reyes')
  const [email, setEmail]       = useState('maria.reyes@pup.edu.ph')
  const [password, setPassword] = useState('Password123')
  const [confirmPassword, setConfirmPassword] = useState('Password123')
  const [authError, setAuthError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validation rules for Sign Up:
  // 1. Email format
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  // 2. Password strength: Min 8 chars, 1 uppercase, 1 number
  const hasMinChars = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const isPasswordStrong = hasMinChars && hasUppercase && hasNumber
  const doPasswordsMatch = password === confirmPassword

  const handleAuthSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setAuthError(null)

    if (authMode === 'signin') {
      if (!email.trim() || !password) {
        setAuthError('Please enter both email and password.')
        return
      }

      if (selected === 'coordinator') {
        setIsSubmitting(true)
        try {
          const authRes = await api.coordinatorLogin({ email: email.trim(), password })
          sessionStorage.setItem('ojtern_coordinator_jwt', authRes.token)
          sessionStorage.setItem('ojtern_coordinator_user', JSON.stringify(authRes.user))
          onLogin('coordinator')
        } catch (err: any) {
          console.error('Coordinator login error:', err)
          if (err.status === 403 || err.message?.includes('403') || err.message?.includes('privileges')) {
            setAuthError('403 Forbidden: Access denied. Account does not have OJT Coordinator privileges (NFR-02 RBAC).')
          } else {
            setAuthError(err.message || 'Invalid institutional credentials. Please verify your email and password.')
          }
        } finally {
          setIsSubmitting(false)
        }
        return
      }

      onLogin(selected)
      return
    }

    // Sign Up Validation
    if (!name.trim()) {
      setAuthError('Please enter your full name.')
      return
    }

    if (!isEmailValid) {
      setAuthError('Please provide a valid institutional email address format.')
      return
    }

    if (!hasMinChars) {
      setAuthError('Password must contain at least 8 characters.')
      return
    }

    if (!hasUppercase) {
      setAuthError('Password must contain at least one uppercase letter (A-Z).')
      return
    }

    if (!hasNumber) {
      setAuthError('Password must contain at least one numeric digit (0-9).')
      return
    }

    if (!doPasswordsMatch) {
      setAuthError('Passwords do not match. Please verify both fields.')
      return
    }

    setIsSubmitting(true)
    try {
      // Check if email already registered in database
      const check = await api.checkEmail(email)
      if (check.exists) {
        setAuthError('Email already registered in system. Please sign in or use another email.')
        setIsSubmitting(false)
        return
      }

      // Create new User account
      await api.createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: selected === 'student' ? 'Student' : selected === 'coordinator' ? 'OJT Coordinator' : selected === 'partner' ? 'Industry Partner' : 'Administrator',
        status: 'Active',
      })

      // Proceed to portal
      onLogin(selected)
    } catch (err: any) {
      console.error('Sign up failed:', err)
      // If offline/mock server, proceed gracefully
      onLogin(selected)
    } finally {
      setIsSubmitting(false)
    }
  }

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
            className="w-9 h-9 rounded-lg flex items-center justify-center border hover:opacity-80 transition-opacity cursor-pointer"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', color: 'var(--muted-foreground)' }}
            title="Toggle Dark Mode"
          >
            <i className={`fa-solid ${darkMode ? 'fa-sun text-amber-500' : 'fa-moon'} text-xs`} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
          <div className="w-full max-w-md my-auto">
            
            {/* Mode Switcher Tabs */}
            <div className="flex p-1 rounded-xl border mb-6" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={() => { setAuthMode('signin'); setAuthError(null); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  authMode === 'signin' ? 'bg-[#22313f] text-white shadow-xs' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
                style={{ fontFamily: 'Plus Jakarta Sans' }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setAuthError(null); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  authMode === 'signup' ? 'bg-[#22313f] text-white shadow-xs' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
                style={{ fontFamily: 'Plus Jakarta Sans' }}
              >
                Sign Up
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                {authMode === 'signin' ? 'Sign in to your portal' : 'Create your OJTern account'}
              </h2>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {authMode === 'signin'
                  ? 'Select your role, then enter your credentials.'
                  : 'Register as a Student to begin your internship journey.'}
              </p>
            </div>

            {/* Error banner */}
            {authError && (
              <div className="p-3 rounded-xl mb-5 text-xs font-medium flex items-center gap-2.5 border border-red-200 bg-red-50 text-red-700 dark:bg-red-950/40 dark:border-red-900/60 dark:text-red-300">
                <i className="fa-solid fa-triangle-exclamation flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Role selector */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {roles.map(r => {
                const isSelected = selected === r.id
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelected(r.id)}
                    className={`p-3.5 rounded-xl text-left transition-all duration-200 border-2 cursor-pointer relative group hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] ${
                      isSelected
                        ? 'shadow-sm'
                        : 'hover:border-[#8dc6ff] hover:bg-slate-50/70 dark:hover:bg-slate-800/50'
                    }`}
                    style={{
                      backgroundColor: isSelected ? (darkMode ? '#8dc6ff' : '#e4f1fe') : 'var(--card)',
                      borderColor:     isSelected ? (darkMode ? '#8dc6ff' : '#22313f') : undefined,
                    }}
                  >
                    <div
                      className="text-xl mb-1.5 transition-transform duration-200 group-hover:scale-110 origin-left"
                      style={{ color: isSelected && darkMode ? '#000000' : isSelected ? '#22313f' : (darkMode ? '#8dc6ff' : '#22313f') }}
                    >
                      <i className={r.icon} />
                    </div>
                    <div
                      className="text-xs font-semibold transition-colors duration-200"
                      style={{ color: isSelected && darkMode ? '#000000' : 'var(--foreground)', fontFamily: 'Plus Jakarta Sans' }}
                    >
                      {r.label}
                    </div>
                    <div
                      className="text-[10px] leading-snug mt-0.5 transition-colors duration-200"
                      style={{ color: isSelected && darkMode ? '#000000' : 'var(--muted-foreground)' }}
                    >
                      {r.desc}
                    </div>
                  </button>
                )
              })}
            </div>

            {selected === 'coordinator' && authMode === 'signin' && (
              <div className="mb-4 p-2.5 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-900/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                  <i className="fa-solid fa-id-card-clip text-sm" />
                  <span>Coordinator Account: <strong>e.gomez@pup.edu.ph</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('e.gomez@pup.edu.ph')
                    setPassword('Coordinator123!')
                    setAuthError(null)
                  }}
                  className="px-2.5 py-1 rounded bg-[#22313f] hover:opacity-90 text-white text-[10px] font-semibold cursor-pointer"
                >
                  Autofill
                </button>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleAuthSubmit} className="space-y-3.5 mb-5">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Maria Reyes"
                    className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => { setEmail(e.target.value); setAuthError(null); }}
                  placeholder="student@university.edu"
                  className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                  style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => { setPassword(e.target.value); setAuthError(null); }}
                  placeholder="Min. 8 characters"
                  className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                  style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>

              {authMode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => { setConfirmPassword(e.target.value); setAuthError(null); }}
                      placeholder="Re-enter password"
                      className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>

                  {/* Password Strength Validation Indicators */}
                  <div className="p-3 rounded-lg border text-[11px] space-y-1.5" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
                    <div className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Password Requirements:</div>
                    <div className={`flex items-center gap-1.5 ${hasMinChars ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                      <i className={`fa-solid ${hasMinChars ? 'fa-circle-check' : 'fa-circle'} text-[9px]`} />
                      <span>At least 8 characters ({password.length}/8)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                      <i className={`fa-solid ${hasUppercase ? 'fa-circle-check' : 'fa-circle'} text-[9px]`} />
                      <span>At least one uppercase letter (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                      <i className={`fa-solid ${hasNumber ? 'fa-circle-check' : 'fa-circle'} text-[9px]`} />
                      <span>At least one numeric digit (0-9)</span>
                    </div>
                    {confirmPassword && (
                      <div className={`flex items-center gap-1.5 ${doPasswordsMatch ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-red-500'}`}>
                        <i className={`fa-solid ${doPasswordsMatch ? 'fa-circle-check' : 'fa-circle-xmark'} text-[9px]`} />
                        <span>{doPasswordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                style={{ backgroundColor: '#22313f', color: '#ffffff', fontFamily: 'Plus Jakarta Sans' }}
              >
                {isSubmitting ? (
                  <span>Verifying credentials...</span>
                ) : (
                  <>
                    <span>
                      {authMode === 'signin'
                        ? `Continue to ${roles.find(r => r.id === selected)?.label} Portal`
                        : 'Create Student Account & Continue'}
                    </span>
                    <i className="fa-solid fa-arrow-right text-xs" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs mt-4" style={{ color: 'var(--muted-foreground)' }}>
              {authMode === 'signin' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signup'); setAuthError(null); }}
                    className="font-semibold underline hover:opacity-80 cursor-pointer"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Sign Up here
                  </button>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signin'); setAuthError(null); }}
                    className="font-semibold underline hover:opacity-80 cursor-pointer"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Sign In instead
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

