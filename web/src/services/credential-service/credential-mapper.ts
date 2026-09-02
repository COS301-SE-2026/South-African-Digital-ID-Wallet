import type { CredentialResponse, CitizenSearchResult } from './types'
import type {
  CredentialDetail,
  CredentialType as ModalCredentialType,
} from '@/components/organisms/credential-details-modal/types'
import type { SearchResultRow } from '@/components/organisms/search-results-table/types'

const mapCredentialType = (
  type: CredentialResponse['type']
): ModalCredentialType =>
  type === 'DriversLicense' ? 'drivers-licence' : 'id-card'

const mapDisplayReference = (response: CredentialResponse): string => {
  if (response.driversLicense) {
    return response.driversLicense.licenseNumber
  }
  if (response.identityDocument) {
    return response.identityDocument.idNumber
  }
  return response.id
}

const mapExpiresOn = (response: CredentialResponse): string =>
  response.driversLicense?.expiryDate ?? ''

export const mapCredentialResponseToDetail = (
  response: CredentialResponse
): CredentialDetail => ({
  id: response.id,
  type: mapCredentialType(response.type),
  label: response.title,
  displayReference: mapDisplayReference(response),
  status: response.status,
  issuedOn: response.issueDate,
  expiresOn: mapExpiresOn(response),
  citizen: {
    fullName: response.citizen?.fullName ?? '',
    idNumber: response.citizen?.idNumber ?? '',
    dateOfBirth: response.citizen?.dateOfBirth ?? '',
    email: response.citizen?.email ?? '',
    phone: response.citizen?.phone ?? '',
    address: '',
  },
  issuedBy: {
    administrator: '',
    department: response.issuedBy,
    office: '',
    reference: '',
  },
  activity: {
    verifications: response.activity?.verifications ?? 0,
    lastVerifiedOn: response.activity?.lastVerifiedAt ?? '',
    lastVerifiedAt: response.activity?.lastVerifiedAt ?? '',
    devicesUsed: response.activity?.devicesUsed ?? 0,
  },
})
const mapInitials = (firstName: string, surname: string): string => {
  const first = firstName.trim().charAt(0).toUpperCase()
  const last = surname.trim().charAt(0).toUpperCase()
  return `${first}${last}`
}

export const mapCitizenSearchResultToRow = (
  result: CitizenSearchResult
): SearchResultRow => ({
  id: result.citizenId,
  initials: mapInitials(result.firstName, result.surname),
  firstName: result.firstName,
  surname: result.surname,
  idNumber: result.idNumber,
  dateJoined: result.dateJoined ?? '',
  expiresOn: result.expiresOn ?? '',
})
