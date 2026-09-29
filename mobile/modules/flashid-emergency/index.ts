import { requireNativeModule } from 'expo'
import { Platform } from 'react-native'

export type GeneratedEmergencyKey = {
  isStrongBoxBacked: boolean
  publicKeySpki: string
}

export type FlashidEmergencyModule = {
  disableEmergency: () => Promise<void>
  generateEmergencyKey: () => Promise<GeneratedEmergencyKey>
  isConfigured: () => Promise<boolean>
  requestAddTile: () => Promise<boolean>
  setEmergencyHandle: (handleBase64Url: string) => Promise<void>
  setOfflineBundle: (json: string) => Promise<void>
}

export const unsupported: FlashidEmergencyModule = {
  disableEmergency: async () => {},
  generateEmergencyKey: async () => {
    throw new Error(
      'The FlashID emergency button is only available on Android.'
    )
  },
  isConfigured: async () => false,
  requestAddTile: async () => false,
  setEmergencyHandle: async () => {},
  setOfflineBundle: async () => {},
}

export default Platform.OS === 'android'
  ? requireNativeModule<FlashidEmergencyModule>('FlashidEmergency')
  : unsupported
