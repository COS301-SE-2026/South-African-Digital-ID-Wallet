import { useNetInfo } from '@react-native-community/netinfo'

export const useNetworkStatus = () => {
  const { isConnected, isInternetReachable } = useNetInfo()

  const isOffline = isConnected === false || isInternetReachable === false

  return {
    isOffline,
    isOnline: !isOffline,
    isStatusKnown: isConnected !== null && isInternetReachable !== null,
  }
}
