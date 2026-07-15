import { IdentityRecord } from '@/types'
import { IdentityRecordStatus } from './types'

const mapStatus = (status?: string): IdentityRecordStatus => {
  return status === 'Not Found' ? 'Not Found' : 'Verified'
}

export const identityRecordModel = (row: IdentityRecord): IdentityRecord => {
  return {
    saId: row.saId ?? '',
    fullName: row.fullName ?? '',
    dateOfBirth: row.dateOfBirth?.split('T')[0] ?? '',
    status: mapStatus(row.status),
  }
}
