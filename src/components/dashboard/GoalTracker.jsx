import { useState } from 'react'
import { convertCurrency } from '../../utils/currency'
import { formatCurrency } from '../../utils/formatters'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber'

const getStorageKey = (userId) => `zorvyn.goal.${userId}`

const readGoalUsd = (userId) => {
  try {
    const raw = window.localStorage.getItem(getStorageKey(userId))
    const parsed = raw ? JSON.parse(raw) : null
    return Number(parsed?.goalUsd || parsed) > 0 ? Number(parsed?.goalUsd || parsed) : 10000
  } catch {
    return 10000
  }
}

export const GoalTracker = ({ userId, currentSavings, currency = 'USD' }) => {
  const [goalUsd, setGoalUsd] = useState(() => readGoalUsd(userId))
  const [draftGoalDisplay, setDraftGoalDisplay] = useState(() =>
    String(Math.round(convertCurrency(goalUsd, 'USD', currency))),
  )
  const [statusMessage, setStatusMessage] = useState('')

  const progress = goalUsd > 0 ? Math.min(100, Math.round((currentSavings / goalUsd) * 100)) : 0
  const animatedProgress = Math.round(useAnimatedNumber(progress, 280))

  const saveGoal = () => {
    const parsedDisplay = Number(draftGoalDisplay)

    if (!parsedDisplay || parsedDisplay <= 0) {
      setStatusMessage('Please enter a valid goal amount.')
      return
    }

    const nextGoalUsd = convertCurrency(parsedDisplay, currency, 'USD')
    setGoalUsd(nextGoalUsd)
    window.localStorage.setItem(getStorageKey(userId), JSON.stringify({ goalUsd: nextGoalUsd }))
    setStatusMessage('Goal updated.')
  }

  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-gray-400">Savings Goal</p>

      <div className="space-y-3">
        <p className="text-sm text-gray-300">
          {formatCurrency(currentSavings, currency)} / {formatCurrency(goalUsd, currency)} goal reached
        </p>

        <div className="h-2 rounded-full bg-white/10">
          <div
            style={{ width: `${animatedProgress}%` }}
            className="h-2 rounded-full bg-emerald-400 transition-all duration-300 ease-in-out"
          />
        </div>

        <p className="text-sm text-gray-300">
          You&apos;re <span className="font-semibold text-white">{animatedProgress}%</span> there.
        </p>

        <div className="flex flex-wrap gap-2">
          <input
            type="number"
            min="1"
            value={draftGoalDisplay}
            onChange={(event) => setDraftGoalDisplay(event.target.value)}
            className="w-40 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-gray-200 outline-none transition-all duration-200 ease-in-out focus:border-sky-400/60"
            placeholder="Set goal"
          />
          <Button size="sm" variant="primary" onClick={saveGoal}>
            Save Goal
          </Button>
        </div>

        {statusMessage ? <p className="text-xs text-gray-400">{statusMessage}</p> : null}
      </div>
    </Card>
  )
}
