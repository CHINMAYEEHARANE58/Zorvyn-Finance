import { useMemo } from 'react'
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber'
import { Card } from '../ui/Card'

const toneStyles = {
  Healthy: {
    text: 'text-emerald-300',
    ring: '#34d399',
  },
  Average: {
    text: 'text-amber-300',
    ring: '#f59e0b',
  },
  Risky: {
    text: 'text-red-300',
    ring: '#f87171',
  },
}

export const FinancialHealthScoreCard = ({ score = 0, label = 'Average' }) => {
  const animatedScore = useAnimatedNumber(score, 360)
  const roundedScore = Math.round(animatedScore)
  const safeScore = Math.max(0, Math.min(100, roundedScore))
  const styles = toneStyles[label] || toneStyles.Average

  const ringBackground = useMemo(
    () =>
      `conic-gradient(${styles.ring} ${safeScore * 3.6}deg, rgba(148,163,184,0.2) 0deg)`,
    [safeScore, styles.ring],
  )

  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-gray-400">Financial Health</p>
      <div className="mt-3 flex items-center gap-4">
        <div
          style={{ background: ringBackground }}
          className="relative grid h-16 w-16 place-items-center rounded-full"
        >
          <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-900/70 text-sm font-semibold text-white">
            {safeScore}
          </div>
        </div>

        <div>
          <p className={`text-xl font-semibold ${styles.text}`}>{label}</p>
          <p className="mt-1 text-sm text-gray-400">Score based on savings and spending discipline.</p>
        </div>
      </div>
    </Card>
  )
}

