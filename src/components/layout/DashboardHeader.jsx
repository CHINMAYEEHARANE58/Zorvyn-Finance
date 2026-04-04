import { useFinance } from '../../context/useFinance'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

const RangeButton = ({ value, activeValue, onSelect, children }) => (
  <button
    type="button"
    onClick={() => onSelect(value)}
    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ease-in-out ${
      activeValue === value
        ? 'bg-white text-slate-900'
        : 'text-gray-300 hover:bg-white/10 hover:text-white'
    }`}
  >
    {children}
  </button>
)

export const DashboardHeader = ({
  heroInsight,
  onPrimaryAction,
  primaryActionLabel,
  userName,
}) => {
  const { role, setRole, timeRange, setTimeRange } = useFinance()

  return (
    <header className="rounded-xl border border-white/10 bg-slate-800/55 px-5 py-5 shadow-sm transition-all duration-200 ease-in-out md:px-6">
      <div className="flex flex-col gap-4">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {userName ? `Welcome back, ${userName}` : 'Financial overview'}
          </h1>
          <p className="mt-2 text-sm text-gray-400">{heroInsight}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-slate-900/70 p-2">
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-xs text-gray-300">
              <span className="text-gray-400">Role</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="bg-transparent text-gray-200 outline-none"
              >
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <div className="flex items-center gap-1">
              <RangeButton value="week" activeValue={timeRange} onSelect={setTimeRange}>
                This Week
              </RangeButton>
              <RangeButton value="month" activeValue={timeRange} onSelect={setTimeRange}>
                Month
              </RangeButton>
              <RangeButton value="year" activeValue={timeRange} onSelect={setTimeRange}>
                Year
              </RangeButton>
            </div>
          </div>

          <Button size="sm" variant="primary" onClick={onPrimaryAction}>
            {primaryActionLabel}
          </Button>
        </div>

        {role === 'viewer' ? <Badge tone="warning">Read-only mode</Badge> : null}
      </div>
    </header>
  )
}
