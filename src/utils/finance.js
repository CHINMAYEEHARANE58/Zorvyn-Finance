import { formatMonthLabel } from './formatters'

const toDate = (value) => {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

export const filterTransactionsByTimeRange = (
  transactions,
  timeRange,
  referenceDateInput,
) => {
  if (!transactions.length) return []

  const referenceDate = referenceDateInput
    ? toDate(referenceDateInput)
    : transactions
        .map((transaction) => toDate(transaction.date))
        .sort((a, b) => b - a)[0]

  if (!referenceDate) return transactions

  if (timeRange === 'year') {
    const referenceYear = referenceDate.getFullYear()
    return transactions.filter(
      (transaction) => toDate(transaction.date).getFullYear() === referenceYear,
    )
  }

  if (timeRange === 'week') {
    const startDate = new Date(referenceDate)
    startDate.setDate(referenceDate.getDate() - 6)

    return transactions.filter((transaction) => {
      const date = toDate(transaction.date)
      return date >= startDate && date <= referenceDate
    })
  }

  const yearMonth = referenceDate.toISOString().slice(0, 7)
  return transactions.filter((transaction) => transaction.date.startsWith(yearMonth))
}

export const calculateTotals = (transactions) => {
  const totals = transactions.reduce(
    (accumulator, transaction) => {
      if (transaction.type === 'income') {
        accumulator.income += transaction.amount
      } else {
        accumulator.expenses += transaction.amount
      }
      return accumulator
    },
    { income: 0, expenses: 0 },
  )

  return {
    totalIncome: totals.income,
    totalExpenses: totals.expenses,
    totalBalance: totals.income - totals.expenses,
  }
}

export const buildMonthlyStats = (transactions) => {
  const monthMap = transactions.reduce((accumulator, transaction) => {
    const monthKey = transaction.date.slice(0, 7)
    const existing = accumulator.get(monthKey) || { income: 0, expenses: 0 }

    if (transaction.type === 'income') {
      existing.income += transaction.amount
    } else {
      existing.expenses += transaction.amount
    }

    accumulator.set(monthKey, existing)
    return accumulator
  }, new Map())

  return [...monthMap.keys()]
    .sort()
    .map((monthKey) => {
      const monthData = monthMap.get(monthKey)
      return {
        monthKey,
        month: formatMonthLabel(monthKey),
        income: monthData.income,
        expenses: monthData.expenses,
        savings: monthData.income - monthData.expenses,
      }
    })
}

export const buildBalanceTrend = (transactions) => {
  let runningBalance = 0

  return buildMonthlyStats(transactions).map((monthData) => {
    runningBalance += monthData.savings
    return {
      ...monthData,
      balance: runningBalance,
    }
  })
}

export const buildCategoryBreakdown = (transactions) => {
  const grouped = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((accumulator, transaction) => {
      accumulator[transaction.category] =
        (accumulator[transaction.category] || 0) + transaction.amount
      return accumulator
    }, {})

  const totalExpense = Object.values(grouped).reduce((sum, value) => sum + value, 0)

  return Object.entries(grouped)
    .map(([category, value]) => ({
      category,
      value,
      percent: totalExpense ? Math.round((value / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value)
}

export const sortTransactions = (transactions, sortBy) => {
  const sorted = [...transactions]

  switch (sortBy) {
    case 'date-asc':
      sorted.sort((a, b) => new Date(a.date) - new Date(b.date))
      break
    case 'amount-asc':
      sorted.sort((a, b) => a.amount - b.amount)
      break
    case 'amount-desc':
      sorted.sort((a, b) => b.amount - a.amount)
      break
    case 'date-desc':
    default:
      sorted.sort((a, b) => new Date(b.date) - new Date(a.date))
      break
  }

  return sorted
}
