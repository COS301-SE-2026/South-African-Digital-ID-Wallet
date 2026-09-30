import { usePreventScreenCapture } from 'expo-screen-capture'

import { EmergencyProfilePage } from '@/components/pages'

export default function Emergency() {
  usePreventScreenCapture()
  return <EmergencyProfilePage />
}
