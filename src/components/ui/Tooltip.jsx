export const Tooltip = ({ content, children }) => {
  if (!content) return children

  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute -top-9 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-slate-950 px-2 py-1 text-xs text-gray-200 shadow-md group-hover:block">
        {content}
      </span>
    </span>
  )
}
