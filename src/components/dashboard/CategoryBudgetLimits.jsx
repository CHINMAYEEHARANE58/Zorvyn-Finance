import { useMemo, useState } from 'react'
import { convertCurrency } from '../../utils/currency'
import { formatCurrency } from '../../utils/formatters'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'

const getBudgetKey = (userId) => `zorvyn.categoryBudgets.${userId}`

const readBudgets = (userId) => {
  try {
    const rawValue = window.localStorage.getItem(getBudgetKey(userId))
    const parsed = rawValue ? JSON.parse(rawValue) : {}
    return typeof parsed === 'object' && parsed ? parsed : {}
  } catch {
    return {}
  }
}

const getLimitTone = (ratio) => {
  if (ratio >= 1) return 'bg-red-400'
  if (ratio >= 0.8) return 'bg-amber-400'
  return 'bg-emerald-400'
}

export const CategoryBudgetLimits = ({
  userId,
  transactions,
  categories,
  currency = 'USD',
}) => {
  const availableCategories = useMemo(() => {
    if (categories?.length) return categories
    const fromTransactions = [
      ...new Set(transactions.filter((transaction) => transaction.type === 'expense').map((transaction) => transaction.category)),
    ]
    return fromTransactions.length ? fromTransactions : ['Other']
  }, [categories, transactions])

  const [budgetsUsd, setBudgetsUsd] = useState(() => readBudgets(userId))
  const [category, setCategory] = useState(availableCategories[0] || 'Other')
  const [budgetInput, setBudgetInput] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  const expensesByCategory = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((accumulator, transaction) => {
        accumulator[transaction.category] =
          (accumulator[transaction.category] || 0) + transaction.amount
        return accumulator
      }, {})
  }, [transactions])

  const savedBudgetEntries = useMemo(() => {
    return Object.entries(budgetsUsd)
      .map(([budgetCategory, budgetValue]) => {
        const spent = expensesByCategory[budgetCategory] || 0
        const ratio = budgetValue > 0 ? spent / budgetValue : 0
        return {
          category: budgetCategory,
          budget: Number(budgetValue),
          spent,
          ratio,
        }
      })
      .sort((a, b) => b.ratio - a.ratio)
  }, [budgetsUsd, expensesByCategory])

  const persistBudgets = (nextBudgets) => {
    setBudgetsUsd(nextBudgets)
    window.localStorage.setItem(getBudgetKey(userId), JSON.stringify(nextBudgets))
  }

  const saveBudget = () => {
    const parsedInput = Number(budgetInput)

    if (!category || !parsedInput || parsedInput <= 0) {
      setStatusMessage('Enter a valid budget amount.')
      return
    }

    const amountUsd = convertCurrency(parsedInput, currency, 'USD')
    const nextBudgets = {
      ...budgetsUsd,
      [category]: amountUsd,
    }

    persistBudgets(nextBudgets)
    setBudgetInput('')
    setStatusMessage(`Saved budget for ${category}.`)
  }

  const removeBudget = (budgetCategory) => {
    const nextBudgets = { ...budgetsUsd }
    delete nextBudgets[budgetCategory]
    persistBudgets(nextBudgets)
    setStatusMessage(`Removed budget for ${budgetCategory}.`)
  }

  return (
    <Card className="p-4">
      <SectionHeader
        title="Category Budget Limits"
        subtitle="Set limits and monitor usage by category"
      />

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none transition-all duration-200 ease-in-out focus:border-blue-400/60"
        >
          {availableCategories.map((categoryName) => (
            <option key={categoryName} value={categoryName}>
              {categoryName}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="1"
          value={budgetInput}
          onChange={(event) => setBudgetInput(event.target.value)}
          className="w-32 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none transition-all duration-200 ease-in-out focus:border-blue-400/60"
          placeholder="Budget"
        />

        <Button size="sm" variant="secondary" onClick={saveBudget}>
          Save
        </Button>
      </div>

      {statusMessage ? <p className="mt-2 text-xs text-gray-500">{statusMessage}</p> : null}

      <div className="mt-4 space-y-3">
        {savedBudgetEntries.length ? (
          savedBudgetEntries.map((entry) => {
            const progressPercent = Math.min(100, Math.round(entry.ratio * 100))
            const toneClass = getLimitTone(entry.ratio)
            const statusText =
              entry.ratio >= 1
                ? 'Budget exceeded'
                : entry.ratio >= 0.8
                  ? 'Near limit'
                  : 'Within limit'

            return (
              <div key={entry.category} className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{entry.category}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {formatCurrency(entry.spent, currency)} / {formatCurrency(entry.budget, currency)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{statusText}</span>
                    <button
                      type="button"
                      onClick={() => removeBudget(entry.category)}
                      className="text-xs text-gray-500 transition-colors hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="mt-2 h-2 rounded-full bg-white/10">
                  <div
                    style={{ width: `${progressPercent}%` }}
                    className={`h-2 rounded-full transition-all duration-300 ${toneClass}`}
                  />
                </div>
              </div>
            )
          })
        ) : (
          <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-400">
            No category budgets set yet.
          </p>
        )}
      </div>
    </Card>
  )
}
