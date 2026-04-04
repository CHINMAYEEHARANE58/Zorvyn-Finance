import { useCallback, useEffect, useMemo, useState } from 'react'
import { DEFAULT_CATEGORIES, MOCK_TRANSACTIONS } from '../data/mockTransactions'

const sanitizeTransaction = (transaction, index) => {
  const amount = Number(transaction.amount)
  const type = transaction.type === 'income' ? 'income' : 'expense'
  const date = String(transaction.date || '').slice(0, 10)

  if (!date || Number.isNaN(amount) || amount < 0 || !transaction.category) {
    return null
  }

  return {
    id: transaction.id || `import-${Date.now()}-${index}`,
    date,
    amount,
    description: String(transaction.description || ''),
    category: String(transaction.category),
    type,
  }
}

export const useTransactions = ({ storageKey, loadingDelay = 350 }) => {
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const bootstrapTimer = setTimeout(() => {
      try {
        const rawValue = window.localStorage.getItem(storageKey)
        const parsed = rawValue ? JSON.parse(rawValue) : null

        setTransactions(
          Array.isArray(parsed) && parsed.length > 0 ? parsed : MOCK_TRANSACTIONS,
        )
      } catch {
        setTransactions(MOCK_TRANSACTIONS)
      }

      setIsLoading(false)
    }, loadingDelay)

    return () => clearTimeout(bootstrapTimer)
  }, [storageKey, loadingDelay])

  useEffect(() => {
    if (isLoading) return
    window.localStorage.setItem(storageKey, JSON.stringify(transactions))
  }, [storageKey, transactions, isLoading])

  const categories = useMemo(() => {
    const dynamicCategories = transactions.map((transaction) => transaction.category)
    return [...new Set([...DEFAULT_CATEGORIES, ...dynamicCategories])]
  }, [transactions])

  const addTransaction = useCallback((payload) => {
    const id = `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    setTransactions((previous) => [...previous, { id, ...payload }])
  }, [])

  const updateTransaction = useCallback((transactionId, payload) => {
    setTransactions((previous) =>
      previous.map((transaction) =>
        transaction.id === transactionId ? { ...transaction, ...payload } : transaction,
      ),
    )
  }, [])

  const removeTransaction = useCallback((transactionId) => {
    setTransactions((previous) =>
      previous.filter((transaction) => transaction.id !== transactionId),
    )
  }, [])

  const replaceTransactions = useCallback((payloadTransactions) => {
    if (!Array.isArray(payloadTransactions)) {
      return { ok: false, error: 'Invalid JSON format. Expected an array of transactions.' }
    }

    const sanitized = payloadTransactions
      .map((transaction, index) => sanitizeTransaction(transaction, index))
      .filter(Boolean)

    if (!sanitized.length) {
      return { ok: false, error: 'No valid transactions found in imported file.' }
    }

    setTransactions(sanitized)
    return { ok: true, importedCount: sanitized.length }
  }, [])

  const resetData = useCallback(() => {
    setTransactions(MOCK_TRANSACTIONS)
  }, [])

  return {
    transactions,
    isLoading,
    categories,
    addTransaction,
    updateTransaction,
    removeTransaction,
    replaceTransactions,
    resetData,
  }
}
