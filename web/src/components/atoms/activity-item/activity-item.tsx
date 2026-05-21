import type { ActivityItemProps } from './types'

export const ActivityItem = ({
  title,
  subtitle,
  time,
}: Readonly<ActivityItemProps>) => {
  return (
    <div className="border rounded-2xl p-5 flex justify-between items-center">
      <div>
        <p className="font-semibold">{title}</p>
        {subtitle && <p className="text-muted-text text-sm">{subtitle}</p>}
      </div>

      {time && <span className="text-muted-text text-sm">{time}</span>}
    </div>
  )
}
