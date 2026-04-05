import { AnimatePresence, motion } from 'framer-motion'

const MotionAside = motion.aside
const MotionOverlay = motion.button

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'budgeting', label: 'Budgeting' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'wallets', label: 'Wallets' },
  { id: 'savings', label: 'Savings' },
  { id: 'reports', label: 'Reports' },
]

const DotIcon = () => <span className="h-1.5 w-1.5 rounded-full bg-current" />

const SidebarInner = ({ activeItem, onSelect }) => (
  <div className="flex h-full flex-col gap-4 rounded-none border-r border-white/10 bg-slate-900/95 px-4 py-5">
    <div className="px-2">
      <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Workspace</p>
      <p className="mt-2 text-lg font-semibold text-white">Finance Suite</p>
    </div>

    <nav className="space-y-1.5">
      {NAV_ITEMS.map((item) => {
        const isActive = activeItem === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ease-in-out ${
              isActive
                ? 'border border-white/10 bg-white/10 text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
            }`}
          >
            <DotIcon />
            {item.label}
          </button>
        )
      })}
    </nav>
  </div>
)

export const FinanceSidebar = ({
  activeItem,
  onSelect,
  isMobileOpen,
  onCloseMobile,
}) => {
  return (
    <>
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 lg:block">
        <SidebarInner activeItem={activeItem} onSelect={onSelect} />
      </aside>

      <AnimatePresence>
        {isMobileOpen ? (
          <>
            <MotionOverlay
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onCloseMobile}
              className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
              aria-label="Close sidebar overlay"
            />
            <MotionAside
              initial={{ x: -260, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -260, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="fixed left-0 top-0 z-50 h-screen w-64 lg:hidden"
            >
              <SidebarInner
                activeItem={activeItem}
                onSelect={(itemId) => {
                  onSelect(itemId)
                  onCloseMobile()
                }}
              />
            </MotionAside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  )
}
