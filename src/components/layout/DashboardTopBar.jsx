import { Button } from '../ui/Button'

const BellIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
    <path d="M10 17a2 2 0 0 0 4 0" />
  </svg>
)

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

const ThemeIcon = ({ darkMode }) => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    {darkMode ? (
      <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4a8.5 8.5 0 1 0 11.5 11.5Z" />
    ) : (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2.2M12 19.8V22M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M2 12h2.2M19.8 12H22M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5" />
      </>
    )}
  </svg>
)

const RangeButton = ({ label, value, activeValue, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(value)}
    className={`rounded-md px-2.5 py-1 text-xs transition-all duration-200 ease-in-out ${
      activeValue === value
        ? 'bg-white text-slate-900'
        : 'text-gray-400 hover:bg-white/10 hover:text-gray-200'
    }`}
  >
    {label}
  </button>
)

export const DashboardTopBar = ({
  searchTerm,
  onSearchChange,
  role,
  onRoleChange,
  focusMode,
  onToggleFocusMode,
  timeRange,
  onTimeRangeChange,
  darkMode,
  onToggleTheme,
  user,
  onOpenMobileSidebar,
  onOpenProfile,
}) => {
  return (
    <header id="dashboard" className="rounded-xl border border-white/10 bg-slate-800/60 px-4 py-3 md:px-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition-all duration-200 ease-in-out hover:bg-white/10 lg:hidden"
            aria-label="Open sidebar"
          >
            <MenuIcon />
          </button>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Dashboard</h1>
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search transactions..."
            className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-gray-200 outline-none transition-all duration-200 ease-in-out placeholder:text-gray-500 focus:border-sky-400/70 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.14)] sm:w-64"
          />

          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-white/10"
            aria-label="Toggle theme"
          >
            <ThemeIcon darkMode={darkMode} />
          </button>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-white/10"
            aria-label="Notifications"
          >
            <BellIcon />
          </button>

          <button
            type="button"
            onClick={onOpenProfile}
            className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-2.5 text-sm font-medium text-gray-200 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-white/10"
            aria-label="Open profile"
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-xs text-gray-300">
            <span className="text-gray-400">Role</span>
            <select
              value={role}
              onChange={(event) => onRoleChange(event.target.value)}
              className="bg-transparent text-gray-200 outline-none"
            >
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-slate-900/70 p-1">
            <RangeButton
              label="Week"
              value="week"
              activeValue={timeRange}
              onSelect={onTimeRangeChange}
            />
            <RangeButton
              label="Month"
              value="month"
              activeValue={timeRange}
              onSelect={onTimeRangeChange}
            />
            <RangeButton
              label="Year"
              value="year"
              activeValue={timeRange}
              onSelect={onTimeRangeChange}
            />
          </div>
        </div>

        <Button size="sm" variant="secondary" onClick={onToggleFocusMode}>
          {focusMode ? 'Exit Focus Mode' : 'Focus Mode'}
        </Button>
      </div>
    </header>
  )
}
