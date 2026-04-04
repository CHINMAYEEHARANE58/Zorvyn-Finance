import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCompactCurrency, formatCurrency } from '../../utils/formatters'

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-md border border-white/10 bg-slate-900/95 px-2.5 py-2 text-xs text-gray-200 shadow-lg">
      <p className="text-gray-400">{label}</p>
      <p className="mt-1 font-medium text-white">{formatCurrency(payload[0].value, currency)}</p>
    </div>
  )
}

export const BalanceTrendChart = ({ data, currency = 'USD' }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={240} minHeight={220}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickFormatter={(value) => formatCompactCurrency(value, currency)}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ stroke: 'rgba(148,163,184,0.25)' }}
            content={<CustomTooltip currency={currency} />}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#60a5fa"
            strokeWidth={2}
            fill="#60a5fa"
            fillOpacity={0.12}
            isAnimationActive
            animationDuration={280}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
