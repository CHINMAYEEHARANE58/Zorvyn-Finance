import { createContext, useCallback, useMemo, useState } from 'react'

const STORAGE_KEYS = {
  users: 'zorvyn.auth.users',
  session: 'zorvyn.auth.session',
}

const DEMO_USER = {
  id: 'demo-user',
  name: 'Demo User',
  email: 'demo@zorvyn.app',
  password: 'demo1234',
  provider: 'local',
  joinedAt: '2025-01-15T00:00:00.000Z',
  preferences: {
    currency: 'USD',
  },
}

const AuthContext = createContext(null)

const readStorage = (key, fallbackValue) => {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallbackValue
  } catch {
    return fallbackValue
  }
}

const persistUsers = (users) => {
  window.localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users))
}

const persistSession = (session) => {
  window.localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session))
}

const sanitizeUser = (user) => ({
  ...user,
  provider: user.provider || 'local',
  avatarUrl: user.avatarUrl || '',
  joinedAt: user.joinedAt || new Date().toISOString(),
  preferences: {
    currency: user.preferences?.currency || 'USD',
  },
})

const toSessionUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  provider: user.provider || 'local',
  avatarUrl: user.avatarUrl || '',
  joinedAt: user.joinedAt,
  preferences: user.preferences,
})

const getInitialUsers = () => {
  const storedUsers = readStorage(STORAGE_KEYS.users, [])
  const normalizedUsers = storedUsers.map(sanitizeUser)
  const withDemo = normalizedUsers.some((user) => user.email === DEMO_USER.email)
    ? normalizedUsers
    : [...normalizedUsers, DEMO_USER]

  persistUsers(withDemo)
  return withDemo
}

const getInitialSession = () => {
  const storedSession = readStorage(STORAGE_KEYS.session, {
    isAuthenticated: false,
    user: null,
  })

  if (storedSession?.isAuthenticated && storedSession?.user) {
    return {
      isAuthenticated: true,
      user: {
        ...storedSession.user,
        joinedAt: storedSession.user.joinedAt || new Date().toISOString(),
        preferences: {
          currency: storedSession.user.preferences?.currency || 'USD',
        },
        provider: storedSession.user.provider || 'local',
        avatarUrl: storedSession.user.avatarUrl || '',
      },
    }
  }

  return { isAuthenticated: false, user: null }
}

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(getInitialUsers)
  const [session, setSession] = useState(getInitialSession)

  const signup = useCallback(
    ({ name, email, password }) => {
      const normalizedEmail = email.trim().toLowerCase()

      if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
        return { ok: false, error: 'An account with this email already exists.' }
      }

      const nextUser = sanitizeUser({
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: normalizedEmail,
        password,
        provider: 'local',
        joinedAt: new Date().toISOString(),
        preferences: { currency: 'USD' },
      })

      const nextUsers = [...users, nextUser]
      setUsers(nextUsers)
      persistUsers(nextUsers)

      const nextSession = {
        isAuthenticated: true,
        user: toSessionUser(nextUser),
      }

      setSession(nextSession)
      persistSession(nextSession)

      return { ok: true }
    },
    [users],
  )

  const login = useCallback(
    ({ email, password }) => {
      const normalizedEmail = email.trim().toLowerCase()
      const matchedUser = users.find(
        (user) =>
          user.email.toLowerCase() === normalizedEmail && user.password === password,
      )

      if (!matchedUser) {
        return { ok: false, error: 'Invalid email or password.' }
      }

      const nextSession = {
        isAuthenticated: true,
        user: toSessionUser(matchedUser),
      }

      setSession(nextSession)
      persistSession(nextSession)

      return { ok: true }
    },
    [users],
  )

  const loginDemo = useCallback(() => {
    const nextSession = {
      isAuthenticated: true,
      user: toSessionUser(DEMO_USER),
    }

    setSession(nextSession)
    persistSession(nextSession)

    return { ok: true }
  }, [])

  const loginWithGoogle = useCallback(
    ({ name, email, avatarUrl = '' }) => {
      const normalizedEmail = String(email || '').trim().toLowerCase()
      const displayName = String(name || '').trim()

      if (!normalizedEmail || !displayName) {
        return { ok: false, error: 'Google profile is missing required fields.' }
      }

      const existingUser = users.find(
        (user) => user.email.toLowerCase() === normalizedEmail,
      )

      const baseUser = existingUser || {
        id: `user-${Date.now()}`,
        email: normalizedEmail,
        password: '',
        joinedAt: new Date().toISOString(),
        preferences: { currency: 'USD' },
      }

      const googleUser = sanitizeUser({
        ...baseUser,
        name: displayName,
        provider: 'google',
        avatarUrl,
      })

      const nextUsers = existingUser
        ? users.map((user) => (user.id === existingUser.id ? googleUser : user))
        : [...users, googleUser]

      setUsers(nextUsers)
      persistUsers(nextUsers)

      const nextSession = {
        isAuthenticated: true,
        user: toSessionUser(googleUser),
      }

      setSession(nextSession)
      persistSession(nextSession)

      return { ok: true }
    },
    [users],
  )

  const logout = useCallback(() => {
    const nextSession = { isAuthenticated: false, user: null }
    setSession(nextSession)
    persistSession(nextSession)
  }, [])

  const updateProfile = useCallback(
    ({ name }) => {
      if (!session.user) return { ok: false, error: 'No active session.' }

      const normalizedName = name.trim()
      if (!normalizedName) return { ok: false, error: 'Name cannot be empty.' }

      const nextUsers = users.map((user) =>
        user.id === session.user.id ? { ...user, name: normalizedName } : user,
      )
      setUsers(nextUsers)
      persistUsers(nextUsers)

      const nextSession = {
        ...session,
        user: {
          ...session.user,
          name: normalizedName,
        },
      }

      setSession(nextSession)
      persistSession(nextSession)

      return { ok: true }
    },
    [users, session],
  )

  const updatePreferences = useCallback(
    ({ currency }) => {
      if (!session.user) return { ok: false, error: 'No active session.' }

      const nextUsers = users.map((user) =>
        user.id === session.user.id
          ? {
              ...user,
              preferences: {
                ...user.preferences,
                ...(currency ? { currency } : {}),
              },
            }
          : user,
      )

      setUsers(nextUsers)
      persistUsers(nextUsers)

      const nextSession = {
        ...session,
        user: {
          ...session.user,
          preferences: {
            ...session.user.preferences,
            ...(currency ? { currency } : {}),
          },
        },
      }

      setSession(nextSession)
      persistSession(nextSession)

      return { ok: true }
    },
    [users, session],
  )

  const value = useMemo(
    () => ({
      isAuthenticated: session.isAuthenticated,
      user: session.user,
      isInitializing: false,
      signup,
      login,
      loginDemo,
      loginWithGoogle,
      logout,
      updateProfile,
      updatePreferences,
    }),
    [
      session.isAuthenticated,
      session.user,
      signup,
      login,
      loginDemo,
      loginWithGoogle,
      logout,
      updateProfile,
      updatePreferences,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
