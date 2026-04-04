import { formatCurrency } from '../../utils/formatters'
import { Badge } from '../ui/Badge'

const InsightLine = ({ text }) => (
  <div className="rounded-lg border border-white/10 bg-slate-900/55 px-3 py-2.5 text-sm text-gray-300">
    {text}
  </div>
)

export const InsightsPanel = ({
  insights,
  currency = 'USD',
  conciseInsights = [],
}) => {
  const fallbackInsights = [
    `Highest spending category: ${insights.highestCategory?.category || 'N/A'}.`,
    `Expenses are ${Math.round(insights.spendingRatio * 100)}% of income.`,
    `Savings trend: ${insights.savingsTrend === 'up' ? 'Improving' : insights.savingsTrend === 'down' ? 'Declining' : 'Stable'}.`,
  ]

  const lines = (conciseInsights.length ? conciseInsights : fallbackInsights).slice(0, 3)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={insights.spendingHealth.tone}>
          Spending Health: {insights.spendingHealth.status}
        </Badge>
        <Badge
          tone={
            insights.savingsTrend === 'up'
              ? 'success'
              : insights.savingsTrend === 'down'
                ? 'danger'
                : 'neutral'
          }
        >
          Savings {insights.savingsTrend === 'up' ? 'Improving' : insights.savingsTrend === 'down' ? 'Declining' : 'Stable'}
        </Badge>
      </div>

      <div className="grid gap-2">
        {lines.map((line) => (
          <InsightLine key={line} text={line} />
        ))}
      </div>

      <p className="text-sm text-gray-400">
        Average expense per transaction:{' '}
        <span className="text-gray-100">{formatCurrency(insights.averageExpense, currency)}</span>
      </p>
    </div>
  )
}

