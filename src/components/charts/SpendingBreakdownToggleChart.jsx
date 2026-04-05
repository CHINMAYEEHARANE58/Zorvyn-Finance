import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCompactCurrency, formatCurrency } from '../../utils/formatters'

const MotionChart = motion.div

const MODES = [
  { id: 'category', label: 'By Category' },
  { id: 'time', label: 'By Time' },
  { id: 'type', label: 'By Type' },
]

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-md border border-white/10 bg-slate-900/95 px-2.5 py-2 text-xs text-gray-200 shadow-lg">
      <p className="text-gray-400">{label}</p>
      <p className="mt-1 font-medium text-white">{formatCurrency(payload[0].value, currency)}</p>
    </div>
  )
}

export const SpendingBreakdownToggleChart = ({
  transactions,
  currency = 'USD',
}) => {
  const [mode, setMode] = useState('category')

  const chartData = useMemo(() => {
    if (!transactions.length) return []

    if (mode === 'type') {
      const totals = transactions.reduce(
        (accumulator, transaction) => {
          if (transaction.type === 'income') accumulator.income += transaction.amount
          else accumulator.expense += transaction.amount
          return accumulator
        },
        { income: 0, expense: 0 },
      )

      return [
        { label: 'Income', value: totals.income },
        { label: 'Expense', value: totals.expense },
      ]
    }

    if (mode === 'time') {
      const byDate = transactions.reduce((accumulator, transaction) => {
        const key = transaction.date
        accumulator[key] = (accumulator[key] || 0) + transaction.amount
        return accumulator
      }, {})

      return Object.entries(byDate)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .slice(-8)
        .map(([key, value]) => ({
          label: new Date(key).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value,
        }))
    }

    const byCategory = transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((accumulator, transaction) => {
        accumulator[transaction.category] =
          (accumulator[transaction.category] || 0) + transaction.amount
        return accumulator
      }, {})

    return Object.entries(byCategory)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [mode, transactions])

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1">
        {MODES.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setMode(option.id)}
            className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-200 ${
              mode === option.id
                ? 'bg-blue-500 text-white'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="h-64 w-full">
        <AnimatePresence mode="wait">
          <MotionChart
            key={mode}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%" minWidth={240} minHeight={220}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -10, bottom: 4 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  tickFormatter={(value) => formatCompactCurrency(value, currency)}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(148,163,184,0.08)' }}
                  content={<CustomTooltip currency={currency} />}
                />
                <Bar
                  dataKey="value"
                  radius={[6, 6, 0, 0]}
                  fill="#5b7cfa"
                  fillOpacity={0.85}
                  maxBarSize={34}
                  isAnimationActive
                  animationDuration={260}
                />
              </BarChart>
            </ResponsiveContainer>
          </MotionChart>
        </AnimatePresence>
      </div>
    </div>
  )
}
