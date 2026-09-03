import { ShieldAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type VerificationFailureProps = {
  message: string
  onTryAgain: () => void
}

export function VerificationFailure({
  message,
  onTryAgain,
}: Readonly<VerificationFailureProps>) {
  return (
    <Card className="w-full max-w-xl rounded-3xl border border-destructive/20 bg-white shadow-xl">
      <CardContent className="flex flex-col items-center px-8 py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="size-8 text-destructive" />
        </div>

        <h2 className="mt-5 text-2xl font-semibold">
          Verification unsuccessful
        </h2>

        <p className="mt-3 max-w-md text-sm text-muted-foreground">{message}</p>

        <Button type="button" className="mt-8 w-full" onClick={onTryAgain}>
          Try Again
        </Button>
      </CardContent>
    </Card>
  )
}
