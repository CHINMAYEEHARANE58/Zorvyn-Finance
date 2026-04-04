import { memo } from 'react'

const BASE_STYLES =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ease-in-out active:scale-95 disabled:cursor-not-allowed disabled:opacity-50'

const VARIANT_STYLES = {
  primary:
    'bg-sky-500/90 text-white hover:shadow-md hover:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60',
  secondary:
    'border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10 hover:translate-y-0.5',
  ghost: 'text-gray-300 hover:bg-white/5 hover:text-white',
  danger:
    'border border-red-500/25 bg-red-500/10 text-red-300 hover:bg-red-500/15 hover:translate-y-0.5',
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
