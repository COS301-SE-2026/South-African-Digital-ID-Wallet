import { CitizenCredentialStatus, IssuedCredential } from '@/types'

const toDateOnly = (value?: string | null): string => value?.split('T')[0] ?? ''

export const citizenCredentialStatusModel = (
  row: CitizenCredentialStatus
): CitizenCredentialStatus => {
  return {
    activatedAt: row.activatedAt ? toDateOnly(row.activatedAt) : null,
    dateOfBirth: toDateOnly(row.dateOfBirth),
    email: row.email ?? null,
    existingCredentials: (row.existingCredentials ?? []).map((credential) => ({
      issueDate: toDateOnly(credential.issueDate),
      status: credential.status,
      type: credential.type,
    })),
    names: row.names ?? '',
    phoneNumber: row.phoneNumber ?? null,
    saId: row.saId ?? '',
    status: row.status,
    surname: row.surname ?? '',
  }
}

export const issuedCredentialModel = (
  row: IssuedCredential
): IssuedCredential => {
  return {
    ...row,
    driversLicense: row.driversLicense
      ? {
          ...row.driversLicense,
          expiryDate: toDateOnly(row.driversLicense.expiryDate),
        }
      : undefined,
    issueDate: toDateOnly(row.issueDate),
  }
}
