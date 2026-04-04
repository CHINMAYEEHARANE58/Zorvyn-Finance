import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'

export const SpendingHealthIndicator = ({ spendingHealth, ratio }) => {
  const progress = Math.min(100, Math.max(0, Math.round(ratio * 100)))

  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-gray-400">Spending Health</p>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xl font-semibold text-white">{spendingHealth.status}</p>
        <Badge tone={spendingHealth.tone}>{progress}%</Badge>
      </div>
      <div className="mt-3 h-2 rounded-full bg-white/10">
        <div
          style={{ width: `${progress}%` }}
          className={`h-2 rounded-full ${
            spendingHealth.tone === 'success'
              ? 'bg-emerald-400'
              : spendingHealth.tone === 'warning'
                ? 'bg-amber-400'
                : 'bg-red-400'
          }`}
        />
      </div>
    </Card>
  )
}
