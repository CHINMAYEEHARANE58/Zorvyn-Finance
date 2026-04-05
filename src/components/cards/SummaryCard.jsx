import { Badge } from '../ui/Badge'
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber'
import { formatCurrency } from '../../utils/formatters'
import { Card } from '../ui/Card'

export const SummaryCard = ({
  title,
  value,
  amount,
  currency = 'USD',
  tone = 'neutral',
  trendText = '0%',
}) => {
  const animatedAmount = useAnimatedNumber(Number.isFinite(amount) ? amount : 0, 320)
  const valueTone = {
    neutral: 'text-white',
    positive: 'text-emerald-300',
    negative: 'text-red-300',
  }

  const trendTone = trendText.startsWith('-')
    ? 'danger'
    : trendText === '0%'
      ? 'neutral'
      : 'success'
  const trendIndicator = trendText.startsWith('-') ? '↓' : trendText === '0%' ? '→' : '↑'
  const displayValue =
    Number.isFinite(amount) ? formatCurrency(animatedAmount, currency) : value

  return (
    <Card className="stat-card p-5">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">{title}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className={`text-3xl font-semibold tracking-tight ${valueTone[tone]}`}>{displayValue}</p>
        <Badge tone={trendTone}>
          {trendIndicator} {trendText}
        </Badge>
      </div>
    </Card>
  )
}
