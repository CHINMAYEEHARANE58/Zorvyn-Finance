import { useMemo } from 'react'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { EmptyState } from '../common/EmptyState'
import { Tooltip } from '../ui/Tooltip'

const EditIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-[18px] w-[18px]"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.1"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
)

const DeleteIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-[18px] w-[18px]"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.1"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
)

const toDate = (value) => {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

const getGroups = (transactions) => {
  const today = toDate(new Date())
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const grouped = {
    Today: [],
    Yesterday: [],
    Earlier: [],
  }

  transactions.forEach((transaction) => {
    const date = toDate(transaction.date)
    if (date.getTime() === today.getTime()) {
      grouped.Today.push(transaction)
      return
    }

    if (date.getTime() === yesterday.getTime()) {
      grouped.Yesterday.push(transaction)
      return
    }

    grouped.Earlier.push(transaction)
  })

  return grouped
}

const getCategoryClass = (type) => {
  return type === 'income'
    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-400/30'
    : 'bg-red-500/10 text-red-300 border-red-400/30'
}

const TimelineItem = ({ transaction, role, onEdit, onDelete, currency }) => {
  const disabledTooltip = role === 'viewer' ? 'Switch to admin to edit' : null
  const initials = (transaction.category || 'O').slice(0, 2).toUpperCase()
  const actionsClassName = 'mt-2 flex justify-end gap-2'

  return (
    <li className="group relative pl-12">
      <span className="timeline-connector-line absolute left-[14px] top-0 h-full w-px" />
      <span className="timeline-initial-badge absolute left-0 top-0 inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold">
        {initials}
      </span>

      <div className="rounded-xl border border-white/10 bg-white/5 p-3 transition-all duration-200 ease-in-out group-hover:bg-white/[0.08]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-white">{transaction.category}</p>
            <p className="mt-0.5 text-xs text-gray-500">{formatDate(transaction.date)}</p>
            <p className="mt-1 text-sm text-gray-400">{transaction.description || 'No note added'}</p>
          </div>

          <div className="text-right">
            <p
              className={`text-sm font-semibold ${
                transaction.type === 'income' ? 'text-emerald-300' : 'text-red-300'
              }`}
            >
              {transaction.type === 'income' ? '+' : '-'}
              {formatCurrency(transaction.amount, currency)}
            </p>
            <Badge className={`mt-2 border ${getCategoryClass(transaction.type)}`}>
              {transaction.type}
            </Badge>
          </div>
        </div>

        <div className={actionsClassName}>
          <Tooltip content={disabledTooltip}>
            <span>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 px-2.5 !border-white/25 !bg-white/12 !text-gray-100 hover:!bg-white/18 disabled:!opacity-90"
                onClick={() => onEdit(transaction)}
                disabled={role === 'viewer'}
                aria-label="Edit activity"
              >
                <EditIcon />
                <span className="text-[11px]">Edit</span>
              </Button>
            </span>
          </Tooltip>
          <Tooltip content={disabledTooltip}>
            <span>
              <Button
                size="sm"
                variant="danger"
                className="h-8 px-2.5 !border-red-400/45 !bg-red-500/16 !text-red-300 hover:!bg-red-500/26 disabled:!opacity-90"
                onClick={() => onDelete(transaction.id)}
                disabled={role === 'viewer'}
                aria-label="Delete activity"
              >
                <DeleteIcon />
                <span className="text-[11px]">Delete</span>
              </Button>
            </span>
          </Tooltip>
        </div>
      </div>
    </li>
  )
}

export const ActivityTimeline = ({
  transactions,
  role,
  currency = 'USD',
  categories,
  filters,
  isSearching,
  onFilterChange,
  onClearFilters,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const groupedTransactions = useMemo(
    () => getGroups(transactions.slice(0, 18)),
    [transactions],
  )

  return (
    <Card id="transactions" className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Recent Activity</p>
          <p className="mt-1 text-sm text-gray-400">Timeline view of your latest money movements</p>
        </div>

        {role === 'admin' ? (
          <Button size="sm" variant="primary" onClick={onAdd}>
            Add Transaction
          </Button>
        ) : (
          <Tooltip content="Switch to admin to edit">
            <span>
              <Button size="sm" variant="secondary" disabled>
                Add Transaction
              </Button>
            </span>
          </Tooltip>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
        <select
          value={filters.selectedType}
          onChange={(event) => onFilterChange('selectedType', event.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-gray-200 outline-none transition-all duration-200 ease-in-out focus:border-blue-400/70"
        >
          <option value="all">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          value={filters.selectedCategory}
          onChange={(event) => onFilterChange('selectedCategory', event.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-gray-200 outline-none transition-all duration-200 ease-in-out focus:border-blue-400/70"
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={filters.sortBy}
          onChange={(event) => onFilterChange('sortBy', event.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-gray-200 outline-none transition-all duration-200 ease-in-out focus:border-blue-400/70"
        >
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="amount-desc">Highest amount</option>
          <option value="amount-asc">Lowest amount</option>
        </select>

        <Button size="sm" variant="secondary" onClick={onClearFilters}>
          Clear filters
        </Button>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        {isSearching ? 'Searching transactions...' : `${transactions.length} transaction(s) shown`}
      </p>

      {transactions.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="No activity found"
            description="Try adjusting filters or add a new transaction."
            action={role === 'admin' ? onAdd : null}
            actionLabel="Add transaction"
          />
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {Object.entries(groupedTransactions).map(([label, items]) =>
            items.length ? (
              <section key={label}>
                <p className="mb-3 text-xs uppercase tracking-[0.14em] text-gray-500">{label}</p>
                <ul className="space-y-3">
                  {items.map((transaction) => (
                    <TimelineItem
                      key={transaction.id}
                      transaction={transaction}
                      role={role}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      currency={currency}
                    />
                  ))}
                </ul>
              </section>
            ) : null,
          )}
        </div>
      )}
    </Card>
  )
}
