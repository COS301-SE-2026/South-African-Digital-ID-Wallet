export type CitizenStatus =
  | 'Activated'
  | 'Deactivated'
  | 'Pending'
  | 'Suspended'
  | 'Verified'

export type CredentialStatus =
  | 'Active'
  | 'Expired'
  | 'Inactive'
  | 'Investigation'
  | 'Revoked'

export type CredentialType = 'DriversLicense' | 'IdentityDocument'

export type ExistingCredential = {
  issueDate: string
  status: CredentialStatus
  type: CredentialType
}

export type CitizenCredentialStatus = {
  activatedAt: string | null
  dateOfBirth: string
  email: string | null
  existingCredentials: ExistingCredential[]
  names: string
  phoneNumber: string | null
  saId: string
  status: CitizenStatus
  surname: string
}

export type DriversLicenseDetails = {
  expiryDate: string
  licenseCode: string
  licenseNumber: string
  restrictions: string
}

export type IssuedCredential = {
  driversLicense?: DriversLicenseDetails
  id: string
  issueDate: string
  issuedBy: string
  status: CredentialStatus
  title: string
  type: CredentialType
}
