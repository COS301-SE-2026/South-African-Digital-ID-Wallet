'use client'

import * as React from 'react'
import { Monitor, Smartphone, Unplug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardModal } from '@/components/molecules/dashboard-modal/dashboard-modal'
import api from '@/lib/api'

import type {
  ManageUserTrustedDevice,
  ManageUserTrustedDeviceResponse,
} from './types'

export function ManageUserTrustedDevices() {
  const [devices, setDevices] = React.useState<ManageUserTrustedDevice[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showDevices, setShowDevices] = React.useState(false)

  React.useEffect(() => {
    const fetchTrustedDevices = async () => {
      try {
        const { data } = await api.get<ManageUserTrustedDeviceResponse[]>(
          '/api/trusted-devices/me'
        )

        const mappedDevices: ManageUserTrustedDevice[] = data.map((device) => ({
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

  if (loading) {
    return (
      <div className="bg-card flex h-full flex-col rounded-3xl border p-6">
        <h2 className="text-3xl font-bold">Trusted Devices</h2>

        <p className="mt-2 text-muted-text">Loading trusted devices...</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-card flex h-full flex-col rounded-3xl border p-6">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              Trusted Devices
            </h2>

            <p className="mt-2 text-muted-text">
              View and manage your devices.
            </p>
          </div>

          <Button
            variant="link"
            size="sm"
            onClick={() => setShowDevices(true)}
            className="text-green-700 hover:text-green-800"
          >
            Manage devices
          </Button>
        </div>

        <div className="flex-1 min-h-[175px] overflow-hidden rounded-3xl border">
          {devices.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-text">
                No trusted devices found.
              </p>
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-4">
              <div className="space-y-3">
                {devices.map((device) => {
                  const Icon = device.icon

                  return (
                    <div
                      key={device.id}
                      className="flex items-center justify-between rounded-2xl border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-muted p-3">
                          <Icon className="h-6 w-6" />
                        </div>

                        <div>
                          <h3 className="font-semibold">{device.name}</h3>

                          <p className="mt-1 text-sm text-muted-text">
                            {device.meta}
                          </p>
                        </div>
                      </div>

                      {device.status === 'Active' ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                          Known
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
