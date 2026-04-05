import { DEFAULT_CATEGORIES, MOCK_TRANSACTIONS } from '../data/mockTransactions'
import { MockApiError, mockApiRequest } from './mockApiClient'

export const TRANSACTIONS_ROUTES = {
  list: '/api/transactions',
  create: '/api/transactions',
  update: '/api/transactions/:id',
  remove: '/api/transactions/:id',
  replace: '/api/transactions/import',
  reset: '/api/transactions/reset',
}

const clone = (value) => JSON.parse(JSON.stringify(value))

const sanitizeTransaction = (transaction, index = 0) => {
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

const deriveCategories = (transactions) => {
  const dynamic = transactions.map((transaction) => transaction.category)
  return [...new Set([...DEFAULT_CATEGORIES, ...dynamic])]
}

const readTransactionsStore = (storageKey) => {
  try {
    const raw = window.localStorage.getItem(storageKey)
    const parsed = raw ? JSON.parse(raw) : null

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((transaction, index) => sanitizeTransaction(transaction, index)).filter(Boolean)
    }
  } catch {
    // noop
  }

  const fallback = clone(MOCK_TRANSACTIONS)
  window.localStorage.setItem(storageKey, JSON.stringify(fallback))
  return fallback
}

const writeTransactionsStore = (storageKey, transactions) => {
  window.localStorage.setItem(storageKey, JSON.stringify(transactions))
}

const buildPayload = (transactions, extra = {}) => ({
  transactions,
  categories: deriveCategories(transactions),
  count: transactions.length,
  ...extra,
})

const generateId = () => `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`

export const transactionsApi = {
  async list({ storageKey }) {
    return mockApiRequest(() => {
      const transactions = readTransactionsStore(storageKey)
      return buildPayload(transactions)
    })
  },

  async create(payload, { storageKey }) {
    return mockApiRequest(() => {
      const current = readTransactionsStore(storageKey)
      const nextTransaction = sanitizeTransaction({ id: generateId(), ...payload })

      if (!nextTransaction) {
        throw new MockApiError('Invalid transaction payload. Please check form values.', {
          status: 400,
          code: 'INVALID_PAYLOAD',
        })
      }

      const transactions = [...current, nextTransaction]
      writeTransactionsStore(storageKey, transactions)

      return buildPayload(transactions, { transaction: nextTransaction })
    })
  },

  async update(transactionId, payload, { storageKey }) {
    return mockApiRequest(() => {
      const current = readTransactionsStore(storageKey)
      const index = current.findIndex((transaction) => transaction.id === transactionId)

      if (index === -1) {
        throw new MockApiError('Transaction not found.', {
          status: 404,
          code: 'NOT_FOUND',
        })
      }

      const nextTransaction = sanitizeTransaction({
        ...current[index],
        ...payload,
        id: transactionId,
      })

      if (!nextTransaction) {
        throw new MockApiError('Invalid transaction payload. Please check form values.', {
          status: 400,
          code: 'INVALID_PAYLOAD',
        })
      }

      const transactions = [...current]
      transactions[index] = nextTransaction
      writeTransactionsStore(storageKey, transactions)

      return buildPayload(transactions, { transaction: nextTransaction })
    })
  },

  async remove(transactionId, { storageKey }) {
    return mockApiRequest(() => {
      const current = readTransactionsStore(storageKey)
      const exists = current.some((transaction) => transaction.id === transactionId)

      if (!exists) {
        throw new MockApiError('Transaction not found.', {
          status: 404,
          code: 'NOT_FOUND',
        })
      }

      const transactions = current.filter((transaction) => transaction.id !== transactionId)
      writeTransactionsStore(storageKey, transactions)

      return buildPayload(transactions)
    })
  },

  async replace(payloadTransactions, { storageKey }) {
    return mockApiRequest(() => {
      if (!Array.isArray(payloadTransactions)) {
        throw new MockApiError('Invalid JSON format. Expected an array of transactions.', {
          status: 400,
          code: 'INVALID_IMPORT',
        })
      }

      const transactions = payloadTransactions
        .map((transaction, index) => sanitizeTransaction(transaction, index))
        .filter(Boolean)

      if (!transactions.length) {
        throw new MockApiError('No valid transactions found in imported file.', {
          status: 400,
          code: 'EMPTY_IMPORT',
        })
      }

      writeTransactionsStore(storageKey, transactions)

      return buildPayload(transactions, { importedCount: transactions.length })
    })
  },

  async reset({ storageKey }) {
    return mockApiRequest(() => {
      const transactions = clone(MOCK_TRANSACTIONS)
      writeTransactionsStore(storageKey, transactions)
      return buildPayload(transactions)
    })
  },
}
