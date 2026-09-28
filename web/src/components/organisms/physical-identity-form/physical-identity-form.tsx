'use client'

import { ArrowLeft, ScanFace, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type PhysicalIdentityFormProps = {
  saId: string
  errorMessage?: string
  isSubmitting?: boolean
  onSaIdChange: (value: string) => void
  onContinue: () => void
  onBack: () => void
}

export function PhysicalIdentityForm({
  saId,
  errorMessage,
  isSubmitting = false,
  onSaIdChange,
  onContinue,
  onBack,
}: Readonly<PhysicalIdentityFormProps>) {
  return (
    <Card className="w-full rounded-3xl border border-border/70 bg-white shadow-xl shadow-deep-green/10">
      <CardHeader className="space-y-5 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-green/10">
          <ScanFace className="size-7 text-primary-green" />
        </div>

        <div>
          <CardTitle className="text-2xl font-semibold text-deep-green">
            Verify your identity
          </CardTitle>

          <p className="mt-2 text-sm text-muted-foreground">
            Enter your South African ID number to begin secure facial
            verification.
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="physical-sa-id">South African ID number</Label>

          <Input
            id="physical-sa-id"
            inputMode="numeric"
            maxLength={13}
            value={saId}
            placeholder="Enter your 13-digit ID number"
            onChange={(event) =>
              onSaIdChange(event.target.value.replace(/\D/g, ''))
            }
          />

          <p className="text-xs text-muted-foreground">
            You can find this on your South African identity document.
          </p>
        </div>

        {errorMessage && (
          <p role="alert" className="text-sm text-destructive">
            {errorMessage}
          </p>
        )}

        <Button
          type="button"
          className="w-full"
          disabled={isSubmitting || saId.length !== 13}
          onClick={onContinue}
        >
          {isSubmitting ? 'Preparing...' : 'Continue'}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onBack}
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Button>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-primary-green" />
          Your information is protected by FlashID
        </div>
      </CardContent>
    </Card>
  )
}
