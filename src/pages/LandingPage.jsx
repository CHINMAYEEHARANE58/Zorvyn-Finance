import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageTransition } from '../components/ui/PageTransition'
import { useAuth } from '../context/useAuth'

const MotionBlock = motion.div

export const LandingPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <PageTransition>
      <main className="mx-auto w-full max-w-5xl px-4 py-12 md:px-6 md:py-16">
        <section className="grid items-center gap-8 md:gap-10 lg:grid-cols-2">
          <MotionBlock
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Zorvyn Finance</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-white md:text-5xl lg:text-[52px]">
              Take control of your finances
            </h1>
            <p className="mt-4 max-w-xl text-base text-gray-400">
              Track spending, understand trends, and make smarter decisions with a simple financial dashboard.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {isAuthenticated ? (
                <Button variant="primary" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="secondary" onClick={() => navigate('/login')}>
                    Login
                  </Button>
                  <Button variant="primary" onClick={() => navigate('/signup')}>
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </MotionBlock>

          <MotionBlock
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
          >
            <Card className="p-5 md:p-6">
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Dashboard Preview</p>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <div className="rounded-lg border border-white/10 bg-slate-900/60 p-3 md:p-3.5">
                  <p className="text-xs text-gray-500">Balance</p>
                  <p className="mt-1 text-xl font-semibold text-white">$18,400</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-900/60 p-3 md:p-3.5">
                  <p className="text-xs text-gray-500">Expenses</p>
                  <p className="mt-1 text-xl font-semibold text-red-300">$3,920</p>
                </div>
              </div>
              <div className="mt-3 rounded-lg border border-white/10 bg-slate-900/60 p-3">
                <p className="text-xs text-gray-500">This Month</p>
                <p className="mt-1 text-sm text-gray-300">Savings improved by 12%</p>
              </div>
              <div className="mt-3 rounded-lg border border-white/10 bg-slate-900/60 p-3">
                <p className="text-xs text-gray-500">Weekly trend</p>
                <div className="mt-2 flex h-10 items-end gap-1.5">
                  <span className="h-4 w-2 rounded-sm bg-white/20" />
                  <span className="h-6 w-2 rounded-sm bg-white/30" />
                  <span className="h-7 w-2 rounded-sm bg-sky-400/70" />
                  <span className="h-5 w-2 rounded-sm bg-white/25" />
                  <span className="h-8 w-2 rounded-sm bg-sky-400/90" />
                  <span className="h-6 w-2 rounded-sm bg-white/30" />
                </div>
              </div>
            </Card>
          </MotionBlock>
        </section>
      </main>
    </PageTransition>
  )
}
