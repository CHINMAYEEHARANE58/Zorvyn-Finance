import { useEffect, useMemo, useRef, useState } from 'react'
import { SummaryCard } from '../components/cards/SummaryCard'
import { CleanChartsPanel } from '../components/charts/CleanChartsPanel'
import { EmptyState } from '../components/common/EmptyState'
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline'
import { BudgetProgressCard } from '../components/dashboard/BudgetProgressCard'
import { DashboardRightPanel } from '../components/dashboard/DashboardRightPanel'
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton'
import { DashboardTopBar } from '../components/layout/DashboardTopBar'
import { TransactionForm } from '../components/transactions/TransactionForm'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SectionReveal } from '../components/ui/SectionReveal'
import { Tooltip } from '../components/ui/Tooltip'
import { useAuth } from '../context/useAuth'
import { useFinance } from '../context/useFinance'
import { formatCurrency } from '../utils/formatters'
import { useNavigate } from 'react-router-dom'

const NOTIFICATION_READ_KEY = 'zorvyn.notifications.readIds'
const NOTIFICATION_DISMISSED_KEY = 'zorvyn.notifications.dismissedIds'

const readStoredArray = (key) => {
  try {
    const rawValue = window.localStorage.getItem(key)
    const parsed = rawValue ? JSON.parse(rawValue) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const buildDashboardNotifications = ({
  transactions,
  summary,
  insights,
  timeRange,
  currency,
}) => {
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  )

  const activityNotifications = sortedTransactions.slice(0, 6).map((transaction, index) => {
    const hour = transaction.type === 'income' ? 10 : 18
    const minute = (index * 7) % 60
    const eventAt = new Date(`${transaction.date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`)

    return {
      id: `txn-${transaction.id}`,
      type: 'activity',
      title:
        transaction.type === 'income'
          ? `${transaction.category} income recorded`
          : `${transaction.category} expense recorded`,
      message: `${transaction.description || 'No description'} · ${
        transaction.type === 'income' ? '+' : '-'
      }${formatCurrency(transaction.amount, currency)}`,
      eventAt: eventAt.toISOString(),
    }
  })

  const now = Date.now()
  const insightNotifications = []

  if (insights.spendingHealth?.status === 'Risky') {
    insightNotifications.push({
      id: `insight-spending-risk-${timeRange}`,
      type: 'alert',
      title: 'Spending alert',
      message: `Expenses are above safe limits for this ${timeRange}. Review discretionary categories.`,
      eventAt: new Date(now - 12 * 60 * 1000).toISOString(),
    })
  }

  if (insights.highestCategory) {
    insightNotifications.push({
      id: `insight-category-${insights.highestCategory.category}-${timeRange}`,
      type: 'insight',
      title: `Top spending category: ${insights.highestCategory.category}`,
      message: `${insights.highestCategory.percent}% of tracked expenses are from this category.`,
      eventAt: new Date(now - 42 * 60 * 1000).toISOString(),
    })
  }

  if (insights.savingsTrend === 'up') {
    insightNotifications.push({
      id: `insight-savings-up-${timeRange}`,
      type: 'insight',
      title: 'Savings trend improved',
      message: `Savings improved by ${insights.savingsImprovementPercent || 0}% compared with last month.`,
      eventAt: new Date(now - 90 * 60 * 1000).toISOString(),
    })
  } else if (insights.savingsTrend === 'down') {
    insightNotifications.push({
      id: `insight-savings-down-${timeRange}`,
      type: 'alert',
      title: 'Savings trend declined',
      message: 'Savings dipped compared with last month. Consider tightening one high-cost category.',
      eventAt: new Date(now - 90 * 60 * 1000).toISOString(),
    })
  }

  insightNotifications.push({
    id: `snapshot-balance-${timeRange}`,
    type: 'update',
    title: 'Balance snapshot updated',
    message: `Current balance is ${formatCurrency(summary.totalBalance, currency)} in ${timeRange} view.`,
    eventAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
  })

  return [...insightNotifications, ...activityNotifications].sort(
    (a, b) => new Date(b.eventAt) - new Date(a.eventAt),
  )
}

const triggerDownload = (name, content, mimeType) => {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}

const getPercentDeltaText = (current, previous) => {
  if (!previous) return '0%'
  const delta = ((current - previous) / Math.abs(previous || 1)) * 100
  const rounded = Math.round(delta)
  if (rounded > 0) return `+${rounded}%`
  return `${rounded}%`
}

export const DashboardPage = ({ activeSidebarItem, onOpenMobileSidebar }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const {
    isLoading,
    role,
    setRole,
    darkMode,
    setDarkMode,
    focusMode,
    setFocusMode,
    timeRange,
    setTimeRange,
    transactions,
    scopedTransactions,
    filteredTransactions,
    categories,
    filters,
    debouncedSearchTerm,
    updateFilter,
    clearFilters,
    setEditingTransaction,
    removeTransaction,
    editingTransaction,
    summary,
    insights,
  } = useFinance()

  const [showForm, setShowForm] = useState(false)
  const [presetType, setPresetType] = useState('expense')
  const [readNotificationIds, setReadNotificationIds] = useState(() =>
    readStoredArray(NOTIFICATION_READ_KEY),
  )
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState(() =>
    readStoredArray(NOTIFICATION_DISMISSED_KEY),
  )

  const dashboardRef = useRef(null)
  const budgetingRef = useRef(null)
  const transactionsRef = useRef(null)
  const walletsRef = useRef(null)
  const savingsRef = useRef(null)
  const reportsRef = useRef(null)

  const currency = user?.preferences?.currency || 'USD'
  const isSearching = filters.searchTerm.trim() !== debouncedSearchTerm.trim()
  const hasNoTransactions = scopedTransactions.length === 0
  const readOnly = role === 'viewer'

  const conciseInsights = useMemo(() => {
    return insights.conversationalInsights?.slice(0, 3) || []
  }, [insights.conversationalInsights])

  const dashboardNotifications = useMemo(
    () =>
      buildDashboardNotifications({
        transactions,
        summary,
        insights,
        timeRange,
        currency,
      }),
    [transactions, summary, insights, timeRange, currency],
  )

  const notifications = useMemo(() => {
    return dashboardNotifications
      .filter((notification) => !dismissedNotificationIds.includes(notification.id))
      .map((notification) => ({
        ...notification,
        isRead: readNotificationIds.includes(notification.id),
      }))
  }, [dashboardNotifications, dismissedNotificationIds, readNotificationIds])

  const unreadNotificationCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  )

  useEffect(() => {
    const sectionMap = {
      dashboard: dashboardRef,
      budgeting: budgetingRef,
      transactions: transactionsRef,
      wallets: walletsRef,
      savings: savingsRef,
      reports: reportsRef,
    }

    sectionMap[activeSidebarItem]?.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, [activeSidebarItem])

  useEffect(() => {
    window.localStorage.setItem(
      NOTIFICATION_READ_KEY,
      JSON.stringify(readNotificationIds),
    )
  }, [readNotificationIds])

  useEffect(() => {
    window.localStorage.setItem(
      NOTIFICATION_DISMISSED_KEY,
      JSON.stringify(dismissedNotificationIds),
    )
  }, [dismissedNotificationIds])

  const openAddForm = (nextType = 'expense') => {
    if (readOnly) return
    setPresetType(nextType)
    setEditingTransaction(null)
    setShowForm(true)
  }

  const openEditForm = (transaction) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingTransaction(null)
  }

  const openQuickActionForm = (nextType) => {
    openAddForm(nextType)
    transactionsRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const markNotificationRead = (notificationId) => {
    setReadNotificationIds((previous) =>
      previous.includes(notificationId) ? previous : [...previous, notificationId],
    )
  }

  const markAllNotificationsRead = () => {
    setReadNotificationIds((previous) => {
      const next = new Set(previous)
      notifications.forEach((notification) => next.add(notification.id))
      return [...next]
    })
  }

  const dismissNotification = (notificationId) => {
    setDismissedNotificationIds((previous) =>
      previous.includes(notificationId) ? previous : [...previous, notificationId],
    )
    setReadNotificationIds((previous) =>
      previous.includes(notificationId) ? previous : [...previous, notificationId],
    )
  }

  const exportCsv = () => {
    const header = ['Date', 'Amount', 'Category', 'Type', 'Description']
    const rows = filteredTransactions.map((transaction) => [
      transaction.date,
      transaction.amount,
      transaction.category,
      transaction.type,
      transaction.description || '',
    ])

    const csvContent = [header, ...rows]
      .map((row) => row.map((column) => `"${column}"`).join(','))
      .join('\n')

    triggerDownload('transactions.csv', csvContent, 'text/csv;charset=utf-8')
  }

  const exportJson = () => {
    const jsonContent = JSON.stringify(filteredTransactions, null, 2)
    triggerDownload('transactions.json', jsonContent, 'application/json;charset=utf-8')
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <div ref={dashboardRef}>
        <SectionReveal delay={0.02} className="relative z-50">
          <DashboardTopBar
            searchTerm={filters.searchTerm}
            onSearchChange={(value) => updateFilter('searchTerm', value)}
            role={role}
            onRoleChange={setRole}
            focusMode={focusMode}
            onToggleFocusMode={() => setFocusMode((previous) => !previous)}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            darkMode={darkMode}
            onToggleTheme={() => setDarkMode((previous) => !previous)}
            user={user}
            onOpenMobileSidebar={onOpenMobileSidebar}
            onOpenProfile={() => navigate('/profile')}
            notifications={notifications}
            unreadCount={unreadNotificationCount}
            onMarkNotificationRead={markNotificationRead}
            onMarkAllNotificationsRead={markAllNotificationsRead}
            onDismissNotification={dismissNotification}
          />
        </SectionReveal>
      </div>

      <SectionReveal delay={0.04}>
        <div ref={savingsRef} id="savings" className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <SummaryCard
            title="Balance"
            amount={summary.totalBalance}
            currency={currency}
            trendText={getPercentDeltaText(
              insights.latestMonth?.savings || 0,
              insights.previousMonth?.savings || 0,
            )}
          />
          <SummaryCard
            title="Income"
            amount={summary.totalIncome}
            currency={currency}
            tone="positive"
            trendText={getPercentDeltaText(
              insights.latestMonth?.income || 0,
              insights.previousMonth?.income || 0,
            )}
          />
          <SummaryCard
            title="Savings"
            amount={summary.totalBalance}
            currency={currency}
            tone={summary.totalBalance >= 0 ? 'positive' : 'negative'}
            trendText={`${insights.healthScore}%`}
          />
        </div>
      </SectionReveal>

      <div className={`grid gap-4 ${focusMode ? 'grid-cols-1' : 'grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_320px]'}`}>
        <div className="space-y-4">
          <SectionReveal delay={0.06}>
            <Card className="p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Smart Insights</p>
              <div className="mt-3 space-y-2">
                {conciseInsights.length ? (
                  conciseInsights.map((line) => (
                    <p key={line} className="text-sm text-gray-300 transition-colors duration-200 hover:text-gray-100">
                      {line}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">Insights will appear as data grows.</p>
                )}
              </div>
              {readOnly ? (
                <p className="mt-3 text-xs font-medium text-amber-300">Read-only mode</p>
              ) : null}
            </Card>
          </SectionReveal>

          {!focusMode ? (
            <SectionReveal delay={0.08}>
              <div ref={budgetingRef}>
                <BudgetProgressCard
                  used={summary.totalExpenses}
                  budget={Math.max(summary.totalIncome, summary.totalExpenses)}
                  currency={currency}
                />
              </div>
            </SectionReveal>
          ) : null}

          {!focusMode ? (
            <SectionReveal delay={0.1}>
              <CleanChartsPanel
                transactions={transactions}
                currency={currency}
                defaultRange={timeRange}
              />
            </SectionReveal>
          ) : null}

          <SectionReveal delay={0.12}>
            <div ref={transactionsRef} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-gray-500">
                  {isSearching
                    ? 'Searching...'
                    : `${filteredTransactions.length} of ${scopedTransactions.length} in this ${timeRange}`}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={exportCsv}>
                    Export CSV
                  </Button>
                  <Button size="sm" variant="secondary" onClick={exportJson}>
                    Export JSON
                  </Button>
                  {readOnly ? (
                    <Tooltip content="Switch to admin to edit">
                      <span>
                        <Button size="sm" variant="secondary" className="disabled:!opacity-90" disabled>
                          Add
                        </Button>
                      </span>
                    </Tooltip>
                  ) : (
                    <Button size="sm" variant="primary" onClick={() => openAddForm('expense')}>
                      Add
                    </Button>
                  )}
                </div>
              </div>

              <div
                className={`grid overflow-hidden transition-all duration-200 ease-in-out ${
                  showForm ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  {readOnly ? null : (
                    <TransactionForm
                      key={editingTransaction?.id ?? `${presetType}-new`}
                      presetType={presetType}
                      onClose={closeForm}
                    />
                  )}
                </div>
              </div>

              {hasNoTransactions ? (
                <EmptyState
                  title="No transactions yet"
                  description="Start by adding your first entry."
                  action={readOnly ? null : () => openAddForm('expense')}
                  actionLabel="Add transaction"
                />
              ) : (
                <ActivityTimeline
                  transactions={filteredTransactions}
                  role={role}
                  currency={currency}
                  categories={categories}
                  filters={filters}
                  isSearching={isSearching}
                  onFilterChange={updateFilter}
                  onClearFilters={clearFilters}
                  onAdd={() => openAddForm('expense')}
                  onEdit={openEditForm}
                  onDelete={removeTransaction}
                />
              )}
            </div>
          </SectionReveal>
        </div>

        {!focusMode ? (
          <SectionReveal delay={0.14}>
            <div ref={walletsRef} className="space-y-4">
              <div ref={reportsRef}>
                <DashboardRightPanel
                  userId={user?.id || 'guest'}
                  transactions={transactions}
                  summary={summary}
                  insights={insights}
                  currency={currency}
                  readOnly={readOnly}
                  onTransfer={() => openQuickActionForm('expense')}
                  onTopUp={() => openQuickActionForm('income')}
                  onSave={() => {
                    setFocusMode(false)
                    savingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                />
              </div>
            </div>
          </SectionReveal>
        ) : null}
      </div>
    </div>
  )
}
