export const Badge = ({ children, tone = 'neutral', className = '' }) => {
  const toneStyles = {
    neutral: 'bg-white/6 text-gray-300',
    success: 'bg-emerald-500/12 text-emerald-300',
    danger: 'bg-red-500/12 text-red-300',
    warning: 'bg-amber-500/12 text-amber-300',
    info: 'bg-sky-500/12 text-sky-300',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${toneStyles[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
