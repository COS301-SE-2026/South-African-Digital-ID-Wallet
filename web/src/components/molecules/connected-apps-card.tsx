import { ConnectedAppItem } from '@/components/atoms'

export const ConnectedAppsCard = () => {
  return (
    <div className="bg-card rounded-3xl border p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Connected Applications</h2>
          <p className="text-muted-text">
            Apps and services linked to your Flash ID wallet.
          </p>
        </div>
        <button className="text-deep-green font-semibold">Manage</button>
      </div>

      <div className="space-y-4">
        <ConnectedAppItem
          name="eGov Services"
          subtitle="Government of South Africa"
          status="active"
        />
        <ConnectedAppItem
          name="Home Affairs Portal"
          subtitle="Department of Home Affairs"
          status="active"
        />
        <ConnectedAppItem
          name="SASSA Services"
          subtitle="South African Social Security Agency"
          status="active"
        />
      </div>
    </div>
  )
}
