import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { filterTransactionsByTimeRange } from '../../utils/finance'
import { formatCompactCurrency, formatCurrency } from '../../utils/formatters'
import { Card } from '../ui/Card'

const MotionPanel = motion.div

const RANGE_OPTIONS = [
  { id: 'week', label: 'Weekly' },
  { id: 'month', label: 'Monthly' },
  { id: 'year', label: 'Yearly' },
]

const toMonthKey = (dateString) => dateString.slice(0, 7)

const buildLineSeries = (transactions, range) => {
  const scoped = filterTransactionsByTimeRange(transactions, range)
  if (!scoped.length) return []

  if (range === 'year') {
    const map = scoped.reduce((accumulator, transaction) => {
      const key = toMonthKey(transaction.date)
      const value = accumulator.get(key) || 0
      accumulator.set(
        key,
        value + (transaction.type === 'income' ? transaction.amount : -transaction.amount),
      )
      return accumulator
    }, new Map())

    let running = 0
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        running += value
        return {
          label: new Date(`${key}-01`).toLocaleDateString('en-US', { month: 'short' }),
          balance: Math.round(running),
        }
      })
  }

  const map = scoped.reduce((accumulator, transaction) => {
    const key = transaction.date
    const value = accumulator.get(key) || 0
    accumulator.set(
      key,
      value + (transaction.type === 'income' ? transaction.amount : -transaction.amount),
    )
    return accumulator
  }, new Map())

  let running = 0
  return [...map.entries()]
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .slice(range === 'week' ? -7 : -12)
    .map(([key, value]) => {
      running += value
      return {
        label: new Date(key).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        balance: Math.round(running),
      }
    })
}

const buildBarSeries = (transactions, range) => {
  const scoped = filterTransactionsByTimeRange(transactions, range).filter(
    (transaction) => transaction.type === 'expense',
  )

  if (!scoped.length) return []

  const map = scoped.reduce((accumulator, transaction) => {
    accumulator[transaction.category] = (accumulator[transaction.category] || 0) + transaction.amount
    return accumulator
  }, {})

  return Object.entries(map)
    .map(([label, value]) => ({ label, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)
}

const TooltipContent = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-md border border-white/10 bg-slate-900/95 px-2.5 py-2 text-xs text-gray-200 shadow-lg">
      <p className="text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-white">
        {formatCurrency(payload[0].value, currency)}
      </p>
    </div>
  )
}

export const CleanChartsPanel = ({
  transactions,
  currency = 'USD',
  defaultRange = 'month',
}) => {
  const [range, setRange] = useState(defaultRange)

  const lineData = useMemo(
    () => buildLineSeries(transactions, range),
    [range, transactions],
  )

  const barData = useMemo(
    () => buildBarSeries(transactions, range),
    [range, transactions],
  )

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Analytics</p>
          <p className="mt-1 text-sm text-gray-400">Balance trend and spending categories</p>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setRange(option.id)}
                className={`rounded-md px-2.5 py-1 text-xs transition-all duration-200 ease-in-out ${
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

      <AnimatePresence mode="wait">
        <MotionPanel
          key={range}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.28, ease: 'easeInOut' }}
          className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2"
        >
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-gray-500">Balance Trend</p>
            <div className="mt-3 h-56 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={220}>
                <LineChart data={lineData} margin={{ top: 8, right: 10, left: -8, bottom: 4 }}>
                  <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.07)" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(value) => formatCompactCurrency(value, currency)}
                  />
                  <Tooltip
                    cursor={{ stroke: 'rgba(148,163,184,0.2)' }}
                    content={<TooltipContent currency={currency} />}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="#5b7cfa"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive
                    animationDuration={320}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-gray-500">Spending by Category</p>
            <div className="mt-3 h-56 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={220}>
                <BarChart data={barData} margin={{ top: 8, right: 8, left: -8, bottom: 4 }} barCategoryGap="26%">
                  <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.07)" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(value) => formatCompactCurrency(value, currency)}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(148,163,184,0.08)' }}
                    content={<TooltipContent currency={currency} />}
                  />
                  <Bar
                    dataKey="value"
                    radius={[6, 6, 0, 0]}
                    fill="#5b7cfa"
                    fillOpacity={0.84}
                    maxBarSize={30}
                    isAnimationActive
                    animationDuration={320}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </MotionPanel>
      </AnimatePresence>
    </Card>
  )
}
