import { useMemo } from 'react'
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber'
import { formatCurrency } from '../../utils/formatters'
import { Card } from '../ui/Card'

const ARC_RADIUS = 54
const ARC_LENGTH = Math.PI * ARC_RADIUS

export const BudgetProgressCard = ({ used = 0, budget = 0, currency = 'USD' }) => {
  const ratio = budget > 0 ? used / budget : 0
  const percentUsed = Math.max(0, Math.round(ratio * 100))
  const clampedPercent = Math.min(percentUsed, 100)
  const remaining = Math.max(0, budget - used)
  const animatedPercent = Math.round(useAnimatedNumber(clampedPercent, 280))

  const progressLength = useMemo(
    () => (animatedPercent / 100) * ARC_LENGTH,
    [animatedPercent],
  )

  const progressTone =
    percentUsed <= 70 ? 'text-emerald-300' : percentUsed <= 90 ? 'text-amber-300' : 'text-red-300'

  return (
    <Card id="budgeting" className="p-5">
      <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Budget Progress</p>
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="relative">
          <svg viewBox="0 0 140 80" className="h-40 w-full max-w-[220px]">
            <path
              d="M 16 70 A 54 54 0 0 1 124 70"
              fill="none"
              stroke="rgba(148,163,184,0.24)"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M 16 70 A 54 54 0 0 1 124 70"
              fill="none"
              stroke={percentUsed <= 90 ? '#34d399' : '#f87171'}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${progressLength} ${ARC_LENGTH}`}
              className="transition-all duration-300 ease-in-out"
            />
          </svg>
          <div className="pointer-events-none absolute inset-x-0 bottom-4 text-center">
            <p className={`text-3xl font-semibold tracking-tight ${progressTone}`}>
              {animatedPercent}%
            </p>
            <p className="mt-1 text-xs text-gray-500">Used</p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-300">
            Used: <span className="font-semibold text-white">{formatCurrency(used, currency)}</span>
          </p>
          <p className="text-sm text-gray-300">
            Remaining:{' '}
            <span className="font-semibold text-white">{formatCurrency(remaining, currency)}</span>
          </p>
          <p className="text-sm text-gray-400">
            {percentUsed <= 70
              ? 'Spending is controlled in the selected range.'
              : percentUsed <= 90
                ? 'You are close to your spending threshold.'
                : 'You crossed your budget threshold. Review major expenses.'}
          </p>
        </div>
      </div>
    </Card>
  )
}
