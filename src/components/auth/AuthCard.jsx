import { motion } from 'framer-motion'
import { Card } from '../ui/Card'

const MotionAside = motion.aside
const MotionSection = motion.section

export const AuthCard = ({ title, subtitle, children }) => {
  return (
    <Card className="w-full max-w-4xl overflow-hidden p-0">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <MotionAside
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="hidden border-r border-white/10 bg-slate-900/60 p-8 md:block"
        >
          <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Zorvyn Finance</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-white">
            Build healthier money habits
          </h2>
          <p className="mt-3 text-sm text-gray-400">
            Track transactions, understand your spending, and improve savings with a focused dashboard.
          </p>

          <img
            src="/images/auth-illustration.svg"
            alt="Finance planning illustration"
            className="mt-6 w-full rounded-xl border border-white/10 object-cover shadow-sm"
          />

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-white/10 bg-slate-900/65 px-3 py-2">
              <p className="text-[11px] text-gray-500">Savings Trend</p>
              <p className="mt-1 text-sm font-semibold text-emerald-300">+12%</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-900/65 px-3 py-2">
              <p className="text-[11px] text-gray-500">Spending Health</p>
              <p className="mt-1 text-sm font-semibold text-white">Healthy</p>
            </div>
          </div>
        </MotionAside>

        <MotionSection
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="p-6 md:p-8"
        >
          <h1 className="text-2xl font-semibold text-white">{title}</h1>
          <p className="mt-2 text-sm text-gray-400">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </MotionSection>
      </div>
    </Card>
  )
}
