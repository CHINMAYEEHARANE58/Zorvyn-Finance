import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { formatCurrency } from '../../utils/formatters'
import { Card } from '../ui/Card'

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MotionPanel = motion.div

const toDateKey = (value) => String(value).slice(0, 10)
const toLocalDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const MiniCalendarView = ({ transactions, currency = 'USD' }) => {
  const latestDate = useMemo(() => {
    if (!transactions.length) return new Date()
    return new Date([...transactions].sort((a, b) => new Date(b.date) - new Date(a.date))[0].date)
  }, [transactions])

  const [monthOffset, setMonthOffset] = useState(0)
  const [selectedDateKey, setSelectedDateKey] = useState('')

  const monthDate = useMemo(
    () => new Date(latestDate.getFullYear(), latestDate.getMonth() + monthOffset, 1),
    [latestDate, monthOffset],
  )

  const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getDay()
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()

  const transactionsByDay = useMemo(() => {
    return transactions.reduce((accumulator, transaction) => {
      const key = toDateKey(transaction.date)
      if (!accumulator[key]) accumulator[key] = []
      accumulator[key].push(transaction)
      return accumulator
    }, {})
  }, [transactions])

  const selectedDayTransactions = selectedDateKey ? transactionsByDay[selectedDateKey] || [] : []

  const cells = useMemo(() => {
    const items = []

    for (let index = 0; index < firstDay; index += 1) {
      items.push({ day: null, key: `blank-${index}` })
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateKey = toLocalDateKey(new Date(monthDate.getFullYear(), monthDate.getMonth(), day))
      items.push({
        day,
        key: dateKey,
        dateKey,
        count: transactionsByDay[dateKey]?.length || 0,
      })
    }

    return items
  }, [daysInMonth, firstDay, monthDate, transactionsByDay])

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Calendar</p>
          <p className="mt-1 text-sm font-medium text-gray-300">{monthLabel}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMonthOffset((previous) => previous - 1)}
            className="rounded-md border border-white/10 px-2 py-1 text-xs text-gray-300 transition-all duration-200 ease-in-out hover:bg-white/10"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setMonthOffset((previous) => previous + 1)}
            className="rounded-md border border-white/10 px-2 py-1 text-xs text-gray-300 transition-all duration-200 ease-in-out hover:bg-white/10"
          >
            Next
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-gray-500">
        {WEEK_DAYS.map((dayName) => (
          <p key={dayName} className="py-1">
            {dayName}
          </p>
        ))}

        {cells.map((cell) =>
          cell.day ? (
            <button
              key={cell.key}
              type="button"
              onClick={() => setSelectedDateKey(cell.dateKey)}
              className={`relative rounded-md border px-1 py-2 text-xs transition-all duration-200 ${
                selectedDateKey === cell.dateKey
                  ? 'border-blue-400/60 bg-blue-500/10 text-blue-200'
                  : 'border-transparent bg-white/5 text-gray-300 hover:bg-white/[0.08]'
              }`}
            >
              {cell.day}
              {cell.count > 0 ? (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-blue-300" />
              ) : null}
            </button>
          ) : (
            <div key={cell.key} className="h-8" />
          ),
        )}
      </div>

      <AnimatePresence mode="wait">
        {selectedDateKey ? (
          <MotionPanel
            key={selectedDateKey}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-gray-500">{selectedDateKey}</p>
            {selectedDayTransactions.length ? (
              <ul className="mt-2 space-y-2">
                {selectedDayTransactions.slice(0, 4).map((transaction) => (
                  <li key={transaction.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-gray-300">{transaction.category}</span>
                    <span className={transaction.type === 'income' ? 'text-emerald-300' : 'text-red-300'}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount, currency)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-gray-400">No transactions on this day.</p>
            )}
          </MotionPanel>
        ) : null}
      </AnimatePresence>
    </Card>
  )
}
