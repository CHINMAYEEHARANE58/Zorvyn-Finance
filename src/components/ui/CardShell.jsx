export const CardShell = ({ title, subtitle, actions, children, className = '' }) => {
  return (
    <section
      className={`rounded-xl border border-slate-200/90 bg-white/90 p-5 shadow-sm backdrop-blur transition-all duration-300 dark:border-slate-700 dark:bg-slate-900/85 ${className}`}
    >
      {(title || subtitle || actions) && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title ? (
              <h2 className="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
            ) : null}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  )
}
