import * as React from 'react'
import { Smartphone, Monitor, Unplug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { DashboardModal } from '@/components/molecules/dashboard-modal/dashboard-modal'
import type { TrustedDevice } from '@/components/molecules/trusted-devices/types'

interface TrustedDeviceResponse {
  id: string
  deviceName: string
  deviceType: string
  lastKnownCity: string
  lastKnownCountry: string
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

        const mappedDevices: TrustedDevice[] = data.map((device) => {
          const location =
            [device.lastKnownCity, device.lastKnownCountry]
              .filter((value): value is string => Boolean(value?.trim()))
              .join(', ') || 'Unknown location'

          return {
            id: device.id,
            name: device.deviceName,
            meta: device.isCurrentDevice
              ? `Current device • ${location}`
              : `Last active • ${new Date(device.lastActive).toLocaleString()}`,
            status: device.isCurrentDevice ? 'Active' : 'Known',
            icon:
              device.deviceType.toLowerCase().includes('phone') ||
              device.deviceType.toLowerCase().includes('mobile')
                ? Smartphone
                : Monitor,
          }
        })

        setDevices(mappedDevices)
      } catch (error) {
        console.error('Failed to load trusted devices:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrustedDevices()
  }, [])

  const unlinkDevice = async (deviceId: string) => {
    try {
      await api.delete(`/api/trusted-devices/${deviceId}`)

      setDevices((previous) =>
        previous.filter((device) => device.id !== deviceId)
      )
    } catch (error) {
      console.error('Failed to unlink device:', error)
    }
  }

  return (
    <>
      <div className="relative rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
        <div className="rounded-[24px] bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-deep-green">
              Trusted Devices
            </h2>

            <Button
              variant="link"
              size="sm"
              onClick={() => setShowDevices(true)}
              className="text-primary-green text-deep-green"
            >
              Manage devices
            </Button>
          </div>

          {devices.length === 0 ? (
            <p className="mt-4 text-sm text-muted-text">
              No trusted devices found.
            </p>
          ) : (
            <ul className="mt-4 max-h-[210px] space-y-4 overflow-y-auto pr-2">
              {devices.map((device) => {
                const Icon = device.icon

                return (
                  <li
                    key={device.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-black p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-green/10">
                        <Icon className="h-5 w-5 text-deep-green" />
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-text-primary">
                          {device.name}
                        </div>

                        <div className="mt-0.5 truncate text-xs text-muted-text">
                          {device.meta}
                        </div>
                      </div>
                    </div>

                    {device.status === 'Active' ? (
                      <span className="shrink-0 rounded-full bg-success-green/10 px-2.5 py-1 text-xs font-semibold text-success-green">
                        Active
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-text">
                        Known
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      <DashboardModal
        open={showDevices}
        title="Trusted Devices"
        onClose={() => setShowDevices(false)}
      >
        {devices.length === 0 ? (
          <p className="text-muted-text">No trusted devices were found.</p>
        ) : (
          <div className="max-h-[500px] space-y-4 overflow-y-auto pr-2">
            {devices.map((device) => {
              const Icon = device.icon

              return (
                <div
                  key={device.id}
                  className="flex items-center justify-between rounded-2xl border border-border-grey bg-card p-5"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-green/10">
                      <Icon className="h-6 w-6 text-deep-green" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold text-deep-green">
                        {device.name}
                      </h3>

                      <p className="mt-1 text-sm text-muted-text">
                        {device.meta}
                      </p>

                      <span
                        className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          device.status === 'Active'
                            ? 'bg-success-green/10 text-success-green'
                            : 'bg-muted text-muted-text'
                        }`}
                      >
                        {device.status}
                      </span>
                    </div>
                  </div>

                  {device.status !== 'Active' && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="lg"
                      onClick={() => unlinkDevice(device.id)}
                      className="ml-4 shrink-0 rounded-xl"
                    >
                      <Unplug className="h-4 w-4" />
                      Unlink Device
                    </Button>
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
