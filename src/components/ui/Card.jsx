export const Card = ({ children, className = '' }) => {
  return (
    <section
      className={`rounded-xl border border-white/10 bg-slate-800/65 p-4 shadow-sm transition-all duration-200 ease-in-out hover:translate-y-1 hover:shadow-md ${className}`}
    >
      {children}
    </section>
  )
}
