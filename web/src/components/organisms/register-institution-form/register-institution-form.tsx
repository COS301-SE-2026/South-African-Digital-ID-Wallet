'use client'

import { type ReactNode, type SyntheticEvent, useState } from 'react'
import { Check, CheckCircle2, Copy, Landmark } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Button, Text } from '@/components/atoms'
import { TextField, Dropdown } from '@/components/molecules'
import {
  institutionService,
  RegisterInstitutionResponse,
} from '@/services/institution-service'

const formatInstitutionType = (type: string) =>
  type.replace(/([a-z])([A-Z])/g, '$1 $2')

function FormSection({
  title,
  description,
  children,
}: Readonly<{ title: string; description: string; children: ReactNode }>) {
  return (
    <div className="grid grid-cols-1 gap-4 py-6 md:grid-cols-3 md:gap-8">
      <div>
        <Text
          as="h3"
          variant="sub-sm"
          className="!text-sm font-bold text-text-primary"
        >
          {title}
        </Text>
        <Text as="p" variant="sub-sm" className="mt-1 !text-xs text-muted-text">
          {description}
        </Text>
      </div>
      <div className="flex flex-col gap-5 md:col-span-2">{children}</div>
    </div>
  )
}

export const RegisterInstitutionForm = () => {
  const [typeValue, setTypeValue] = useState('')
  const [registeredInstitution, setRegisteredInstitution] =
    useState<RegisterInstitutionResponse | null>(null)
  const [copied, setCopied] = useState(false)

  const { mutate: doRegister, isPending } = useMutation({
    mutationFn: (formData: {
      institutionName: string
      institutionType: string
      verificationNumber: string
      adminId: string
    }) => institutionService.register(formData),
    onSuccess: (data: RegisterInstitutionResponse) => {
      setRegisteredInstitution(data)
      toast.success('Institution registered successfully!')
    },
    onError: () => {
      toast.error(
        'Failed to register institution. Please check your details and try again.'
      )
    },
  })

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    doRegister({
      institutionName: formData.get('institutionName') as string,
      institutionType: typeValue,
      verificationNumber: formData.get('verificationNumber') as string,
      adminId: formData.get('adminId') as string,
    })
  }

  async function handleCopyApiKey(apiKey: string) {
    try {
      await navigator.clipboard.writeText(apiKey)
      setCopied(true)
      toast.success('API key copied')
    } catch {
      toast.error('Could not copy the API key. Please copy it manually.')
    }
  }

  function handleRegisterAnother() {
    setRegisteredInstitution(null)
    setCopied(false)
  }

  if (registeredInstitution) {
    const details = [
      { label: 'Name', value: registeredInstitution.name },
      {
        label: 'Type',
        value: formatInstitutionType(registeredInstitution.type),
      },
      {
        label: 'Verification Number',
        value: registeredInstitution.verificationNumber,
      },
    ]

    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-green/10 text-primary-green">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <Text
              as="h2"
              variant="h4"
              className="!text-lg font-extrabold text-deep-green"
            >
              Institution Registered
            </Text>
            <Text as="p" variant="sub-sm" className="!text-sm text-muted-text">
              The new institution is now active on FlashID.
            </Text>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-black/10 rounded-2xl border border-black/10">
          {details.map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <Text
                as="span"
                variant="sub-sm"
                className="!text-sm text-muted-text"
              >
                {label}
              </Text>
              <Text
                as="span"
                variant="sub-sm"
                className="truncate !text-sm font-bold text-text-primary"
              >
                {value}
              </Text>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border-2 border-accent-gold bg-accent-gold/10 p-4">
          <Text
            as="p"
            variant="sub-sm"
            className="!text-sm font-bold text-deep-green"
          >
            API Key — copy this now, it will not be shown again
          </Text>
          <div className="mt-3 flex items-center gap-2">
            <code className="min-w-0 flex-1 break-all rounded-xl bg-card px-3 py-2 font-mono text-sm text-text-primary">
              {registeredInstitution.apiKey}
            </code>
            <button
              type="button"
              onClick={() => handleCopyApiKey(registeredInstitution.apiKey)}
              aria-label="Copy API key"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-card text-deep-green transition hover:bg-deep-green/10"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="button"
          variant="primary"
          className="w-full lg:w-full"
          onClick={handleRegisterAnother}
        >
          Register Another Institution
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-green/10 text-primary-green">
          <Landmark className="h-5 w-5" />
        </div>
        <div>
          <Text
            as="h2"
            variant="h4"
            className="!text-lg font-extrabold text-deep-green"
          >
            Register Institution
          </Text>
          <Text as="p" variant="sub-sm" className="!text-sm text-muted-text">
            Add a new organisation to the FlashID platform.
          </Text>
        </div>
      </div>

      <div className="mt-6 divide-y divide-black/10 border-y border-black/10">
        <FormSection
          title="Details"
          description="How the organisation will appear across FlashID."
        >
          <TextField
            name="institutionName"
            label="Institution Name"
            placeholder="Enter institution name"
            required
          />
          <Dropdown
            name="institutionType"
            label="Institution Type"
            value={typeValue}
            onChange={setTypeValue}
            options={[
              { value: 'HomeAffairs', label: 'Home Affairs' },
              { value: 'LicensingDepartment', label: 'Licensing Department' },
            ]}
          />
        </FormSection>

        <FormSection
          title="Verification"
          description="Confirms the organisation and links it to an administrator."
        >
          <TextField
            name="verificationNumber"
            label="Verification Number"
            placeholder="Enter verification number"
            required
          />
          <TextField
            name="adminId"
            label="Admin ID"
            placeholder="Enter admin ID"
            required
          />
        </FormSection>
      </div>

      <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Text as="p" variant="sub-sm" className="!text-xs text-muted-text">
          Double-check every field before submitting.
        </Text>
        <Button
          type="submit"
          variant="primary"
          LeftIcon={Landmark}
          iconClassName="h-5 w-5"
          className="sm:w-[180px] lg:w-[180px]"
          disabled={isPending}
        >
          {isPending ? 'Registering...' : 'Register'}
        </Button>
      </div>
    </form>
  )
}
