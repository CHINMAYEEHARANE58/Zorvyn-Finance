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

const toMonthKey = (value) => String(value).slice(0, 7)

const BackIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="m15 18-6-6 6-6" />
  </svg>
)

export const ProfilePage = () => {
  const { user, updateProfile, updatePreferences, logout } = useAuth()
  const { transactions, darkMode, setDarkMode, role, timeRange } = useFinance()
  const navigate = useNavigate()

  const stats = useMemo(() => calculateTotals(transactions), [transactions])

  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [transactions],
  )

  const recentTransactions = useMemo(() => sortedTransactions.slice(0, 6), [sortedTransactions])

  const timelineSummary = useMemo(() => {
    const latestTransaction = sortedTransactions[0] || null
    const firstTransaction = sortedTransactions[sortedTransactions.length - 1] || null
    const monthsTracked = new Set(transactions.map((transaction) => toMonthKey(transaction.date))).size
    const currentMonthKey = toMonthKey(new Date().toISOString())
    const thisMonthCount = transactions.filter(
      (transaction) => toMonthKey(transaction.date) === currentMonthKey,
    ).length

    const expenseByCategory = transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((accumulator, transaction) => {
        accumulator[transaction.category] =
          (accumulator[transaction.category] || 0) + transaction.amount
        return accumulator
      }, {})

    const topExpenseCategory = Object.entries(expenseByCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([category]) => category)[0]

    const expenseCount = transactions.filter((transaction) => transaction.type === 'expense').length
    const averageExpense = expenseCount ? stats.totalExpenses / expenseCount : 0

    return {
      latestTransaction,
      firstTransaction,
      monthsTracked,
      thisMonthCount,
      topExpenseCategory: topExpenseCategory || 'N/A',
      averageExpense,
    }
  }, [sortedTransactions, stats.totalExpenses, transactions])

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
      <main className="zorvyn-hero animate-fade-in mx-auto w-full max-w-7xl space-y-6 px-4 py-6 md:px-6 md:py-8">
        <div className="flex items-center">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="gap-1.5"
          >
            <BackIcon />
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <SectionHeader
            title="Account Profile"
            subtitle="Personal details, finance snapshot, and account history"
          />
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-wrap items-center gap-4">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user?.name || 'Profile avatar'}
                    className="h-16 w-16 rounded-full border border-white/10 object-cover"
                  />
                ) : (
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-blue-400/25 bg-blue-500/18 text-2xl font-semibold text-blue-200">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}

                <div>
                  <p className="text-xl font-semibold text-white">{user?.name}</p>
                  <p className="mt-1 text-sm text-gray-400">{user?.email}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-gray-500">
                    Joined {formatDate(user?.joinedAt || new Date().toISOString())}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
                  Role: {role}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
                  Active range: {timeRange}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
                  Auth: {user?.provider || 'local'}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Tracking Summary</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-gray-500">Months tracked</p>
                  <p className="mt-1 text-lg font-semibold text-white">{timelineSummary.monthsTracked}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-gray-500">This month</p>
                  <p className="mt-1 text-lg font-semibold text-white">{timelineSummary.thisMonthCount}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-gray-500">Top expense</p>
                  <p className="mt-1 text-sm font-semibold text-white">{timelineSummary.topExpenseCategory}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-gray-500">Avg expense</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {formatCurrency(timelineSummary.averageExpense, activeCurrency)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Profile Settings" subtitle="Update personal and preference details" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <form
              onSubmit={handleSaveProfile}
              className="rounded-xl border border-white/10 bg-white/5 p-5"
            >
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-400">
                Personal Info
              </h3>
              <label className="mt-4 block space-y-2">
                <span className="text-xs text-gray-500">Name</span>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(event) => setNameInput(event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-gray-200 outline-none transition-all duration-200 ease-in-out focus:border-blue-400/60"
                />
              </label>
              <div className="mt-4 flex justify-end">
                <Button type="submit" variant="primary">
                  Save Profile
                </Button>
              </div>
            </form>

            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-400">
                Preferences
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs text-gray-500">Theme</span>
                  <Button
                    type="button"
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
                    className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-gray-200 outline-none transition-all duration-200 ease-in-out focus:border-blue-400/60"
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
                <Button type="button" variant="primary" onClick={handleSavePreferences}>
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Financial Snapshot" subtitle="Current totals in your dashboard" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Transactions</p>
              <p className="mt-2 text-2xl font-semibold text-white">{transactions.length}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Total Income</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-300">
                {formatCurrency(stats.totalIncome, activeCurrency)}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Total Expenses</p>
              <p className="mt-2 text-2xl font-semibold text-red-300">
                {formatCurrency(stats.totalExpenses, activeCurrency)}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Net Savings</p>
              <p className="mt-2 text-2xl font-semibold text-blue-300">
                {formatCurrency(stats.totalBalance, activeCurrency)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <SectionHeader title="History" subtitle="Recent finance activity and timeline" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Recent Transactions</p>
              <ul className="mt-3 space-y-2">
                {recentTransactions.length ? (
                  recentTransactions.map((transaction) => (
                    <li
                      key={transaction.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{transaction.category}</p>
                        <p className="mt-1 text-xs text-gray-500">{formatDate(transaction.date)}</p>
                        <p className="mt-1 text-xs text-gray-400">{transaction.description || 'No note'}</p>
                      </div>
                      <p
                        className={`text-sm font-semibold ${
                          transaction.type === 'income' ? 'text-emerald-300' : 'text-red-300'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount, activeCurrency)}
                      </p>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-gray-400">No transactions yet.</li>
                )}
              </ul>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Account Timeline</p>
              <ul className="mt-3 space-y-2">
                <li className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-gray-300">
                  Account created on {formatDate(user?.joinedAt || new Date().toISOString())}
                </li>
                <li className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-gray-300">
                  First transaction: {timelineSummary.firstTransaction ? formatDate(timelineSummary.firstTransaction.date) : 'N/A'}
                </li>
                <li className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-gray-300">
                  Latest transaction: {timelineSummary.latestTransaction ? formatDate(timelineSummary.latestTransaction.date) : 'N/A'}
                </li>
                <li className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-gray-300">
                  Tracking history: {timelineSummary.monthsTracked} month(s)
                </li>
              </ul>
            </div>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Session" subtitle="Account control" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-400">
              {statusMessage || 'Your profile and finance preferences are saved in this browser.'}
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
