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
}: NotificationsListProps) => {}

export default NotificationsList
