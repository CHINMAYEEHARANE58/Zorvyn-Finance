export const Card = ({ children, className = '' }) => {
  return (
    <section
      className={`panel-surface p-5 ${className}`}
    >
      {children}
    </section>
  )
}
