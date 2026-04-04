import { Button } from '../ui/Button'
import { CardShell } from '../ui/CardShell'
import { Tooltip } from '../ui/Tooltip'

export const QuickActionsPanel = ({ role, onAddExpense, onViewReports }) => {
  const isViewer = role === 'viewer'
  const disabledMessage = 'Switch to admin to edit'

  return (
    <CardShell title="Quick Actions" subtitle="Frequently used shortcuts" className="h-full">
      <div className="space-y-3">
        <Tooltip content={isViewer ? disabledMessage : null}>
          <span className="block">
            <Button
              variant="primary"
              className="w-full"
              onClick={onAddExpense}
              disabled={isViewer}
            >
              Add Expense
            </Button>
          </span>
        </Tooltip>

        <Button variant="secondary" className="w-full" onClick={onViewReports}>
          View Reports
        </Button>
      </div>
    </CardShell>
  )
}
