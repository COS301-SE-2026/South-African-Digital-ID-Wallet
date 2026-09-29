import { useLocalSearchParams } from 'expo-router'
import { usePreventScreenCapture } from 'expo-screen-capture'

import { CredentialDetailPage } from '@/components/pages'

export default function CredentialDetail() {
  usePreventScreenCapture()
  const { id } = useLocalSearchParams<{ id: string }>()
  return <CredentialDetailPage id={id} />
}
