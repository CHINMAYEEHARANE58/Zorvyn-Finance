import { useMemo } from 'react'
import {
  buildBalanceTrend,
  buildCategoryBreakdown,
  buildMonthlyStats,
  calculateTotals,
} from '../utils/finance'

const round = (value) => Math.round(Number(value) || 0)
const ONE_DAY = 24 * 60 * 60 * 1000
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const toDate = (value) => {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

const inDateRange = (dateValue, startDate, endDate) => {
  const date = toDate(dateValue)
  return date >= startDate && date <= endDate
}

export const useInsights = ({ scopedTransactions, allTransactions, timeRange }) => {
  const summary = useMemo(() => calculateTotals(scopedTransactions), [scopedTransactions])

  const trendData = useMemo(
    () => buildBalanceTrend(scopedTransactions),
    [scopedTransactions],
  )

  const categoryData = useMemo(
    () => buildCategoryBreakdown(scopedTransactions).slice(0, 6),
    [scopedTransactions],
  )

  const monthlyStats = useMemo(
    () => buildMonthlyStats(allTransactions),
    [allTransactions],
  )

  const insights = useMemo(() => {
    const highestCategory = categoryData[0] || null
    const latestMonth = monthlyStats[monthlyStats.length - 1] || null
    const previousMonth = monthlyStats[monthlyStats.length - 2] || null
    const sortedDates = allTransactions
      .map((transaction) => toDate(transaction.date))
      .sort((a, b) => b - a)
    const latestDate = sortedDates[0] || toDate(new Date())
    const weekStart = new Date(latestDate.getTime() - 6 * ONE_DAY)
    const previousWeekEnd = new Date(weekStart.getTime() - ONE_DAY)
    const previousWeekStart = new Date(previousWeekEnd.getTime() - 6 * ONE_DAY)

    const currentWeekTransactions = allTransactions.filter((transaction) =>
      inDateRange(transaction.date, weekStart, latestDate),
    )
    const previousWeekTransactions = allTransactions.filter((transaction) =>
      inDateRange(transaction.date, previousWeekStart, previousWeekEnd),
    )

    const averageExpense =
      scopedTransactions
        .filter((transaction) => transaction.type === 'expense')
        .reduce((sum, transaction, _, all) => sum + transaction.amount / (all.length || 1), 0) ||
      0

    const averageMonthlyIncome =
      monthlyStats.reduce((sum, month) => sum + month.income, 0) /
      (monthlyStats.length || 1)

    const savingsChange =
      latestMonth && previousMonth
        ? latestMonth.savings - previousMonth.savings
        : 0

    const savingsTrend = savingsChange > 0 ? 'up' : savingsChange < 0 ? 'down' : 'flat'

    const savingsImprovementPercent =
      latestMonth && previousMonth && previousMonth.savings !== 0
        ? round((Math.abs(savingsChange) / Math.abs(previousMonth.savings)) * 100)
        : 0

    const spendingRatio =
      summary.totalIncome > 0 ? summary.totalExpenses / summary.totalIncome : 1
    const savingsRatio =
      summary.totalIncome > 0 ? summary.totalBalance / summary.totalIncome : 0

    const savingsScore = clamp(savingsRatio * 125, 0, 65)
    const disciplineScore = clamp((1 - spendingRatio) * 100, 0, 35)
    const healthScore = round(clamp(savingsScore + disciplineScore, 0, 100))
    const healthLabel =
      healthScore >= 75 ? 'Healthy' : healthScore >= 50 ? 'Average' : 'Risky'

    const spendingHealth =
      spendingRatio < 0.6
        ? { status: 'Healthy', tone: 'success' }
        : spendingRatio < 0.85
          ? { status: 'Warning', tone: 'warning' }
          : { status: 'Risky', tone: 'danger' }

    const rentExpense = scopedTransactions
      .filter(
        (transaction) =>
          transaction.type === 'expense' && transaction.category.toLowerCase() === 'rent',
      )
      .reduce((sum, transaction) => sum + transaction.amount, 0)

    const rentToIncomeRatio =
      summary.totalIncome > 0 ? round((rentExpense / summary.totalIncome) * 100) : 0

    const timeLabel = timeRange === 'week' ? 'this week' : timeRange === 'year' ? 'this year' : 'this month'
    const currentWeekTotals = calculateTotals(currentWeekTransactions)
    const previousWeekTotals = calculateTotals(previousWeekTransactions)
    const weekSavingsDelta =
      currentWeekTotals.totalBalance - previousWeekTotals.totalBalance
    const weekExpenseDelta =
      currentWeekTotals.totalExpenses - previousWeekTotals.totalExpenses
    const weekSavingsChangePercent =
      previousWeekTotals.totalBalance !== 0
        ? round((weekSavingsDelta / Math.abs(previousWeekTotals.totalBalance)) * 100)
        : 0
    const weekExpenseChangePercent =
      previousWeekTotals.totalExpenses !== 0
        ? round((weekExpenseDelta / Math.abs(previousWeekTotals.totalExpenses)) * 100)
        : 0
    const highestWeeklyCategory = buildCategoryBreakdown(currentWeekTransactions)[0] || null
    const expenseTrendDirection =
      latestMonth && previousMonth
        ? latestMonth.expenses > previousMonth.expenses
          ? 'up'
          : latestMonth.expenses < previousMonth.expenses
            ? 'down'
            : 'flat'
        : 'flat'
    const incomeTrendDirection =
      latestMonth && previousMonth
        ? latestMonth.income > previousMonth.income
          ? 'up'
          : latestMonth.income < previousMonth.income
            ? 'down'
            : 'flat'
        : 'flat'
    const balanceTrendDirection = savingsTrend

    const conversationalInsights = [
      highestCategory
        ? `You're spending more on ${highestCategory.category.toLowerCase()} ${timeLabel}.`
        : `No spending categories available ${timeLabel}.`,
      summary.totalIncome > 0
        ? `Your expenses are ${round(spendingRatio * 100)}% of income ${timeLabel}.`
        : `No income logged ${timeLabel}, so spending health is conservative.`,
      rentExpense > 0
        ? `Your rent takes ${rentToIncomeRatio}% of your income ${timeLabel}.`
        : `No rent transactions were detected ${timeLabel}.`,
      savingsTrend === 'up'
        ? `Your savings improved ${savingsImprovementPercent}% compared with last month.`
        : savingsTrend === 'down'
          ? `Savings declined compared with last month.`
          : `Savings stayed flat compared with last month.`,
    ]

    const storyHeadline =
      weekSavingsChangePercent > 0
        ? `You improved your weekly savings by ${Math.abs(weekSavingsChangePercent)}%.`
        : weekSavingsChangePercent < 0
          ? `Your weekly savings dipped by ${Math.abs(weekSavingsChangePercent)}%.`
          : 'Your weekly savings stayed stable.'

    const storyHighlights = [
      weekExpenseChangePercent > 0
        ? `Spending increased by ${Math.abs(weekExpenseChangePercent)}% versus last week.`
        : weekExpenseChangePercent < 0
          ? `Spending reduced by ${Math.abs(weekExpenseChangePercent)}% versus last week.`
          : 'Spending remained flat week-over-week.',
      highestWeeklyCategory
        ? `${highestWeeklyCategory.category} was the top expense category this week (${highestWeeklyCategory.percent}% share).`
        : 'No expense category data available for this week.',
      currentWeekTotals.totalIncome > 0
        ? `You retained ${round((currentWeekTotals.totalBalance / currentWeekTotals.totalIncome) * 100)}% of this week income as savings.`
        : 'No income recorded this week.',
    ]

    const weeklySummary = [
      `Weekly spend changed by ${weekExpenseChangePercent >= 0 ? '+' : ''}${weekExpenseChangePercent}% versus last week.`,
      highestWeeklyCategory
        ? `${highestWeeklyCategory.category} is driving ${highestWeeklyCategory.percent}% of current weekly expenses.`
        : 'No clear category concentration this week.',
      weekSavingsChangePercent >= 0
        ? `Savings trend is up by ${Math.abs(weekSavingsChangePercent)}% this week.`
        : `Savings trend is down by ${Math.abs(weekSavingsChangePercent)}% this week.`,
    ]

    const nudges = []
    if (highestCategory?.percent >= 35) {
      nudges.push({
        id: 'top-category-cut',
        tone: 'warning',
        title: `Your ${highestCategory.category} spend is heavy`,
        message: 'Try reducing this category by 10% to create room for savings.',
      })
    }

    if (spendingRatio > 0.8) {
      nudges.push({
        id: 'ratio',
        tone: 'danger',
        title: 'Spending pressure is high',
        message: 'Reduce non-essential spends to bring expenses below 75% of income.',
      })
    }

    if (savingsTrend !== 'up' && latestMonth) {
      nudges.push({
        id: 'autosave',
        tone: 'info',
        title: 'Create an auto-save rule',
        message: 'Move 5% of income to savings right after payday to protect your buffer.',
      })
    }

    if (!nudges.length) {
      nudges.push({
        id: 'keep-going',
        tone: 'success',
        title: 'Great discipline',
        message: 'Your spending pattern looks balanced. Keep this rhythm next cycle.',
      })
    }

    const monthsWithData = new Set(allTransactions.map((transaction) => transaction.date.slice(0, 7))).size
    const incomeSources = new Set(
      scopedTransactions
        .filter((transaction) => transaction.type === 'income')
        .map((transaction) => transaction.category),
    ).size
    const achievements = []

    if (spendingRatio < 0.6) {
      achievements.push({
        id: 'budget-guardian',
        icon: 'BG',
        title: 'Budget Guardian',
        description: 'Expenses stayed under 60% of income in the selected range.',
        tone: 'success',
      })
    }

    if (savingsTrend === 'up') {
      achievements.push({
        id: 'savings-streak',
        icon: 'ST',
        title: 'Savings Streak',
        description: 'Savings improved versus the previous month.',
        tone: 'info',
      })
    }

    if (incomeSources > 1) {
      achievements.push({
        id: 'income-diversifier',
        icon: 'ID',
        title: 'Income Diversifier',
        description: 'You recorded multiple income streams.',
        tone: 'neutral',
      })
    }

    if (monthsWithData >= 3) {
      achievements.push({
        id: 'consistency',
        icon: 'CS',
        title: 'Consistency Builder',
        description: `You have ${monthsWithData} months of tracked history.`,
        tone: 'neutral',
      })
    }

    return {
      highestCategory,
      latestMonth,
      previousMonth,
      averageExpense: round(averageExpense),
      averageMonthlyIncome: round(averageMonthlyIncome),
      savingsChange,
      savingsTrend,
      savingsImprovementPercent,
      spendingRatio,
      savingsRatio,
      spendingHealth,
      healthScore,
      healthLabel,
      expenseTrendDirection,
      incomeTrendDirection,
      balanceTrendDirection,
      rentToIncomeRatio,
      conversationalInsights,
      weeklySummary,
      story: {
        headline: storyHeadline,
        highlights: storyHighlights,
      },
      nudges,
      achievements: achievements.slice(0, 3),
    }
  }, [allTransactions, categoryData, monthlyStats, scopedTransactions, summary, timeRange])

  return {
    summary,
    trendData,
    categoryData,
    monthlyStats,
    insights,
  }
}
