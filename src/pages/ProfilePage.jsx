import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { SectionHeader } from '../components/ui/SectionHeader'
import { PageTransition } from '../components/ui/PageTransition'
import { useAuth } from '../context/useAuth'
import { useFinance } from '../context/useFinance'
import { SUPPORTED_CURRENCIES } from '../utils/currency'
import { calculateTotals } from '../utils/finance'
import { formatCurrency, formatDate } from '../utils/formatters'

export const ProfilePage = () => {
  const { user, updateProfile, updatePreferences, logout } = useAuth()
  const { transactions, darkMode, setDarkMode } = useFinance()
  const navigate = useNavigate()

  const stats = useMemo(() => calculateTotals(transactions), [transactions])

  const [nameInput, setNameInput] = useState(user?.name || '')
  const [currency, setCurrency] = useState(user?.preferences?.currency || 'USD')
  const [statusMessage, setStatusMessage] = useState('')
  const activeCurrency = user?.preferences?.currency || currency || 'USD'

  const handleSaveProfile = (event) => {
    event.preventDefault()
    const result = updateProfile({ name: nameInput })

    if (result.ok) {
      setStatusMessage('Profile updated successfully.')
    } else {
      setStatusMessage(result.error)
    }
  }

  const handleSavePreferences = () => {
    updatePreferences({ currency })
    setStatusMessage('Preferences saved.')
  }

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <PageTransition>
      <main className="zorvyn-hero mx-auto w-full max-w-7xl space-y-6 px-4 py-6 md:px-6 md:py-8">
        <Card>
          <SectionHeader title="Profile" subtitle="Manage account details and preferences" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user?.name || 'Profile avatar'}
                  className="h-14 w-14 rounded-full border border-white/10 object-cover"
                />
              ) : (
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/20 text-xl font-semibold text-blue-200">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <p className="mt-4 text-lg font-semibold text-white">{user?.name}</p>
              <p className="mt-1 text-sm text-gray-400">{user?.email}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.14em] text-gray-500">
                Joined {formatDate(user?.joinedAt || new Date().toISOString())}
              </p>
            </div>

            <div className="space-y-4 lg:col-span-2">
              <form
                onSubmit={handleSaveProfile}
                className="rounded-xl border border-white/10 bg-slate-900/60 p-5"
              >
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-400">
                  Edit Profile
                </h3>
                <label className="mt-4 block space-y-2">
                  <span className="text-xs text-gray-500">Name</span>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(event) => setNameInput(event.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-gray-200 outline-none transition-all duration-200 ease-in-out focus:border-blue-400/60"
                  />
                </label>
                <div className="mt-4 flex justify-end">
                  <Button type="submit" variant="primary">
                    Save Profile
                  </Button>
                </div>
              </form>

              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-400">
                  Preferences
                </h3>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs text-gray-500">Theme</span>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => setDarkMode((previous) => !previous)}
                    >
                      {darkMode ? 'Dark' : 'Light'} Mode
                    </Button>
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs text-gray-500">Default Currency</span>
                    <select
                      value={currency}
                      onChange={(event) => setCurrency(event.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-gray-200 outline-none transition-all duration-200 ease-in-out focus:border-blue-400/60"
                    >
                      {SUPPORTED_CURRENCIES.map((currencyCode) => (
                        <option key={currencyCode} value={currencyCode}>
                          {currencyCode}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="primary" onClick={handleSavePreferences}>
                    Save Preferences
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Account Stats" subtitle="Your current financial snapshot" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Transactions</p>
              <p className="mt-2 text-2xl font-semibold text-white">{transactions.length}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Total Income</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-300">
                {formatCurrency(stats.totalIncome, activeCurrency)}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Total Expenses</p>
              <p className="mt-2 text-2xl font-semibold text-red-300">
                {formatCurrency(stats.totalExpenses, activeCurrency)}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Savings</p>
              <p className="mt-2 text-2xl font-semibold text-blue-300">
                {formatCurrency(stats.totalBalance, activeCurrency)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Session" subtitle="Account control" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-400">
              {statusMessage || 'Your account data is saved locally in this browser.'}
            </p>
            <Button variant="danger" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </Card>
      </main>
    </PageTransition>
  )
}
