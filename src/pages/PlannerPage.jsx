import { Card } from '../components/ui/Card'
import { PageTransition } from '../components/ui/PageTransition'
import { SectionHeader } from '../components/ui/SectionHeader'
import { GoalTracker } from '../components/dashboard/GoalTracker'
import { WhatIfSimulator } from '../components/simulator/WhatIfSimulator'
import { useAuth } from '../context/useAuth'
import { useFinance } from '../context/useFinance'

export const PlannerPage = () => {
  const { user } = useAuth()
  const { summary, scopedTransactions, transactions, timeRange } = useFinance()

  const currency = user?.preferences?.currency || 'USD'

  return (
    <PageTransition>
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 md:px-6 md:py-8">
        <Card>
          <SectionHeader
            title="Planner"
            subtitle="Use advanced tools to simulate and plan your savings strategy"
          />
          <p className="text-sm text-gray-400">
            These tools are separated from the main dashboard to keep daily tracking simple and focused.
          </p>
        </Card>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <GoalTracker
            key={`${user?.id || 'goal-tracker'}-${currency}`}
            userId={user?.id || 'anon-user'}
            currentSavings={summary.totalBalance}
            currency={currency}
          />

          <WhatIfSimulator
            transactions={scopedTransactions}
            allTransactions={transactions}
            summary={summary}
            timeRange={timeRange}
            currency={currency}
          />
        </div>
      </main>
    </PageTransition>
  )
}
