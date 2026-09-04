'use client'

import { Camera, CircleUserRound, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ProgressStepper, ReadyItem } from '@/components/molecules'

const LIVENESS_STEPS = [
  'Enter SA ID ',
  'Consent',
  'Ready to verify',
  'Camera & Liveness',
]

interface VerificationReadyDialogProps {
  open: boolean
  loading?: boolean
  onOpenChange: (open: boolean) => void
  onStart: () => void
}

const VerificationReadyDialog = ({
  open,
  loading = false,
  onOpenChange,
  onStart,
}: VerificationReadyDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <div className="mb-6">
          <ProgressStepper steps={LIVENESS_STEPS} currentStep={3} />
        </div>
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-2xl font-semibold">
            Ready to verify
          </DialogTitle>

          <DialogDescription>
            We&apos;ll guide you through a few quick steps.
          </DialogDescription>
        </DialogHeader>

        <div>
          <ReadyItem
            icon={Sun}
            title="You're in a well-lit area."
            description="Natural light works best."
          />

          <ReadyItem
            icon={CircleUserRound}
            title="Your face is clearly visible."
            description="No sunglasses, hats or masks."
          />

          <ReadyItem
            icon={Camera}
            title="Your camera is ready."
            description="Keep your face centred and follow the on-screen instructions."
          />
        </div>

        <Button
          className="mt-6 h-11 w-full"
          onClick={onStart}
          disabled={loading}
        >
          {loading ? 'Preparing camera...' : 'Start Verification'}
        </Button>

        <Button
          variant="ghost"
          className=" w-full"
          onClick={() => onOpenChange(false)}
          disabled={loading}
        >
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default VerificationReadyDialog
