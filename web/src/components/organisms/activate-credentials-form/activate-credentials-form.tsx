import { IdCard, Car, ShieldCheck } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button, Text } from '@/components/atoms'
import { CredentialCard } from '@/components/molecules'
import type { ActivateCredentialsFormProps } from './types'

const INFO_BULLETS = [
  'Prove your identity instantly',
  'Share only what\u2019s needed',
  'Secure, tamper-proof & private',
  'Accepted by participating institutions',
]

export function ActivateCredentialsForm({
  selection,
  onSelectionChange,
  onSubmit,
  onBack,
  isSubmitting = false,
}: Readonly<ActivateCredentialsFormProps>) {
  const noneSelected = !selection.identityDocument && !selection.driversLicense

  return (
    <Card className="rounded-3xl border border-border/70 bg-white p-6 shadow-xl shadow-deep-green/10 md:p-8 lg:p-10">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <CredentialCard
            icon={IdCard}
            title="South African Identity Document"
            description="Your verified national identity document."
            activated={selection.identityDocument}
            onToggle={(activated) =>
              onSelectionChange({ ...selection, identityDocument: activated })
            }
          />

          <CredentialCard
            icon={Car}
            title="Driver's Licence"
            description="Your verified driver's licence credential."
            activated={selection.driversLicense}
            onToggle={(activated) =>
              onSelectionChange({ ...selection, driversLicense: activated })
            }
          />

          <Card className="gap-3 bg-amber-50 p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck
                className="size-5 text-amber-700"
                aria-hidden="true"
              />
              <Text variant="sub-md" className="font-bold text-amber-900">
                Why activate credentials?
              </Text>
            </div>
            <ul className="space-y-1.5">
              {INFO_BULLETS.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-amber-700" />
                  <Text variant="sub-sm" className="text-amber-900">
                    {bullet}
                  </Text>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={onBack} disabled={isSubmitting}>
            Back
          </Button>
          <Button
            variant="primary"
            className="flex-1 lg:w-full"
            onClick={onSubmit}
            disabled={noneSelected || isSubmitting}
            isLoading={isSubmitting}
          >
            Activate selected credentials
          </Button>
        </div>
      </div>
    </Card>
  )
}
