import { Badge } from '../ui/Badge'
import { formatCurrency } from '../../utils/formatters'

export const SpendingAlert = ({ spendingRatio, expenses, income, currency = 'USD' }) => {
  if (!income || spendingRatio < 0.8) return null

  const ratioPercent = Math.round(spendingRatio * 100)

  return (
    <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-amber-200">Spending Alert</p>
          <p className="mt-1 text-sm text-amber-100/90">
            You&apos;ve spent {ratioPercent}% of your current budget
            ({formatCurrency(expenses, currency)} of {formatCurrency(income, currency)}).
          </p>
        </div>
        <Badge tone="warning">{ratioPercent}% used</Badge>
      </div>
    </div>
  )
}
