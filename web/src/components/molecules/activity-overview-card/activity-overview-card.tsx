import { ActivityItem } from '@/components/atoms'

export const ActivityOverviewCard = () => {
  return (
    <div className="bg-card rounded-3xl border p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Activity Overview</h2>
          <p className="text-muted-text text-sm">
            Review your recent account activity.
          </p>
        </div>
        <button className="text-deep-green font-semibold">View all</button>
      </div>

      <div className="space-y-4">
        <ActivityItem
          title="Credential verified by Bank Official"
          subtitle="QR verification • Standard Bank"
          time="Today, 09:42"
        />
        <ActivityItem
          title="Login successful"
          subtitle="Mobile wallet • Samsung Galaxy A54"
          time="Today, 09:14"
        />
        <ActivityItem
          title="Password changed"
          subtitle="Account security"
          time="18 May 2025"
        />
        <ActivityItem
          title="New device added"
          subtitle="Mobile wallet • iPhone 12"
          time="16 May 2025"
        />
      </div>
    </div>
  )
}
