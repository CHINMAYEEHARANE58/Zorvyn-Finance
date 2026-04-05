import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

const MotionBackdrop = motion.div
const MotionContainer = motion.div

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
)

export const ExpandablePanelModal = ({
  open = false,
  title = 'Expanded View',
  subtitle = '',
  onClose = () => {},
  children,
}) => {
  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <MotionBackdrop
          className="fixed inset-0 z-[120] bg-slate-950 px-4 py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          onClick={onClose}
        >
          <MotionContainer
            className="panel-surface mx-auto flex h-[min(92vh,860px)] w-[min(96vw,1200px)] flex-col overflow-hidden"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
              <div>
                <h2 className="text-base font-semibold text-white sm:text-lg">{title}</h2>
                {subtitle ? <p className="mt-1 text-xs text-gray-400">{subtitle}</p> : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition-all duration-200 hover:bg-white/10 hover:text-white"
                aria-label="Close expanded view"
              >
                <CloseIcon />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-5">{children}</div>
          </MotionContainer>
        </MotionBackdrop>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
