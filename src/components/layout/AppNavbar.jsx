import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { useFinance } from '../../context/useFinance'
import { Button } from '../ui/Button'

const MotionDropdown = motion.div

const ThemeIcon = ({ darkMode }) => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    {darkMode ? (
      <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4a8.5 8.5 0 1 0 11.5 11.5Z" />
    ) : (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2.2M12 19.8V22M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M2 12h2.2M19.8 12H22M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5" />
      </>
    )}
  </svg>
)

const BrandMark = () => (
  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
    Z
  </span>
)

const navLinkClassName = ({ isActive }) =>
  `relative px-1 py-1 text-sm tracking-[0.01em] transition-colors duration-200 ${
    isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
  }`

export const AppNavbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const { darkMode, setDarkMode } = useFinance()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
    navigate('/', { replace: true })
  }

  const openRoute = (path) => {
    setIsMenuOpen(false)
    navigate(path)
  }

  return (
    <header className="nav-surface sticky top-0 z-40">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3.5 md:px-6">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5">
          <BrandMark />
          <span className="text-sm font-semibold tracking-wide text-white">zorvyn</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={navLinkClassName}>
                Dashboard
              </NavLink>

              <button
                type="button"
                onClick={() => setDarkMode((previous) => !previous)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm text-gray-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-white/10"
                aria-label="Toggle theme"
              >
                <ThemeIcon darkMode={darkMode} />
              </button>

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((previous) => !previous)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-semibold text-blue-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-white/10"
                  aria-label="Open user menu"
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name || 'User avatar'}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    user?.name?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </button>

                <AnimatePresence>
                  {isMenuOpen ? (
                    <MotionDropdown
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="panel-surface absolute right-0 z-50 mt-2 w-44 p-1.5"
                    >
                      <button
                        type="button"
                        onClick={() => openRoute('/profile')}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-200 transition-all duration-200 ease-in-out hover:bg-white/10"
                      >
                        Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => openRoute('/dashboard')}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-200 transition-all duration-200 ease-in-out hover:bg-white/10"
                      >
                        Dashboard
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-300 transition-all duration-200 ease-in-out hover:bg-red-500/10"
                      >
                        Logout
                      </button>
                    </MotionDropdown>
                  ) : null}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Button size="sm" variant="secondary" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button size="sm" variant="primary" onClick={() => navigate('/signup')}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
