export const SectionHeader = ({ title, subtitle, actions }) => {
  return (
    <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
        {subtitle ? <p className="mt-1.5 text-sm text-gray-400">{subtitle}</p> : null}
      </div>
      {actions}
    </header>
  )
}
