'use client'
import { LockKeyhole, ShieldCheck, UnlockKeyhole } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { VerifyIdentityCardProps } from './types'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { ProgressStepper } from '@/components/molecules'

const DEFAULT_STEPS = ['Verify Identity', 'Activate Credentials', 'Complete']

export function VerifyIdentityCard({
  steps = DEFAULT_STEPS,
  currentStep = 1,
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
    <Card className="w-full rounded-lg border-border/70 bg-card shadow-xl shadow-deep-green/10">
      <CardHeader className="space-y-6">
        <ProgressStepper steps={steps} currentStep={currentStep} />
        <div>
          <CardTitle className="font-semibold text-2xl text-deep-green">
            Verify your identity
          </CardTitle>

          <p className="mt-1 max-w-xl leading-7 text-muted-foreground">
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
              className="rounded-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activation-pin">6-digit activation PIN</Label>

            <InputOTP maxLength={6} value={pin} onChange={onPinChange}>
              <InputOTPGroup className="mx-auto flex w-fit justify-center gap-5">
                {Array.from({ length: 6 }).map((_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="flex-1 h-12 w-12 rounded-md border border-input
                                                    text-center text-xl shadow-sm
                                                    first:rounded-md last:rounded-md
                                                    data-[active=true]:border-primary-green
                                                    data-[active=true]:ring-2
                                                    data-[active=true]:ring-primary-green/20
        "
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>

            {onRequestNewPin && (
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 "
                onClick={onRequestNewPin}
              >
                Didn&apos;t receive a PIN?
              </Button>
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
                className="w-full rounded-md"
                disabled={
                  isSubmitting || saId.length !== 13 || pin.length !== 6
                }
              >
                {isSubmitting ? (
                  <UnlockKeyhole className="mr-2 h-4 w-4" />
                ) : (
                  <LockKeyhole className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
              </Button>

              <div className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck
                  className="size-5 text-primary"
                  aria-hidden="true"
                />
                <span>Your information is safe with FlashID</span>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
