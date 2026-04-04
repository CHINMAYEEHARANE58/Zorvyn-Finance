import { useMemo, useState } from 'react'
import { useFinance } from '../../context/useFinance'
import { DEFAULT_CATEGORIES } from '../../data/mockTransactions'
import { Button } from '../ui/Button'

const getToday = () => new Date().toISOString().slice(0, 10)

const CATEGORY_KEYWORDS = {
  Salary: ['salary', 'payroll', 'paycheck', 'bonus', 'stipend'],
  Freelance: ['freelance', 'client', 'project', 'contract'],
  Rent: ['rent', 'landlord', 'lease'],
  Groceries: ['grocery', 'supermarket', 'mart', 'vegetable'],
  Utilities: ['utility', 'electricity', 'water', 'internet', 'wifi', 'bill', 'gas'],
  Transport: ['uber', 'ola', 'taxi', 'metro', 'fuel', 'petrol', 'diesel', 'bus', 'train'],
  Insurance: ['insurance', 'policy', 'premium'],
  Dining: ['restaurant', 'food', 'dining', 'swiggy', 'zomato', 'cafe'],
  Shopping: ['shopping', 'amazon', 'flipkart', 'mall', 'purchase'],
  Healthcare: ['doctor', 'hospital', 'clinic', 'pharmacy', 'medicine'],
}

const getSuggestedCategory = (description, type) => {
  const text = String(description || '').trim().toLowerCase()
  if (!text) return ''

  const entries = Object.entries(CATEGORY_KEYWORDS)
    .filter(([category]) => (type === 'income' ? ['Salary', 'Freelance'].includes(category) : true))

  for (const [category, keywords] of entries) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return category
    }
  }

  return ''
}

export const TransactionForm = ({ onClose, presetType = 'expense' }) => {
  const { addTransaction, updateTransaction, editingTransaction, categories } = useFinance()

  const allCategories = useMemo(
    () => [...new Set([...DEFAULT_CATEGORIES, ...categories])],
    [categories],
  )

  const [formValues, setFormValues] = useState(() =>
    editingTransaction
      ? {
          date: editingTransaction.date,
          amount: String(editingTransaction.amount),
          description: editingTransaction.description || '',
          category: editingTransaction.category,
          type: editingTransaction.type,
        }
      : {
          date: getToday(),
          amount: '',
          description: '',
          category: DEFAULT_CATEGORIES[0],
          type: presetType,
        },
  )
  const [hasManualCategorySelection, setHasManualCategorySelection] = useState(
    Boolean(editingTransaction),
  )
  const suggestedCategory = useMemo(
    () => getSuggestedCategory(formValues.description, formValues.type),
    [formValues.description, formValues.type],
  )

  const handleChange = (key, value) => {
    setFormValues((previous) => {
      const next = { ...previous, [key]: value }

      if ((key === 'description' || key === 'type') && !hasManualCategorySelection) {
        const suggested = getSuggestedCategory(next.description, next.type)
        if (suggested) {
          next.category = suggested
        }
      }

      return next
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const payload = {
      date: formValues.date,
      amount: Number(formValues.amount),
      description: formValues.description.trim(),
      category: formValues.category.trim() || 'Other',
      type: formValues.type,
    }

    if (!payload.date || !payload.amount || payload.amount < 0) return

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, payload)
    } else {
      addTransaction(payload)
    }

    onClose()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-3 rounded-lg border border-white/10 bg-slate-900/60 p-4 lg:grid-cols-6"
    >
      <input
        type="date"
        value={formValues.date}
        onChange={(event) => handleChange('date', event.target.value)}
        className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-gray-200 outline-none transition-all duration-200 ease-in-out focus:border-sky-400/60"
      />

      <input
        type="number"
        min="0"
        placeholder="Amount"
        value={formValues.amount}
        onChange={(event) => handleChange('amount', event.target.value)}
        className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-gray-200 outline-none transition-all duration-200 ease-in-out focus:border-sky-400/60"
        required
      />

      <input
        type="text"
        placeholder="Description (optional)"
        value={formValues.description}
        onChange={(event) => {
          handleChange('description', event.target.value)
        }}
        className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-gray-200 outline-none transition-all duration-200 ease-in-out focus:border-sky-400/60"
      />

      <input
        type="text"
        list="category-options"
        placeholder="Category"
        value={formValues.category}
        onChange={(event) => {
          setHasManualCategorySelection(true)
          handleChange('category', event.target.value)
        }}
        className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-gray-200 outline-none transition-all duration-200 ease-in-out focus:border-sky-400/60"
        required
      />
      <datalist id="category-options">
        {allCategories.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>

      <select
        value={formValues.type}
        onChange={(event) => {
          const nextType = event.target.value
          setHasManualCategorySelection(false)
          setFormValues((previous) => {
            const next = { ...previous, type: nextType }
            const suggested = getSuggestedCategory(next.description, nextType)
            if (suggested) {
              next.category = suggested
            }
            return next
          })
        }}
        className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-gray-200 outline-none transition-all duration-200 ease-in-out focus:border-sky-400/60"
      >
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>

      <div className="flex gap-2">
        <Button type="submit" variant="primary" className="flex-1">
          {editingTransaction ? 'Update' : 'Add'}
        </Button>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>

      {suggestedCategory ? (
        <p className="text-xs text-gray-400 lg:col-span-6">
          Suggested category from description:{' '}
          <button
            type="button"
            className="font-medium text-sky-300 hover:text-sky-200"
            onClick={() => {
              setHasManualCategorySelection(false)
              handleChange('category', suggestedCategory)
            }}
          >
            {suggestedCategory}
          </button>
        </p>
      ) : null}
    </form>
  )
}
