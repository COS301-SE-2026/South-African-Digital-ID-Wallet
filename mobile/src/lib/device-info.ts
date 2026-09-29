import * as Device from 'expo-device'
import { Platform } from 'react-native'

export type DeviceDescription = {
  browser: string
  deviceName: string
  deviceType: 'Mobile' | 'Tablet'
  operatingSystem: string
}

export const describeDevice = (): DeviceDescription => ({
  browser: 'FlashID App',
  deviceName: Device.modelName ?? Device.deviceName ?? 'FlashID mobile app',
  deviceType:
    Device.deviceType === Device.DeviceType.TABLET ? 'Tablet' : 'Mobile',
  operatingSystem: [Device.osName ?? Platform.OS, Device.osVersion]
    .filter(Boolean)
    .join(' '),
})
