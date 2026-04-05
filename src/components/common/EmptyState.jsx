import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

export const EmptyState = ({ title, description, action, actionLabel = 'Add transaction' }) => {
  return (
    <Card className="border-dashed border-white/15 bg-slate-800/45 py-9 text-center">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">{description}</p>
      {action ? (
        <div className="mt-5">
          <Button variant="secondary" onClick={action}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </Card>
  )
}
