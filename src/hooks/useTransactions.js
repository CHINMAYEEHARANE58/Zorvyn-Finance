import { useCallback, useEffect, useMemo, useState } from 'react'
import { DEFAULT_CATEGORIES } from '../data/mockTransactions'
import { getMockApiErrorMessage } from '../api/mockApiClient'
import { transactionsApi } from '../api/transactionsApi'

const getCategoriesFromTransactions = (transactions) => {
  const dynamicCategories = transactions.map((transaction) => transaction.category)
  return [...new Set([...DEFAULT_CATEGORIES, ...dynamicCategories])]
}

export const useTransactions = ({ storageKey }) => {
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState('')

  const loadTransactions = useCallback(async () => {
    setIsLoading(true)

    try {
      const response = await transactionsApi.list({ storageKey })
      setTransactions(response.data.transactions)
      setApiError('')
      return { ok: true }
    } catch (error) {
      const message = getMockApiErrorMessage(error, 'Failed to load transactions.')
      setApiError(message)
      return { ok: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [storageKey])

  useEffect(() => {
    void loadTransactions()
  }, [loadTransactions])

  const categories = useMemo(
    () => getCategoriesFromTransactions(transactions),
    [transactions],
  )

  const addTransaction = useCallback(
    async (payload) => {
      try {
        const response = await transactionsApi.create(payload, { storageKey })
        setTransactions(response.data.transactions)
        setApiError('')
        return { ok: true, transaction: response.data.transaction }
      } catch (error) {
        const message = getMockApiErrorMessage(error, 'Failed to add transaction.')
        setApiError(message)
        return { ok: false, error: message }
      }
    },
    [storageKey],
  )

  const updateTransaction = useCallback(
    async (transactionId, payload) => {
      try {
        const response = await transactionsApi.update(transactionId, payload, { storageKey })
        setTransactions(response.data.transactions)
        setApiError('')
        return { ok: true, transaction: response.data.transaction }
      } catch (error) {
        const message = getMockApiErrorMessage(error, 'Failed to update transaction.')
        setApiError(message)
        return { ok: false, error: message }
      }
    },
    [storageKey],
  )

  const removeTransaction = useCallback(
    async (transactionId) => {
      try {
        const response = await transactionsApi.remove(transactionId, { storageKey })
        setTransactions(response.data.transactions)
        setApiError('')
        return { ok: true }
      } catch (error) {
        const message = getMockApiErrorMessage(error, 'Failed to delete transaction.')
        setApiError(message)
        return { ok: false, error: message }
      }
    },
    [storageKey],
  )

  const replaceTransactions = useCallback(
    async (payloadTransactions) => {
      try {
        const response = await transactionsApi.replace(payloadTransactions, { storageKey })
        setTransactions(response.data.transactions)
        setApiError('')
        return { ok: true, importedCount: response.data.importedCount }
      } catch (error) {
        const message = getMockApiErrorMessage(error, 'Failed to import transactions.')
        setApiError(message)
        return { ok: false, error: message }
      }
    },
    [storageKey],
  )

  const resetData = useCallback(async () => {
    try {
      const response = await transactionsApi.reset({ storageKey })
      setTransactions(response.data.transactions)
      setApiError('')
      return { ok: true }
    } catch (error) {
      const message = getMockApiErrorMessage(error, 'Failed to reset transactions.')
      setApiError(message)
      return { ok: false, error: message }
    }
  }, [storageKey])

  return {
    transactions,
    isLoading,
    apiError,
    categories,
    addTransaction,
    updateTransaction,
    removeTransaction,
    replaceTransactions,
    resetData,
    retryLoad: loadTransactions,
    clearApiError: () => setApiError(''),
  }
}
