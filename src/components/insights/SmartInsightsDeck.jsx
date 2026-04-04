import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'

export const SmartInsightsDeck = ({ insights }) => {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <Card className="p-4 xl:col-span-1">
        <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Story Mode</p>
        <p className="mt-2 text-base font-semibold text-white">{insights.story.headline}</p>
        <ul className="mt-3 space-y-2 text-sm text-gray-300">
          {insights.story.highlights.map((item) => (
            <li key={item} className="rounded-lg border border-white/10 bg-slate-900/55 px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-4 xl:col-span-1">
        <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Behavioral Nudges</p>
        <div className="mt-3 space-y-2">
          {insights.nudges.map((nudge) => (
            <div key={nudge.id} className="rounded-lg border border-white/10 bg-slate-900/55 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-white">{nudge.title}</p>
                <Badge tone={nudge.tone}>Nudge</Badge>
              </div>
              <p className="mt-1 text-sm text-gray-300">{nudge.message}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 xl:col-span-1">
        <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Achievements</p>
        <div className="mt-3 space-y-2">
          {insights.achievements.length ? (
            insights.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-start gap-3 rounded-lg border border-white/10 bg-slate-900/55 px-3 py-2.5"
              >
                <span className="text-base">{achievement.icon}</span>
                <div>
                  <p className="text-sm font-medium text-white">{achievement.title}</p>
                  <p className="text-sm text-gray-300">{achievement.description}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-lg border border-white/10 bg-slate-900/55 px-3 py-2 text-sm text-gray-300">
              Keep logging transactions to unlock achievements.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}

