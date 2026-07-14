'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, ShieldAlert } from 'lucide-react'
import type { RetrieveIdentityRecordProps } from './types'

export const RetrieveIdentityRecord = ({
  idNumber,
  setIdNumber,
  idConsent,
  setConsent,
  record,
  retrieveIdentityRecord,
  errors,
  setErrors,
}: RetrieveIdentityRecordProps) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          <p className="font-medium ">Retrieve Identity Record</p>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="idNumber"> Citizen ID Number </Label>

          <Input
            id="idNumber"
            placeholder="Enter South African ID number"
            value={idNumber}
            onChange={(event) => {
              setIdNumber(event.target.value)

              setErrors({
                ...errors,
                idNumber: '',
              })
            }}
          />

          {errors.idNumber && (
            <div className="mt-2 flex items-center gap-2 rounded-md border border-danger-red/55 bg-danger-red/5 px-3 py-2">
              <span className="text-danger-red">
                <ShieldAlert className="h=1 w=1" />
              </span>
              <p className="text-sm font-medium text-danger-red">
                {errors.idNumber}
              </p>
            </div>
          )}

          <label className="flex items-start gap-3 rounded-xl border p-4">
            <input
              type="checkbox"
              checked={idConsent}
              onChange={(event) => {
                setConsent(event.target.checked)
                setErrors({
                  ...errors,
                  phone: '',
                })
              }}
              className="mt-1"
            />
            <span className="text-sm">
              Citizen has provided explicit consent to retrieve Identity Record.
            </span>
          </label>

          {errors.idConsent && (
            <div className="mt-2 flex items-center gap-2 rounded-md border border-danger-red/55 bg-danger-red/5 px-3 py-2">
              <span className="text-danger-red">
                <ShieldAlert className="h=1 w=1" />
              </span>
              <p className="text-sm font-medium text-danger-red">
                {errors.idConsent}
              </p>
            </div>
          )}

          <Button
            className="bg-deep-green text-clean-white hover:bg-deep-green/70"
            onClick={retrieveIdentityRecord}
            disabled={!idNumber || !idConsent}
          >
            Retrieve from Government Registry
          </Button>

          {record && (
            <div className="rounded-xl border p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">Verified Identity Record</h3>
                <Badge
                  className={
                    record.status === 'Verified'
                      ? 'bg-success-green text-clean-white'
                      : 'bg-danger-red text-clean-white'
                  }
                >
                  {record.status}
                </Badge>
              </div>

              <div className="grid gap-2 text-sm md:grid-cols-3">
                <p>
                  <strong>Name:</strong> {record.fullName}
                </p>
                <p>
                  <strong>ID:</strong> {record.saId}
                </p>
                <p>
                  <strong>DOB:</strong> {record.dateOfBirth}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
