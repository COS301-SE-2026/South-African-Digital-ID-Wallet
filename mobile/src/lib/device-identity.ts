import * as SecureStore from 'expo-secure-store'

const DEVICE_TOKEN_KEY = 'flashid.device-token'

export const saveDeviceToken = (token: string) =>
  SecureStore.setItemAsync(DEVICE_TOKEN_KEY, token, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  })

export const loadDeviceToken = () => SecureStore.getItemAsync(DEVICE_TOKEN_KEY)

export const clearDeviceToken = () =>
  SecureStore.deleteItemAsync(DEVICE_TOKEN_KEY)
