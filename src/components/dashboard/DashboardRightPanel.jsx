import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber'
import { formatCurrency } from '../../utils/formatters'
import { MiniCalendarView } from './MiniCalendarView'
import { Card } from '../ui/Card'

const MotionSlide = motion.div

const RANGE_OPTIONS = [
  { id: 'week', label: 'Weekly' },
  { id: 'month', label: 'Monthly' },
  { id: 'year', label: 'Yearly' },
]

const CAROUSEL_INTERVAL = 3600

const readGoalUsd = (userId) => {
  try {
    const raw = window.localStorage.getItem(`zorvyn.goal.${userId}`)
    const parsed = raw ? JSON.parse(raw) : null
    const value = Number(parsed?.goalUsd || parsed)
    return value > 0 ? value : 10000
  } catch {
    return 10000
  }
}

const buildWeekData = (transactions) => {
  if (!transactions.length) return []

  const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date))
  const latestDate = new Date(sorted[sorted.length - 1].date)
  latestDate.setHours(0, 0, 0, 0)

  const map = new Map()
  for (let index = 6; index >= 0; index -= 1) {
    const pointDate = new Date(latestDate)
    pointDate.setDate(latestDate.getDate() - index)
    map.set(pointDate.toISOString().slice(0, 10), 0)
  }

  transactions.forEach((transaction) => {
    const key = transaction.date
    if (!map.has(key)) return
    const current = map.get(key) || 0
    map.set(
      key,
      current + (transaction.type === 'income' ? transaction.amount : -transaction.amount),
    )
  })

  return [...map.entries()].map(([dateKey, value]) => ({
    label: new Date(dateKey).toLocaleDateString('en-US', { weekday: 'short' }),
    value: Math.round(value),
  }))
}

const buildMonthData = (transactions) => {
  const map = transactions.reduce((accumulator, transaction) => {
    const key = transaction.date.slice(0, 7)
    const current = accumulator.get(key) || 0
    accumulator.set(
      key,
      current + (transaction.type === 'income' ? transaction.amount : -transaction.amount),
    )
    return accumulator
  }, new Map())

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, value]) => ({
      label: new Date(`${key}-01`).toLocaleDateString('en-US', { month: 'short' }),
      value: Math.round(value),
    }))
}

const buildYearData = (transactions) => {
  const map = transactions.reduce((accumulator, transaction) => {
    const key = transaction.date.slice(0, 4)
    const current = accumulator.get(key) || 0
    accumulator.set(
      key,
      current + (transaction.type === 'income' ? transaction.amount : -transaction.amount),
    )
    return accumulator
  }, new Map())

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-4)
    .map(([key, value]) => ({ label: key, value: Math.round(value) }))
}

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-white/10 bg-slate-900/95 px-2.5 py-2 text-xs text-gray-200 shadow-lg">
      <p className="text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">
        {formatCurrency(payload[0].value, currency)}
      </p>
    </div>
  )
}

const ActionIcon = ({ variant = 'plus' }) => {
  if (variant === 'arrow') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="m7 17 10-10" />
        <path d="M9 7h8v8" />
      </svg>
    )
  }

  if (variant === 'wallet') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M16 12h.01" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

const QuickActionTile = ({ label, onClick, icon }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs text-gray-300 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-white/[0.08] hover:text-white active:scale-95"
  >
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-slate-800 text-gray-200">
      <ActionIcon variant={icon} />
    </span>
    {label}
  </button>
)

const CarouselDots = ({ count, activeIndex, onSelect }) => (
  <div className="mt-3 flex justify-center gap-1.5">
    {Array.from({ length: count }).map((_, index) => (
      <button
        key={`dot-${index + 1}`}
        type="button"
        onClick={() => onSelect(index)}
        className={`h-2 rounded-full transition-all duration-200 ease-in-out ${
          activeIndex === index ? 'w-5 bg-blue-400' : 'w-2 bg-white/20 hover:bg-white/35'
        }`}
        aria-label={`Go to slide ${index + 1}`}
      />
    ))}
  </div>
)

export const DashboardRightPanel = ({
  userId,
  transactions,
  summary,
  insights,
  currency = 'USD',
  onTransfer,
  onTopUp,
  onSave,
}) => {
  const [range, setRange] = useState('week')
  const [activeSlide, setActiveSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const goalUsd = useMemo(() => readGoalUsd(userId || 'guest'), [userId])
  const goalPercentRaw = goalUsd > 0 ? Math.min(100, (summary.totalBalance / goalUsd) * 100) : 0
  const goalPercent = Math.round(useAnimatedNumber(goalPercentRaw, 300))

  const chartData = useMemo(() => {
    if (range === 'year') return buildYearData(transactions)
    if (range === 'month') return buildMonthData(transactions)
    return buildWeekData(transactions)
  }, [range, transactions])

  const slides = useMemo(
    () => [
      {
        id: 'card',
        content: (
          <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">Primary Card</p>
            <p className="mt-5 text-base font-semibold tracking-[0.18em] text-white">
              4532 2231 9901 7784
            </p>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-gray-500">Holder</p>
                <p className="mt-1 text-sm text-gray-200">Zorvyn Member</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-gray-500">Expiry</p>
                <p className="mt-1 text-sm text-gray-200">10/29</p>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'weekly',
        content: (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Weekly Summary</p>
            <ul className="mt-3 space-y-2">
              {(insights?.weeklySummary || ['Weekly data is not available yet.'])
                .slice(0, 3)
                .map((line) => (
                  <li key={line} className="text-sm text-gray-300">
                    {line}
                  </li>
                ))}
            </ul>
          </div>
        ),
      },
      {
        id: 'goal',
        content: (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Savings Goal</p>
            <p className="mt-3 text-sm text-gray-300">
              {formatCurrency(summary.totalBalance, currency)} / {formatCurrency(goalUsd, currency)}
            </p>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div
                style={{ width: `${goalPercent}%` }}
                className="h-2 rounded-full bg-emerald-400 transition-all duration-300 ease-in-out"
              />
            </div>
            <p className="mt-2 text-sm text-gray-300">{goalPercent}% reached</p>
          </div>
        ),
      },
    ],
    [currency, goalPercent, goalUsd, insights?.weeklySummary, summary.totalBalance],
  )

  useEffect(() => {
    if (isPaused) return undefined
    const timer = window.setInterval(() => {
      setActiveSlide((previous) => (previous + 1) % slides.length)
    }, CAROUSEL_INTERVAL)

    return () => window.clearInterval(timer)
  }, [isPaused, slides.length])

  const onDragEnd = (_, info) => {
    if (info.offset.x <= -40) {
      setActiveSlide((previous) => (previous + 1) % slides.length)
      return
    }

    if (info.offset.x >= 40) {
      setActiveSlide((previous) => (previous - 1 + slides.length) % slides.length)
    }
  }

  return (
    <div id="reports" className="space-y-4">
      <Card className="p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Quick Actions</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <QuickActionTile label="Transfer" onClick={onTransfer} icon="arrow" />
          <QuickActionTile label="Top Up" onClick={onTopUp} icon="plus" />
          <QuickActionTile label="Save" onClick={onSave} icon="wallet" />
        </div>
      </Card>

      <Card id="wallets" className="p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Highlights</p>
        <div
          className="mt-3 overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait">
            <MotionSlide
              key={slides[activeSlide].id}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.24}
              onDragEnd={onDragEnd}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {slides[activeSlide].content}
            </MotionSlide>
          </AnimatePresence>
          <CarouselDots count={slides.length} activeIndex={activeSlide} onSelect={setActiveSlide} />
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Mini Flow Chart</p>
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setRange(option.id)}
                className={`rounded-md px-2 py-1 text-[11px] transition-all duration-200 ease-in-out ${
                  range === option.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:bg-white/10 hover:text-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 h-40 w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={220}>
            <AreaChart data={chartData} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="miniFlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5b7cfa" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="#5b7cfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />
              <Tooltip
                cursor={{ stroke: 'rgba(148,163,184,0.2)' }}
                content={<CustomTooltip currency={currency} />}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#5b7cfa"
                strokeWidth={2}
                fill="url(#miniFlow)"
                isAnimationActive
                animationDuration={300}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <MiniCalendarView transactions={transactions} currency={currency} />
    </div>
  )
}
