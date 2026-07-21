import * as React from 'react'
import { Smartphone, Monitor, Unplug } from 'lucide-react'

import api from '@/lib/api'
import { DashboardModal } from '@/components/molecules/dashboard-modal/dashboard-modal'
import type { TrustedDevice } from '@/components/molecules/trusted-devices/types'

interface TrustedDeviceResponse {
  id: string
  deviceName: string
  deviceType: string
  location: string
  lastActive: string
  isCurrentDevice: boolean
  isTrusted: boolean
}

export function TrustedDevices() {
  const [devices, setDevices] = React.useState<TrustedDevice[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showDevices, setShowDevices] = React.useState(false)

  React.useEffect(() => {
    const fetchTrustedDevices = async () => {
      try {
        const { data } = await api.get<TrustedDeviceResponse[]>(
          '/api/trusted-devices/me'
        )

        const mappedDevices: TrustedDevice[] = data.map((device) => ({
          id: device.id,
          name: device.deviceName,
          meta: device.isCurrentDevice
            ? `Current device • ${device.location}`
            : `Last active • ${new Date(device.lastActive).toLocaleString()}`,
          status: device.isCurrentDevice ? 'Active' : 'Known',
          icon:
            device.deviceType.toLowerCase().includes('phone') ||
            device.deviceType.toLowerCase().includes('mobile')
              ? Smartphone
              : Monitor,
        }))

        setDevices(mappedDevices)
      } catch (error) {
        console.error('Failed to load trusted devices:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrustedDevices()
  }, [])

  if (loading) {
    return (
      <div className="bg-card rounded-3xl border p-6">
        <h2 className="text-lg font-bold">Trusted Devices</h2>

        <p className="mt-4 text-sm text-muted-text">
          Loading trusted devices...
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-card rounded-3xl border p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Trusted Devices</h2>

          <button
            onClick={() => setShowDevices(true)}
            className="text-sm font-semibold text-green-700 hover:text-green-800"
          >
            Manage devices
          </button>
        </div>

        {devices.length === 0 ? (
          <p className="mt-4 text-sm text-muted-text">
            No trusted devices found.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {devices.map((device) => {
              const Icon = device.icon

              return (
                <li
                  key={device.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-muted p-2">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <div className="text-sm font-semibold">{device.name}</div>

                      <div className="text-muted-text mt-0.5 text-xs">
                        {device.meta}
                      </div>
                    </div>
                  </div>

                  {device.status === 'Active' ? (
                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                      Active
                    </span>
                  ) : (
                    <span className="text-muted-text text-xs font-semibold">
                      Known
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <DashboardModal
        open={showDevices}
        title="Trusted Devices"
        onClose={() => setShowDevices(false)}
      >
        {devices.length === 0 ? (
          <p className="text-muted-text">No trusted devices found.</p>
        ) : (
          <div className="space-y-4">
            {devices.map((device) => {
              const Icon = device.icon

              return (
                <div
                  key={device.id}
                  className="flex items-center justify-between rounded-2xl border p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-muted p-4">
                      <Icon className="h-7 w-7 text-green-700" />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold">{device.name}</h3>

                      <p className="text-muted-text mt-1 text-sm">
                        {device.meta}
                      </p>

                      <span
                        className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          device.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {device.status}
                      </span>
                    </div>
                  </div>

                  {device.status !== 'Active' && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-600 hover:bg-red-100"
                    >
                      <Unplug className="h-4 w-4" />
                      Unlink Device
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </DashboardModal>
    </>
  )
}
