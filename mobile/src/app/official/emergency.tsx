import { usePreventScreenCapture } from 'expo-screen-capture'

import { EmergencyScanPage } from '@/components/pages'

export default function Emergency() {
  usePreventScreenCapture()
  return <EmergencyScanPage />
}
