'use client'

import { type SyntheticEvent, useState } from 'react'
import { Landmark } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Button, Text } from '@/components/atoms'
import { TextField, Dropdown } from '@/components/molecules'
import {
  institutionService,
  RegisterInstitutionResponse,
} from '@/services/institution-service'

export const RegisterInstitutionForm = () => {
  const [typeValue, setTypeValue] = useState('')
  const [registeredInstitution, setRegisteredInstitution] =
    useState<RegisterInstitutionResponse | null>(null)

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

  if (registeredInstitution) {
    return (
      <div className="flex flex-col gap-6">
        <Text variant="h1" className="mb-2 text-center text-green-700">
          Institution Registered!
        </Text>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex flex-col gap-3">
          <div>
            <Text variant="sub-sm" className="text-gray-500">
              Institution Name
            </Text>
            <Text variant="sub-md">{registeredInstitution.name}</Text>
          </div>
          <div>
            <Text variant="sub-sm" className="text-gray-500">
              Institution Type
            </Text>
            <Text variant="sub-md">{registeredInstitution.type}</Text>
          </div>
          <div>
            <Text variant="sub-sm" className="text-gray-500">
              Verification Number
            </Text>
            <Text variant="sub-md">
              {registeredInstitution.verificationNumber}
            </Text>
          </div>
          <div>
            <Text variant="sub-sm" className="text-gray-500 font-semibold">
              API Key — Copy this now, it will not be shown again
            </Text>
            <Text
              variant="sub-md"
              className="break-all font-mono text-sm bg-gray-100 rounded p-2"
            >
              {registeredInstitution.apiKey}
            </Text>
          </div>
        </div>
        <Button
          type="button"
          variant="primary"
          className="w-full lg:w-full"
          onClick={() => setRegisteredInstitution(null)}
        >
          Register Another Institution
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Text as="h1" variant="h1" className="mb-6 text-center">
        Register Institution
      </Text>

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

      <Button
        type="submit"
        variant="primary"
        LeftIcon={Landmark}
        iconClassName="h-5 w-5"
        className="w-full lg:w-full"
        disabled={isPending}
      >
        {isPending ? 'Registering...' : 'Register'}
      </Button>
    </form>
  )
}
