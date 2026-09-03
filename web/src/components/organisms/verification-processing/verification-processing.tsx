import { LoaderCircle, ShieldCheck } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

export function VerificationProcessing() {
  return (
    <Card className="w-full max-w-xl rounded-3xl border border-border/70 bg-deep-green text-white shadow-xl">
      <CardContent className="flex flex-col items-center px-8 py-14 text-center">
        <div className="relative flex size-24 items-center justify-center rounded-full border border-primary-green/40">
          <div className="absolute inset-2 rounded-full border border-primary-green/60" />

          <ShieldCheck className="size-10 text-primary-green" />
        </div>

        <h2 className="mt-7 text-2xl font-semibold">Verifying...</h2>

        <p className="mt-2 max-w-sm text-sm text-white/70">
          We&apos;re checking your liveness and comparing your identity with
          your government record.
        </p>

        <LoaderCircle className="mt-7 size-5 animate-spin text-primary-green" />

        <div className="mt-8 rounded-xl bg-white/5 px-5 py-4 text-xs text-white/65">
          This may take a few seconds. Please don&apos;t close this window.
        </div>
      </CardContent>
    </Card>
  )
}
