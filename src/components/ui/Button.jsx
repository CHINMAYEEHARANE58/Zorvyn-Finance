import { memo } from 'react'

const BASE_STYLES =
  'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium tracking-[0.01em] transition-all duration-200 ease-in-out active:scale-95 disabled:cursor-not-allowed disabled:opacity-70'

const VARIANT_STYLES = {
  primary:
    'border border-blue-400/40 bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_20px_rgba(37,99,235,0.28)] hover:-translate-y-0.5 hover:from-blue-500 hover:to-blue-500 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.26),0_14px_28px_rgba(37,99,235,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60',
  secondary:
    'border border-white/12 bg-white/5 text-gray-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:-translate-y-0.5 hover:bg-white/[0.09] hover:border-white/20',
  ghost: 'text-gray-300 hover:bg-white/5 hover:text-white hover:-translate-y-0.5',
  danger:
    'border border-red-500/35 bg-red-500/12 text-red-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:-translate-y-0.5 hover:bg-red-500/18 hover:border-red-400/45',
}

const SIZE_STYLES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
  icon: 'h-8 w-8 px-0 py-0',
}

export const Button = memo(
  ({
    className = '',
    variant = 'secondary',
    size = 'md',
    type = 'button',
    children,
    ...props
  }) => {
    return (
      <button
        type={type}
        className={`${BASE_STYLES} ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
