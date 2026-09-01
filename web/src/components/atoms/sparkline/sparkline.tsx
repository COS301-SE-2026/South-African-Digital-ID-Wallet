import { Line, LineChart, ResponsiveContainer } from 'recharts'
import type { SparklineProps } from './types'

export const Sparkline = ({ data, color }: SparklineProps) => {
  const chartData = data.map((value, index) => ({ index, value }))
  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
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
