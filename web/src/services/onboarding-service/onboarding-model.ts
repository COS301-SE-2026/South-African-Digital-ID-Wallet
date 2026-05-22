import { IdentityRecord } from '@/types'
import { IdentityRecordStatus, IdentityRecordBackendResponse } from './types'

const mapStatus = (status?: string): IdentityRecordStatus => {
  return status === 'Not Found' ? 'Not Found' : 'Verified'
}

export const identityRecordModel = (
  row: IdentityRecordBackendResponse
): IdentityRecord => {
  const firstName = row.firstName ?? row.names ?? ''
  const surname = row.surname ?? row.lastName ?? ''

  return {
    idNumber: row.saId ?? row.idNumber ?? '',
    fullName: row.fullName ?? `${firstName} ${surname}`.trim(),
    dateOfBirth: row.dateOfBirth ?? '',
    status: mapStatus(row.status),
  }
}
