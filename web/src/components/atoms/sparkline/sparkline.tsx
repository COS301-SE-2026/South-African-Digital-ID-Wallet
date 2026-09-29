import {
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SparklineProps } from './types'

export const Sparkline = ({ data, color }: SparklineProps) => {
  const chartData = data.map((value, index) => ({ day: index + 1, value }))
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 12, bottom: 24, left: 8 }}
        >
          <CartesianGrid stroke="rgba(0, 0, 0, 0.08)" strokeDasharray="3 3" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11 }}
            stroke="rgba(0, 0, 0, 0.45)"
            label={{ value: 'Day', position: 'insideBottom', offset: -8 }}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="rgba(0, 0, 0, 0.45)"
            allowDecimals={false}
            width={36}
          >
            <Label
              value="Count"
              angle={-90}
              position="insideLeft"
              offset={-2}
            />
          </YAxis>
          <Tooltip
            formatter={(value) => [Number(value ?? 0), 'Count']}
            labelFormatter={(label) => `Day ${label}`}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
