import { useMemo, useRef, useState } from 'react'
import { SummaryCard } from '../components/cards/SummaryCard'
import { BalanceTrendChart } from '../components/charts/BalanceTrendChart'
import { SpendingBreakdownToggleChart } from '../components/charts/SpendingBreakdownToggleChart'
import { EmptyState } from '../components/common/EmptyState'
import { CategoryBudgetLimits } from '../components/dashboard/CategoryBudgetLimits'
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton'
import { FinancialHealthScoreCard } from '../components/dashboard/FinancialHealthScoreCard'
import { GoalTracker } from '../components/dashboard/GoalTracker'
import { MiniCalendarView } from '../components/dashboard/MiniCalendarView'
import { InsightsCarousel } from '../components/insights/InsightsCarousel'
import { InsightsPanel } from '../components/insights/InsightsPanel'
import { DashboardHeader } from '../components/layout/DashboardHeader'
import { TransactionFilters } from '../components/transactions/TransactionFilters'
import { TransactionForm } from '../components/transactions/TransactionForm'
import { TransactionTable } from '../components/transactions/TransactionTable'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { SectionReveal } from '../components/ui/SectionReveal'
import { Tooltip } from '../components/ui/Tooltip'
import { useAuth } from '../context/useAuth'
import { useFinance } from '../context/useFinance'

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

const getTrendIndicator = (direction) => {
  if (direction === 'up') return '↑'
  if (direction === 'down') return '↓'
  return '→'
}

export const DashboardPage = () => {
  const { user } = useAuth()
  const {
    isLoading,
    role,
    focusMode,
    timeRange,
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
    importTransactions,
    editingTransaction,
    summary,
    trendData,
    insights,
    resetData,
  } = useFinance()

  const [showForm, setShowForm] = useState(false)
  const [presetType, setPresetType] = useState('expense')
  const [importStatus, setImportStatus] = useState('')
  const importInputRef = useRef(null)
  const transactionsRef = useRef(null)

  const hasNoTransactions = !isLoading && scopedTransactions.length === 0
  const hasNoResults =
    !isLoading && scopedTransactions.length > 0 && filteredTransactions.length === 0
  const isSearching = filters.searchTerm.trim() !== debouncedSearchTerm.trim()

  const firstName = user?.name?.split(' ')[0] || ''
  const currency = user?.preferences?.currency || 'USD'

  const conciseInsights = useMemo(() => {
    return [
      insights.highestCategory
        ? `${getTrendIndicator(insights.expenseTrendDirection)} Highest spending category: ${insights.highestCategory.category} (${insights.highestCategory.percent}% of expenses).`
        : 'No spending category pattern is available yet.',
      `${getTrendIndicator(insights.expenseTrendDirection)} Expenses are ${Math.round(insights.spendingRatio * 100)}% of income this period.`,
      `${getTrendIndicator(insights.balanceTrendDirection)} Savings trend: ${insights.savingsTrend === 'up' ? 'Improving' : insights.savingsTrend === 'down' ? 'Declining' : 'Stable'}.`,
    ].slice(0, 3)
  }, [insights])

  const carouselSlides = useMemo(
    () => [
      {
        title: 'Weekly Summary',
        text: insights.weeklySummary?.[0] || 'Weekly data will appear as transactions are added.',
      },
      {
        title: 'Category Movement',
        text: insights.weeklySummary?.[1] || 'Category movement insights are not available yet.',
      },
      {
        title: 'Smart Tip',
        text:
          insights.nudges?.[0]?.message ||
          'Keep your top expense category under control to improve monthly savings.',
      },
    ],
    [insights.nudges, insights.weeklySummary],
  )

  const openAddForm = (nextType = 'expense') => {
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

  const onImportClick = () => {
    importInputRef.current?.click()
  }

  const onImportFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const fileText = await file.text()
      const parsed = JSON.parse(fileText)
      const result = importTransactions(parsed)

      if (!result.ok) {
        setImportStatus(result.error)
      } else {
        setImportStatus(`Imported ${result.importedCount} transactions successfully.`)
      }
    } catch {
      setImportStatus('Import failed. Please upload a valid JSON file.')
    } finally {
      event.target.value = ''
    }
  }

  const heroInsight =
    insights.savingsTrend === 'up' && insights.savingsImprovementPercent > 0
      ? `You saved ${insights.savingsImprovementPercent}% more this month.`
      : insights.savingsTrend === 'down'
        ? 'Savings softened compared to last month.'
        : 'Your savings stayed stable this month.'

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <SectionReveal>
        <DashboardHeader
          userName={firstName}
          heroInsight={heroInsight}
          primaryActionLabel={role === 'admin' ? 'Add Transaction' : 'View Transactions'}
          onPrimaryAction={
            role === 'admin'
              ? () => openAddForm('expense')
              : () =>
                  transactionsRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  })
          }
        />
      </SectionReveal>

      {focusMode ? (
        <SectionReveal className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SummaryCard
            title="Total Balance"
            amount={summary.totalBalance}
            currency={currency}
            trendText={getPercentDeltaText(
              insights.latestMonth?.savings || 0,
              insights.previousMonth?.savings || 0,
            )}
          />
          <FinancialHealthScoreCard score={insights.healthScore} label={insights.healthLabel} />
        </SectionReveal>
      ) : (
        <SectionReveal className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Balance"
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
            title="Expenses"
            amount={summary.totalExpenses}
            currency={currency}
            tone="negative"
            trendText={getPercentDeltaText(
              insights.latestMonth?.expenses || 0,
              insights.previousMonth?.expenses || 0,
            )}
          />
          <FinancialHealthScoreCard score={insights.healthScore} label={insights.healthLabel} />
        </SectionReveal>
      )}

      <SectionReveal>
        <Card>
          <SectionHeader title="Insights" subtitle="Quick weekly summary and recommendations" />
          <InsightsPanel
            insights={insights}
            currency={currency}
            conciseInsights={conciseInsights}
          />
        </Card>
      </SectionReveal>

      {!focusMode ? (
        <SectionReveal className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <GoalTracker
            key={`${user?.id || 'goal'}-${currency}`}
            userId={user?.id || 'guest'}
            currentSavings={summary.totalBalance}
            currency={currency}
          />
          <InsightsCarousel slides={carouselSlides} />
        </SectionReveal>
      ) : null}

      {!focusMode ? (
        <>
          <SectionReveal className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card>
              <SectionHeader title="Balance Trend" subtitle={`Performance for this ${timeRange}`} />
              {trendData.length ? (
                <BalanceTrendChart key={timeRange} data={trendData} currency={currency} />
              ) : (
                <EmptyState
                  title="No chart data"
                  description="Add transactions to visualize your trend."
                  action={role === 'admin' ? () => openAddForm('expense') : null}
                  actionLabel="Add transaction"
                />
              )}
            </Card>

            <Card>
              <SectionHeader
                title="Spending Breakdown"
                subtitle="Toggle by category, time, or transaction type"
              />
              <SpendingBreakdownToggleChart
                transactions={scopedTransactions}
                currency={currency}
              />
            </Card>
          </SectionReveal>

          <SectionReveal className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <CategoryBudgetLimits
              userId={user?.id || 'guest'}
              transactions={scopedTransactions}
              categories={categories.filter((category) => !['Salary', 'Freelance'].includes(category))}
              currency={currency}
            />
            <MiniCalendarView transactions={transactions} currency={currency} />
          </SectionReveal>
        </>
      ) : (
        <SectionReveal>
          <Card>
            <SectionHeader
              title="Focus Mode"
              subtitle="Charts and transactions are hidden to minimize distractions."
            />
            <p className="text-sm text-gray-400">
              Focus mode is active. Disable it from the header to view the full workspace.
            </p>
          </Card>
        </SectionReveal>
      )}

      {!focusMode ? (
        <SectionReveal>
          <Card>
            <div ref={transactionsRef}>
              <SectionHeader
                title="Transactions"
                subtitle={`${filteredTransactions.length} of ${scopedTransactions.length} shown`}
                actions={
                  role === 'admin' ? (
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" onClick={onImportClick}>
                        Import JSON
                      </Button>
                      <Button variant="primary" onClick={() => openAddForm('expense')}>
                        Add Transaction
                      </Button>
                    </div>
                  ) : (
                    <Tooltip content="Switch to admin to edit">
                      <span>
                        <Button variant="secondary" disabled>
                          Add Transaction
                        </Button>
                      </span>
                    </Tooltip>
                  )
                }
              />
            </div>

            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={onImportFileChange}
            />

            <div className="space-y-5">
              <TransactionFilters
                filters={filters}
                categories={categories}
                onChange={updateFilter}
                onClear={clearFilters}
                onExportCsv={exportCsv}
                onExportJson={exportJson}
                isSearching={isSearching}
              />

              {importStatus ? (
                <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300">
                  {importStatus}
                </p>
              ) : null}

              <div
                className={`grid overflow-hidden transition-all duration-200 ease-in-out ${
                  showForm ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  {role === 'admin' ? (
                    <TransactionForm
                      key={editingTransaction?.id ?? `${presetType}-new`}
                      presetType={presetType}
                      onClose={closeForm}
                    />
                  ) : null}
                </div>
              </div>

              {hasNoTransactions ? (
                <EmptyState
                  title="No transactions yet"
                  description="Start by adding your first income or expense entry."
                  action={role === 'admin' ? () => openAddForm('expense') : null}
                  actionLabel="Add transaction"
                />
              ) : null}

              {hasNoResults ? (
                <EmptyState
                  title="No transactions found"
                  description="Try adjusting filters or search to reveal matching entries."
                  action={clearFilters}
                  actionLabel="Clear filters"
                />
              ) : null}

              <TransactionTable
                transactions={filteredTransactions}
                role={role}
                onEdit={openEditForm}
                onDelete={removeTransaction}
                currency={currency}
              />

              {role === 'admin' ? (
                <div className="flex justify-end">
                  <Button variant="secondary" onClick={resetData}>
                    Restore Mock Data
                  </Button>
                </div>
              ) : null}
            </div>
          </Card>
        </SectionReveal>
      ) : null}
    </div>
  )
}
