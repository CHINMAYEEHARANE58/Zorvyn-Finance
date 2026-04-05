import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { filterTransactionsByTimeRange } from '../utils/finance'
import { FILTER_DEFAULTS, useFilters } from '../hooks/useFilters'
import { useInsights } from '../hooks/useInsights'
import { useTransactions } from '../hooks/useTransactions'

const STORAGE_KEYS = {
  transactions: 'zorvyn.transactions',
  role: 'zorvyn.role',
  theme: 'zorvyn.theme',
  focusMode: 'zorvyn.focusMode',
  timeRange: 'zorvyn.timeRange',
  sectionPrefs: 'zorvyn.sectionPrefs',
}

const FinanceContext = createContext(null)

const readStorage = (key) => {
  try {
    const rawValue = window.localStorage.getItem(key)
    return rawValue ? JSON.parse(rawValue) : null
  } catch {
    return null
  }
}

const getInitialRole = () => {
  const value = readStorage(STORAGE_KEYS.role)
  return value === 'admin' || value === 'viewer' ? value : 'viewer'
}

const getInitialTheme = () => {
  const value = readStorage(STORAGE_KEYS.theme)
  return typeof value === 'boolean' ? value : true
}

const getInitialFocusMode = () => {
  const value = readStorage(STORAGE_KEYS.focusMode)
  return typeof value === 'boolean' ? value : false
}

const getInitialTimeRange = () => {
  const value = readStorage(STORAGE_KEYS.timeRange)
  return ['week', 'month', 'year'].includes(value) ? value : 'month'
}

const getInitialSectionPreferences = () => {
  const value = readStorage(STORAGE_KEYS.sectionPrefs)

  return {
    showCharts: typeof value?.showCharts === 'boolean' ? value.showCharts : true,
    showInsights: typeof value?.showInsights === 'boolean' ? value.showInsights : true,
  }
}

export const FinanceProvider = ({ children }) => {
  const {
    transactions,
    isLoading,
    apiError,
    categories,
    addTransaction,
    updateTransaction,
    removeTransaction,
    replaceTransactions,
    resetData,
    retryLoad,
    clearApiError,
  } = useTransactions({ storageKey: STORAGE_KEYS.transactions })

  const [role, setRole] = useState(getInitialRole)
  const [darkMode, setDarkMode] = useState(getInitialTheme)
  const [focusMode, setFocusMode] = useState(getInitialFocusMode)
  const [timeRange, setTimeRange] = useState(getInitialTimeRange)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [sectionPreferences, setSectionPreferences] = useState(getInitialSectionPreferences)

  const scopedTransactions = useMemo(
    () => filterTransactionsByTimeRange(transactions, timeRange),
    [transactions, timeRange],
  )

  const {
    filters,
    debouncedSearchTerm,
    filteredTransactions,
    updateFilter,
    clearFilters,
    setFilters,
  } = useFilters({ transactions: scopedTransactions })

  const { summary, trendData, categoryData, monthlyStats, insights } = useInsights({
    scopedTransactions,
    allTransactions: transactions,
    timeRange,
  })

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.role, JSON.stringify(role))
  }, [role])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(darkMode))
  }, [darkMode])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.focusMode, JSON.stringify(focusMode))
  }, [focusMode])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.timeRange, JSON.stringify(timeRange))
  }, [timeRange])

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEYS.sectionPrefs,
      JSON.stringify(sectionPreferences),
    )
  }, [sectionPreferences])

  const changeRole = useCallback((nextRole) => {
    setRole(nextRole)
    if (nextRole === 'viewer') {
      setEditingTransaction(null)
    }
  }, [])

  const updateExistingTransaction = useCallback(
    async (transactionId, payload) => {
      const result = await updateTransaction(transactionId, payload)
      if (result.ok) {
        setEditingTransaction(null)
      }
      return result
    },
    [updateTransaction],
  )

  const importTransactions = useCallback(
    async (payloadTransactions) => {
      return replaceTransactions(payloadTransactions)
    },
    [replaceTransactions],
  )

  const toggleSectionVisibility = useCallback((sectionKey) => {
    setSectionPreferences((previous) => ({
      ...previous,
      [sectionKey]: !previous[sectionKey],
    }))
  }, [])

  const resetAllData = useCallback(async () => {
    await resetData()
    setFilters(FILTER_DEFAULTS)
    setEditingTransaction(null)
  }, [resetData, setFilters])

  const value = {
    isLoading,
    transactionsApiError: apiError,
    retryTransactionsLoad: retryLoad,
    clearTransactionsApiError: clearApiError,
    role,
    setRole: changeRole,
    darkMode,
    setDarkMode,
    focusMode,
    setFocusMode,
    timeRange,
    setTimeRange,
    sectionPreferences,
    toggleSectionVisibility,
    transactions,
    scopedTransactions,
    filteredTransactions,
    categories,
    filters,
    debouncedSearchTerm,
    updateFilter,
    clearFilters,
    addTransaction,
    updateTransaction: updateExistingTransaction,
    removeTransaction,
    importTransactions,
    editingTransaction,
    setEditingTransaction,
    resetData: resetAllData,
    summary,
    trendData,
    categoryData,
    monthlyStats,
    insights,
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export { FinanceContext }
