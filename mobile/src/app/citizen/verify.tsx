import { usePreventScreenCapture } from 'expo-screen-capture'

import { QrScannerPage } from '@/components/pages'

export default function Verify() {
  usePreventScreenCapture()
  return <QrScannerPage />
}
