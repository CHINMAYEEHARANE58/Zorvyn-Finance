export const Badge = ({ children, tone = 'neutral', className = '' }) => {
  const toneStyles = {
    neutral: 'border border-white/10 bg-white/6 text-gray-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
    success: 'border border-emerald-400/25 bg-emerald-500/12 text-emerald-300',
    danger: 'border border-red-400/25 bg-red-500/12 text-red-300',
    warning: 'border border-amber-400/25 bg-amber-500/12 text-amber-300',
    info: 'border border-blue-400/25 bg-blue-500/12 text-blue-300',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200 ease-in-out hover:-translate-y-0.5 ${toneStyles[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
