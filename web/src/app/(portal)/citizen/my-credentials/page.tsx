import { Suspense } from 'react'
import { MyCredentialsPage } from '@/components/pages'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MyCredentialsPage />
    </Suspense>
  )
}
