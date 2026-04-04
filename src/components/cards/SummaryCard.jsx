import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'

export const SummaryCard = ({ title, value, tone = 'neutral', trendText = '0%' }) => {
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

  return (
    <Card className="p-4 hover:translate-y-1 hover:shadow-md">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-gray-400">{title}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className={`text-2xl font-semibold tracking-tight ${valueTone[tone]}`}>{value}</p>
        <Badge tone={trendTone}>{trendText}</Badge>
      </div>
    </Card>
  )
}
