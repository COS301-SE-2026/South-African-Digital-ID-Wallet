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
      <div className="mb-4 flex justify-center gap-4">
        <Text variant="h1">Register Institution</Text>
      </div>
      <div className="w-full">
        <TextField
          name="institutionName"
          label="Institution Name"
          placeholder="Enter institution name"
          required
        />
      </div>
      <div className="w-full">
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
      </div>
      <div className="w-full">
        <TextField
          name="adminId"
          label="Admin ID"
          placeholder="Enter admin ID"
          required
        />
      </div>
      <div className="w-full">
        <Button
          type="submit"
          variant="primary"
          LeftIcon={User}
          iconClassName="h-5 w-5"
          style={{ width: '100%' }}
        >
          Register
        </Button>
      </div>
      <div className="mt-4 w-full text-center">
        <p className="text-sm text-neutral-mid-grey">
          Already have an account?{' '}
          <a
            href="/login"
            className="text-primary-green font-semibold hover:text-deep-green"
          >
            Log In
          </a>
        </p>
      </div>
    </form>
  )
}
