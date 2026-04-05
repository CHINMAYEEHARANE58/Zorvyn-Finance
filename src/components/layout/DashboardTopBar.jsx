import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../ui/Button'

const MotionPanel = motion.div
const MotionBackdrop = motion.div

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

const NotificationIcon = ({ type }) => {
  if (type === 'alert') {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-amber-400/35 bg-amber-500/18 text-[10px] font-semibold text-amber-200">
        !
      </span>
    )
  }

  if (type === 'insight') {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-violet-400/35 bg-violet-500/18 text-[10px] font-semibold text-violet-200">
        i
      </span>
    )
  }

  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-blue-400/35 bg-blue-500/18 text-[10px] font-semibold text-blue-200">
      •
    </span>
  )
}

const formatDateTime = (value) => {
  const date = new Date(value)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const formatRelative = (value) => {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000))

  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const RangeButton = ({ label, value, activeValue, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(value)}
    className={`rounded-md px-2.5 py-1 text-xs transition-all duration-200 ease-in-out ${
      activeValue === value
        ? 'border border-blue-400/35 bg-blue-500/90 text-white shadow-[0_8px_18px_rgba(37,99,235,0.25)]'
        : 'text-gray-400 hover:bg-white/10 hover:text-gray-200'
    }`}
  >
    {label}
  </button>
)

const NotificationItem = ({ notification, onMarkRead, onDismiss }) => {
  return (
    <article
      className={`rounded-lg border p-2.5 transition-all duration-200 ${
        notification.isRead
          ? 'border-white/10 bg-white/5'
          : 'border-blue-400/30 bg-blue-500/10'
      }`}
      onClick={() => {
        if (!notification.isRead) onMarkRead(notification.id)
      }}
    >
      <div className="flex items-start gap-2.5">
        <NotificationIcon type={notification.type} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-white">{notification.title}</p>
            <span className="text-[10px] text-gray-500">{formatRelative(notification.eventAt)}</span>
          </div>
          <p className="mt-1 text-xs text-gray-300">{notification.message}</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] text-gray-500">{formatDateTime(notification.eventAt)}</span>
            <div className="flex items-center gap-1.5">
              {!notification.isRead ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onMarkRead(notification.id)
                  }}
                  className="rounded-md border border-white/15 px-2 py-1 text-[10px] text-gray-300 transition-all duration-200 hover:bg-white/10"
                >
                  Mark read
                </button>
              ) : null}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onDismiss(notification.id)
                }}
                className="rounded-md border border-white/15 px-2 py-1 text-[10px] text-gray-300 transition-all duration-200 hover:bg-white/10"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'activity', label: 'Activity' },
]

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
  notifications = [],
  unreadCount = 0,
  onMarkNotificationRead = () => {},
  onMarkAllNotificationsRead = () => {},
  onDismissNotification = () => {},
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [notificationFilter, setNotificationFilter] = useState('all')
  const notificationRef = useRef(null)
  const notificationPanelRef = useRef(null)
  const notificationTriggerRef = useRef(null)
  const [notificationPosition, setNotificationPosition] = useState({
    top: 100,
    right: 16,
  })

  const visibleNotifications = useMemo(() => {
    if (notificationFilter === 'unread') {
      return notifications.filter((notification) => !notification.isRead)
    }

    if (notificationFilter === 'alerts') {
      return notifications.filter((notification) =>
        ['alert', 'insight'].includes(notification.type),
      )
    }

    if (notificationFilter === 'activity') {
      return notifications.filter((notification) => notification.type === 'activity')
    }

    return notifications
  }, [notificationFilter, notifications])

  useEffect(() => {
    if (!isNotificationsOpen) return undefined

    const updatePanelPosition = () => {
      if (!notificationTriggerRef.current) return
      const rect = notificationTriggerRef.current.getBoundingClientRect()
      setNotificationPosition({
        top: Math.round(rect.bottom + 10),
        right: Math.max(12, Math.round(window.innerWidth - rect.right)),
      })
    }

    updatePanelPosition()

    const handleOutsideClick = (event) => {
      const target = event.target
      if (notificationRef.current?.contains(target)) return
      if (notificationPanelRef.current?.contains(target)) return
      setIsNotificationsOpen(false)
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsNotificationsOpen(false)
    }

    window.addEventListener('resize', updatePanelPosition)
    window.addEventListener('scroll', updatePanelPosition, true)
    document.addEventListener('mousedown', handleOutsideClick)
    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('resize', updatePanelPosition)
      window.removeEventListener('scroll', updatePanelPosition, true)
      document.removeEventListener('mousedown', handleOutsideClick)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isNotificationsOpen])

  return (
    <header id="dashboard" className="dashboard-topbar panel-surface relative z-40 overflow-visible px-4 py-3 md:px-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-200 ease-in-out hover:bg-white/10 lg:hidden"
            aria-label="Open sidebar"
          >
            <MenuIcon />
          </button>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            <span className="text-gradient-fintech">Dashboard</span>
          </h1>
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search transactions..."
            className="dashboard-search-input w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-gray-200 outline-none transition-all duration-200 ease-in-out placeholder:text-gray-500 focus:border-blue-400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/35 sm:w-64"
          />

          <button
            type="button"
            onClick={onToggleTheme}
            className="topbar-control-btn inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-white/10"
            aria-label="Toggle theme"
          >
            <ThemeIcon darkMode={darkMode} />
          </button>

          <div className="relative" ref={notificationRef}>
            <button
              ref={notificationTriggerRef}
              type="button"
              onClick={() => setIsNotificationsOpen((previous) => !previous)}
              className="topbar-control-btn relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-white/10"
              aria-label="Notifications"
            >
              <BellIcon />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full border border-blue-300/35 bg-blue-500 px-1 text-[10px] font-semibold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : null}
            </button>

            {typeof document !== 'undefined'
              ? createPortal(
                  <AnimatePresence>
                    {isNotificationsOpen ? (
                      <>
                        <MotionBackdrop
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          onClick={() => setIsNotificationsOpen(false)}
                          className="fixed inset-0 z-[91] bg-slate-950/94"
                        />
                        <MotionPanel
                          ref={notificationPanelRef}
                          initial={{ opacity: 0, y: -6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.98 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          style={{ top: notificationPosition.top, right: notificationPosition.right }}
                          className="notification-panel panel-surface fixed z-[95] w-[min(96vw,420px)] p-3 shadow-2xl"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-white">Notifications</p>
                              <p className="text-xs text-gray-400">{notifications.length} total</p>
                            </div>
                            <button
                              type="button"
                              onClick={onMarkAllNotificationsRead}
                              className="rounded-md border border-white/15 px-2 py-1 text-[10px] text-gray-300 transition-all duration-200 hover:bg-white/10"
                            >
                              Mark all read
                            </button>
                          </div>

                          <div className="mt-2 flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
                            {FILTERS.map((filter) => (
                              <button
                                key={filter.id}
                                type="button"
                                onClick={() => setNotificationFilter(filter.id)}
                                className={`rounded-md px-2 py-1 text-[11px] transition-all duration-200 ${
                                  notificationFilter === filter.id
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-400 hover:bg-white/10 hover:text-gray-200'
                                }`}
                              >
                                {filter.label}
                              </button>
                            ))}
                          </div>

                          <div className="mt-3 max-h-[min(60vh,420px)] space-y-2 overflow-y-auto pr-1">
                            {visibleNotifications.length ? (
                              visibleNotifications.map((notification) => (
                                <NotificationItem
                                  key={notification.id}
                                  notification={notification}
                                  onMarkRead={onMarkNotificationRead}
                                  onDismiss={onDismissNotification}
                                />
                              ))
                            ) : (
                              <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-400">
                                No notifications in this filter.
                              </p>
                            )}
                          </div>
                        </MotionPanel>
                      </>
                    ) : null}
                  </AnimatePresence>,
                  document.body,
                )
              : null}
          </div>

          <button
            type="button"
            onClick={onOpenProfile}
            className="topbar-control-btn inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-2.5 text-sm font-medium text-gray-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-white/10"
            aria-label="Open profile"
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
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

          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
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
