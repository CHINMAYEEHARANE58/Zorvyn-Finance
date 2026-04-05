import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber'
import { buildMonthlyStats } from '../../utils/finance'
import { formatCompactCurrency, formatCurrency } from '../../utils/formatters'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'

const SCENARIO_STORAGE_KEY = 'zorvyn.simulator.scenarios'
const SCENARIO_COLORS = ['#38bdf8', '#34d399', '#a78bfa']

const readSavedScenarios = () => {
  try {
    const rawValue = window.localStorage.getItem(SCENARIO_STORAGE_KEY)
    const parsed = rawValue ? JSON.parse(rawValue) : []
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((scenario) => scenario?.category && Number(scenario?.reductionPercent) >= 0)
      .slice(0, 3)
  } catch {
    return []
  }
}

const getSimulatorMessage = ({ selectedCategory, reductionPercent, impactRank, savingsGain }) => {
  if (reductionPercent === 0) {
    return 'Move the slider to preview potential savings without changing your real data.'
  }

  if (impactRank === 1) {
    return `Cutting ${selectedCategory} has the biggest impact in your current plan.`
  }

  if (reductionPercent >= 25) {
    return `A ${reductionPercent}% reduction in ${selectedCategory} could materially improve your savings.`
  }

  if (savingsGain > 0) {
    return `Reducing ${selectedCategory} slightly can steadily improve your monthly cushion.`
  }

  return 'No simulated impact yet for this category in the selected range.'
}

export const WhatIfSimulator = ({
  transactions,
  allTransactions = transactions,
  summary,
  timeRange,
  currency = 'USD',
}) => {
  const expenseByCategory = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((accumulator, transaction) => {
        accumulator[transaction.category] =
          (accumulator[transaction.category] || 0) + transaction.amount
        return accumulator
      }, {})
  }, [transactions])

  const categories = useMemo(
    () => Object.keys(expenseByCategory).sort((a, b) => expenseByCategory[b] - expenseByCategory[a]),
    [expenseByCategory],
  )

  const [selectedCategory, setSelectedCategory] = useState('')
  const [reductionPercent, setReductionPercent] = useState(20)
  const [savedScenarios, setSavedScenarios] = useState(readSavedScenarios)
  const effectiveCategory =
    selectedCategory && categories.includes(selectedCategory)
      ? selectedCategory
      : categories[0] || ''

  useEffect(() => {
    window.localStorage.setItem(SCENARIO_STORAGE_KEY, JSON.stringify(savedScenarios))
  }, [savedScenarios])

  const simulation = useMemo(() => {
    if (!effectiveCategory || !expenseByCategory[effectiveCategory]) {
      return {
        currentExpenses: summary.totalExpenses,
        newExpenses: summary.totalExpenses,
        currentSavings: summary.totalBalance,
        newSavings: summary.totalBalance,
        savingsGain: 0,
        savingsGainPercent: 0,
        impactRank: null,
      }
    }

    const categorySpend = expenseByCategory[effectiveCategory]
    const savingsGain = Math.round((categorySpend * reductionPercent) / 100)
    const newExpenses = summary.totalExpenses - savingsGain
    const newSavings = summary.totalIncome - newExpenses
    const baseSavings = summary.totalBalance

    const savingsGainPercent =
      baseSavings === 0
        ? savingsGain > 0
          ? 100
          : 0
        : Math.round((savingsGain / Math.abs(baseSavings)) * 100)

    const sortedCategories = [...categories]
    const impactRank = sortedCategories.indexOf(effectiveCategory) + 1

    return {
      currentExpenses: summary.totalExpenses,
      newExpenses,
      currentSavings: baseSavings,
      newSavings,
      savingsGain,
      savingsGainPercent,
      impactRank,
    }
  }, [effectiveCategory, reductionPercent, expenseByCategory, summary, categories])

  const animatedExpenses = useAnimatedNumber(simulation.newExpenses)
  const animatedSavings = useAnimatedNumber(simulation.newSavings)
  const animatedGain = useAnimatedNumber(simulation.savingsGain)

  const insightMessage = getSimulatorMessage({
    selectedCategory: effectiveCategory,
    reductionPercent,
    impactRank: simulation.impactRank,
    savingsGain: simulation.savingsGain,
  })

  const timeLabel = timeRange === 'week' ? 'week' : timeRange === 'year' ? 'year' : 'month'
  const simulationKey = `${effectiveCategory}-${reductionPercent}-${simulation.savingsGain}`
  const activeScenarios = useMemo(() => {
    if (savedScenarios.length) {
      return savedScenarios.slice(0, 3)
    }

    if (!effectiveCategory) return []
    return [
      {
        id: 'live-scenario',
        category: effectiveCategory,
        reductionPercent,
      },
    ]
  }, [effectiveCategory, reductionPercent, savedScenarios])

  const comparisonData = useMemo(() => {
    const months = buildMonthlyStats(allTransactions).slice(-3)
    if (!months.length || !activeScenarios.length) return []

    const expenseLookup = allTransactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((accumulator, transaction) => {
        const monthKey = transaction.date.slice(0, 7)
        if (!accumulator[monthKey]) accumulator[monthKey] = {}
        accumulator[monthKey][transaction.category] =
          (accumulator[monthKey][transaction.category] || 0) + transaction.amount
        return accumulator
      }, {})

    return months.map((month) => {
      const row = {
        month: month.month,
        baseline: month.savings,
      }

      activeScenarios.forEach((scenario, index) => {
        const monthSpend = expenseLookup[month.monthKey]?.[scenario.category] || 0
        const scenarioGain = Math.round((monthSpend * scenario.reductionPercent) / 100)
        row[`scenario${index + 1}`] = month.savings + scenarioGain
      })

      return row
    })
  }, [activeScenarios, allTransactions])

  const saveScenario = () => {
    if (!effectiveCategory) return

    const nextScenario = {
      id: `scenario-${Date.now()}`,
      category: effectiveCategory,
      reductionPercent,
    }

    setSavedScenarios((previous) => {
      const withoutDuplicate = previous.filter(
        (scenario) =>
          !(scenario.category === nextScenario.category &&
            scenario.reductionPercent === nextScenario.reductionPercent),
      )

      return [nextScenario, ...withoutDuplicate].slice(0, 3)
    })
  }

  const removeScenario = (scenarioId) => {
    setSavedScenarios((previous) => previous.filter((scenario) => scenario.id !== scenarioId))
  }

  return (
    <Card className="p-5">
      <SectionHeader
        title="What-if Analysis"
        subtitle="Simulate reducing one expense category without affecting your real transactions"
      />

      {categories.length === 0 ? (
        <p className="text-sm text-gray-400">
          Add expense transactions to run simulation scenarios.
        </p>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.14em] text-gray-500">Category</span>
              <select
                value={effectiveCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-gray-200 outline-none transition-all duration-200 ease-in-out focus:border-blue-400/60"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="flex items-center justify-between text-xs uppercase tracking-[0.14em] text-gray-500">
                Reduction
                <Badge tone="info">{reductionPercent}%</Badge>
              </span>
              <input
                type="range"
                min="0"
                max="50"
                value={reductionPercent}
                onChange={(event) => setReductionPercent(Number(event.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-blue-500"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2">
            <p className="text-xs text-gray-400">
              Save up to 3 scenarios and compare them with baseline savings.
            </p>
            <Button size="sm" variant="secondary" onClick={saveScenario}>
              Save Scenario
            </Button>
          </div>

          {savedScenarios.length ? (
            <div className="flex flex-wrap gap-2">
              {savedScenarios.map((scenario) => (
                <span
                  key={scenario.id}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs text-gray-300"
                >
                  {scenario.category} -{scenario.reductionPercent}%
                  <button
                    type="button"
                    onClick={() => removeScenario(scenario.id)}
                    className="text-gray-500 transition-colors hover:text-red-300"
                    aria-label="Remove scenario"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          ) : null}

          <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-gray-300">
              If you reduce <span className="font-medium text-white">{effectiveCategory}</span> by{' '}
              <span className="font-medium text-white">{reductionPercent}%</span>
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div key={`${simulationKey}-expenses`} className="animate-value-flash rounded-lg border border-white/10 bg-slate-950/60 p-3 transition-all duration-200">
                <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Expenses</p>
                <p className="mt-2 text-sm text-gray-400">
                  {formatCurrency(simulation.currentExpenses, currency)} {'->'}{' '}
                  <span className="font-semibold text-red-300">{formatCurrency(animatedExpenses, currency)}</span>
                </p>
              </div>

              <div key={`${simulationKey}-savings`} className="animate-value-flash rounded-lg border border-white/10 bg-slate-950/60 p-3 transition-all duration-200">
                <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Savings</p>
                <p className="mt-2 text-sm text-gray-400">
                  {formatCurrency(simulation.currentSavings, currency)} {'->'}{' '}
                  <span className="font-semibold text-emerald-300">{formatCurrency(animatedSavings, currency)}</span>
                </p>
              </div>

              <div key={`${simulationKey}-gain`} className="animate-value-flash rounded-lg border border-white/10 bg-slate-950/60 p-3 transition-all duration-200">
                <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Savings Increase</p>
                <p className="mt-2 text-sm font-semibold text-blue-300">
                  +{formatCurrency(animatedGain, currency)} / {timeLabel}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {simulation.savingsGainPercent >= 0 ? '+' : ''}
                  {simulation.savingsGainPercent}% vs current savings
                </p>
              </div>
            </div>
          </div>

          {comparisonData.length ? (
            <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">
                Scenario Comparison Timeline (Last 3 months)
              </p>
              <div className="mt-3 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={comparisonData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis
                      dataKey="month"
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
                    <RechartTooltip
                      formatter={(value) => formatCurrency(value, currency)}
                      contentStyle={{
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: '#0b1220',
                        color: '#e5e7eb',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="baseline"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      isAnimationActive
                      animationDuration={260}
                      name="Baseline"
                    />
                    {activeScenarios.map((scenario, index) => (
                      <Line
                        key={scenario.id}
                        type="monotone"
                        dataKey={`scenario${index + 1}`}
                        stroke={SCENARIO_COLORS[index]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        isAnimationActive
                        animationDuration={260}
                        name={`${scenario.category} -${scenario.reductionPercent}%`}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : null}

          <p className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-gray-300">
            {insightMessage}
          </p>
        </div>
      )}
    </Card>
  )
}
