import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageTransition } from '../components/ui/PageTransition'
import { useAuth } from '../context/useAuth'

const MotionDiv = motion.div

const features = [
  {
    title: 'Unified Money View',
    description: 'See income, expenses, and balances in one clean operating dashboard.',
  },
  {
    title: 'Practical Controls',
    description: 'Use role-aware actions and focused workflows without backend complexity.',
  },
  {
    title: 'Decision Insights',
    description: 'Get quick signals on spending patterns, savings progress, and category risks.',
  },
]

export const LandingPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <PageTransition>
      <main className="min-h-screen">
        <section className="zorvyn-hero border-b border-white/10">
          <div className="mx-auto max-w-7xl px-4 pb-14 pt-16 text-center md:px-6 md:pt-20">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.34 }}
              className="mx-auto max-w-4xl"
            >
              <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Built for focused finance workflows
              </p>

              <h1 className="mt-7 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-7xl">
                Manage cashflow with{' '}
                <span className="text-gradient-fintech">clarity</span>,{' '}
                <span className="text-gradient-fintech">control</span>, and{' '}
                <span className="text-gradient-fintech">confidence</span>
              </h1>

              <p className="mx-auto mt-6 max-w-3xl text-base text-gray-400 sm:text-lg">
                A clean finance workspace to track transactions, monitor trends, and make better
                monthly decisions without noise.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {isAuthenticated ? (
                  <Button variant="primary" onClick={() => navigate('/dashboard')}>
                    Open Dashboard
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
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.34, delay: 0.08 }}
              className="mx-auto mt-12 max-w-6xl"
            >
              <img
                src="/images/landing-dashboard.svg"
                alt="Finance dashboard preview"
                className="w-full rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
              />
            </MotionDiv>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Features</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Designed for modern finance teams</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {features.map((feature, index) => (
              <MotionDiv
                key={feature.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.24, delay: index * 0.05 }}
              >
                <Card className="h-full p-6">
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">{feature.description}</p>
                </Card>
              </MotionDiv>
            ))}
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-4 pb-10 md:px-6">
          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Pricing</p>
            <p className="mt-2 text-sm text-gray-300">
              Simple plans for personal use, teams, and growing finance operations.
            </p>
          </Card>
        </section>

        <section id="company" className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Company</p>
            <p className="mt-2 text-sm text-gray-300">
              We design thoughtful financial products focused on speed, clarity, and usability.
            </p>
          </Card>
        </section>
      </main>
    </PageTransition>
  )
}
