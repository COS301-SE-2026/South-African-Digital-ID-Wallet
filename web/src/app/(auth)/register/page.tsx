import { CitizenRegistrationPage } from '@/components/pages/citizen/citizen-registration-page'
import { Suspense } from 'react'
export default function CitizenRegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CitizenRegistrationPage />
    </Suspense>
  )
}
