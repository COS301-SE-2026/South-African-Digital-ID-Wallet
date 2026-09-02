'use client'

import VerificationReadyDialog from '@/components/organisms/verification-ready-dialog/verification-ready-dialog'

export default function Page() {
  return (
    <VerificationReadyDialog
      open={true}
      loading={false}
      onOpenChange={(open) => {
        console.log('Dialog open:', open)
      }}
      onStart={() => {
        console.log('Start verification clicked')
      }}
    />
  )
}
