'use client'

import { type SyntheticEvent, useState } from 'react'
import { User } from 'lucide-react'
import { Button, Text } from '@/components/atoms'
import { TextField, Dropdown } from '@/components/molecules'

export const RegisterInstitutionForm = () => {
  const [typeValue, setTypeValue] = useState('')

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Text variant="h1" className="mb-6 text-center">
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
          { value: 'home affairs', label: 'Home Affairs' },
          { value: 'licensing department', label: 'Licensing Department' },
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
        LeftIcon={User}
        iconClassName="h-5 w-5"
        className="w-full lg:w-full"
      >
        Register
      </Button>
    </form>
  )
}
