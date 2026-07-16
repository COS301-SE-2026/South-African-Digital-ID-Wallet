'use client'
import { LockKeyhole, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { VerifyIdentityCardProps } from './types'
import { ActivationProgress } from '@/components/molecules/activation-progress-bar'

export function VerifyIdentityCard({
  saId,
  pin,
  isSubmitting = false,
  errorMessage,
  onSaIdChange,
  onPinChange,
  onSubmit,
  onRequestNewPin,
}: VerifyIdentityCardProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <Card className="w-full rounded-3xl border-border/70 bg-card shadow-xl shadow-deep-green/10">
      <CardHeader className="space-y-6">
        <ActivationProgress currentStep={1} />
        <div>
          <CardTitle className="text-2xl text-deep-green">
            Verify your identity
          </CardTitle>

          <p className="mt-3 max-w-xl leading-7 text-muted-foreground">
            Enter your South African ID number and the 6-digit activation PIN.
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="sa-id">South African ID number</Label>

            <Input
              id="sa-id"
              value={saId}
              inputMode="numeric"
              maxLength={13}
              placeholder="Enter your 13-digit ID number"
              onChange={(event) =>
                onSaIdChange(event.target.value.replace(/\D/g, ''))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activation-pin">6-digit activation PIN</Label>

            <Input
              id="activation-pin"
              value={pin}
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter your PIN"
              className="tracking-[0.5em]"
              onChange={(event) =>
                onPinChange(event.target.value.replace(/\D/g, ''))
              }
            />

            {onRequestNewPin && (
              <button
                type="button"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                onClick={onRequestNewPin}
              >
                Didn&apos;t receive a PIN?
              </button>
            )}

            <div>
              {errorMessage && (
                <p role="alert" className="text-sm text-destructive">
                  {errorMessage}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={
                  isSubmitting || saId.length !== 13 || pin.length !== 6
                }
              >
                <LockKeyhole className="size-4" />
                {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck
                  className="size-4 text-primary"
                  aria-hidden="true"
                />
              </div>

              <span>Your information is safe with FlashID</span>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
