import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageTransition } from '../components/ui/PageTransition'
import { SectionReveal } from '../components/ui/SectionReveal'
import { useAuth } from '../context/useAuth'

const MotionDiv = motion.div

const features = [
  {
    title: 'Smart Insights',
    description: 'Clear weekly and monthly summaries based on real transaction behavior.',
  },
  {
    title: 'Expense Tracking',
    description: 'Track income and expenses with focused filters and clean category views.',
  },
  {
    title: 'Visual Analytics',
    description: 'Understand your trends quickly with minimal and readable charts.',
  },
  {
    title: 'Budget Planning',
    description: 'Set category budgets, monitor progress, and avoid overspending.',
  },
]

export const LandingPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <PageTransition>
      <main className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <section className="grid items-center gap-8 md:gap-10 lg:grid-cols-2">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Zorvyn Finance</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-white md:text-5xl lg:text-[54px]">
              Take control of your finances
            </h1>
            <p className="mt-4 max-w-xl text-base text-gray-400">
              Track spending, understand trends, and make better financial decisions in a focused dashboard.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
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
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.06 }}
            whileHover={{ y: -4, rotateX: 2, rotateY: -2 }}
            style={{ transformPerspective: 1000 }}
          >
            <Card className="p-4 md:p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Dashboard Preview</p>
              <img
                src="/images/landing-dashboard.svg"
                alt="Finance dashboard mockup"
                className="mt-3 w-full rounded-xl border border-white/10 object-cover shadow-sm"
              />
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-white/10 bg-slate-900/55 p-2.5">
                  <p className="text-[11px] text-gray-500">Balance</p>
                  <p className="mt-1 text-sm font-semibold text-white">$18.7K</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-900/55 p-2.5">
                  <p className="text-[11px] text-gray-500">Income</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-300">$21.2K</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-900/55 p-2.5">
                  <p className="text-[11px] text-gray-500">Expenses</p>
                  <p className="mt-1 text-sm font-semibold text-red-300">$2.5K</p>
                </div>
              </div>
            </Card>
          </MotionDiv>
        </section>

        <SectionReveal className="mt-12 md:mt-14">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Core Features</p>
            <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
              Built for clarity and daily usability
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature, index) => (
              <MotionDiv
                key={feature.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.24, delay: index * 0.04 }}
              >
                <Card className="h-full p-5">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs font-semibold text-gray-300">
                    0{index + 1}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">{feature.description}</p>
                </Card>
              </MotionDiv>
            ))}
          </div>
        </SectionReveal>
      </main>
    </PageTransition>
  )
}
