import { useState, useEffect } from 'react'
import SystemDocs from './pages/SystemDocs'
import Landing from './pages/Landing'
import StudentPortal from './portals/StudentPortal'
import CoordinatorPortal from './portals/CoordinatorPortal'
import PartnerPortal from './portals/PartnerPortal'
import AdminPortal from './portals/AdminPortal'

type Screen = 'docs' | 'login' | 'app'
type Role = 'student' | 'coordinator' | 'partner' | 'admin'

export default function App() {
  const [screen, setScreen] = useState<Screen>('docs')
  const [role, setRole] = useState<Role | null>(null)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  const toggleDark = () => setDarkMode(d => !d)

  const handleLogin = (r: Role) => {
    setRole(r)
    setScreen('app')
  }

  const handleLogout = () => {
    setRole(null)
    setScreen('login')
  }

  if (screen === 'docs') {
    return (
      <SystemDocs
        onEnter={() => setScreen('login')}
        darkMode={darkMode}
        toggleDark={toggleDark}
      />
    )
  }

  if (screen === 'login' || !role) {
    return (
      <Landing
        onLogin={handleLogin}
        darkMode={darkMode}
        toggleDark={toggleDark}
      />
    )
  }

  const sharedProps = { darkMode, toggleDark, onLogout: handleLogout }

  if (role === 'student') return <StudentPortal {...sharedProps} />
  if (role === 'coordinator') return <CoordinatorPortal {...sharedProps} />
  if (role === 'partner') return <PartnerPortal {...sharedProps} />
  if (role === 'admin') return <AdminPortal {...sharedProps} />

  return null
}
