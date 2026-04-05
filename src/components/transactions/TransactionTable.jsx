import { formatCurrency, formatDate } from '../../utils/formatters'
import { getCategoryTone } from '../../utils/presentation'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Tooltip } from '../ui/Tooltip'

const EditIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
)

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
)

const ActionButtons = ({ role, onEdit, onDelete, transaction }) => {
  const readOnlyTooltip = role === 'viewer' ? 'Switch to admin to edit' : null

  return (
    <div className="inline-flex gap-1">
      <Tooltip content={readOnlyTooltip}>
        <span>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit(transaction)}
            disabled={role === 'viewer'}
            aria-label="Edit transaction"
          >
            <EditIcon />
          </Button>
        </span>
      </Tooltip>
      <Tooltip content={readOnlyTooltip}>
        <span>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(transaction.id)}
            disabled={role === 'viewer'}
            aria-label="Delete transaction"
          >
            <DeleteIcon />
          </Button>
        </span>
      </Tooltip>
    </div>
  )
}

const MobileTransactionCard = ({ transaction, role, onEdit, onDelete, currency }) => (
  <article className="panel-surface p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
        <p className="mt-1 text-sm font-medium text-gray-100">{transaction.category}</p>
        {transaction.description ? (
          <p className="mt-1 text-xs text-gray-400">{transaction.description}</p>
        ) : null}
      </div>
      <p
        className={`text-sm font-semibold ${
          transaction.type === 'income' ? 'text-emerald-300' : 'text-red-300'
        }`}
      >
        {transaction.type === 'income' ? '+' : '-'}
        {formatCurrency(transaction.amount, currency)}
      </p>
    </div>

    <div className="mt-3 flex items-center justify-between gap-3">
      <div className="flex gap-2">
        <Badge tone={getCategoryTone(transaction.category)}>{transaction.category}</Badge>
        <Badge tone={transaction.type === 'income' ? 'success' : 'danger'}>
          {transaction.type}
        </Badge>
      </div>
      <ActionButtons role={role} onEdit={onEdit} onDelete={onDelete} transaction={transaction} />
    </div>
  </article>
)

export const TransactionTable = ({
  transactions,
  role,
  onEdit,
  onDelete,
  currency = 'USD',
}) => {
  if (transactions.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:hidden">
        {transactions.map((transaction) => (
          <MobileTransactionCard
            key={transaction.id}
            transaction={transaction}
            role={role}
            onEdit={onEdit}
            onDelete={onDelete}
            currency={currency}
          />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-white/10 md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white/[0.04] text-left text-[11px] uppercase tracking-[0.16em] text-gray-500">
              <tr>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5 text-right">Amount</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr
                  key={transaction.id}
                  className={`group border-t border-white/[0.06] transition-all duration-200 ease-in-out hover:bg-white/5 ${
                    index % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'
                  }`}
                >
                  <td className="px-5 py-5 text-gray-300">{formatDate(transaction.date)}</td>
                  <td className="px-5 py-5">
                    <Badge tone={getCategoryTone(transaction.category)}>
                      {transaction.category}
                    </Badge>
                  </td>
                  <td className="max-w-[220px] px-5 py-5 text-gray-400">
                    <span className="block truncate">
                      {transaction.description || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-5">
                    <Badge tone={transaction.type === 'income' ? 'success' : 'danger'}>
                      {transaction.type}
                    </Badge>
                  </td>
                  <td
                    className={`px-5 py-5 text-right text-base font-medium ${
                      transaction.type === 'income' ? 'text-emerald-300' : 'text-red-300'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount, currency)}
                  </td>
                  <td className="px-5 py-5 text-right">
                    <div className="inline-flex opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <ActionButtons
                        role={role}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        transaction={transaction}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
