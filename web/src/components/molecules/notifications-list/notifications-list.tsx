import { ActivityItem } from '@/components/atoms'

import type { NotificationsListProps } from './types'

//mock information stuffs for now. change to real data
const defaultNotifications = [
  {
    id: 'n1',
    title: 'Credential review available',
    subtitle: "Driver's licence updated",
    time: 'Today',
  },
  {
    id: 'n2',
    title: 'Security alert',
    subtitle: 'New login from unknown device',
    time: 'Yesterday',
  },
]

export const NotificationsList = ({
  notifications = defaultNotifications,
}: NotificationsListProps) => {
  return (
    <div className="bg-card rounded-3xl border p-6">
      <h3 className="text-lg font-semibold mb-3">Notifications</h3>
      <div className="space-y-3">
        {notifications.map((n) => (
          <ActivityItem
            key={n.id}
            title={n.title}
            subtitle={n.subtitle}
            time={n.time ?? ''}
          />
        ))}
      </div>
    </div>
  )
}

export default NotificationsList
