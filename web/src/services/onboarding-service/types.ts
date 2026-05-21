export type OnboardCitizenFormValues = {
  idNumber: string
  email: string
  phoneNumber: string
  consentProvided: boolean
}

export type OnboardCitizenResponse = {
  citizenId: string
  idNumber: string
  firstName: string
  lastName: string
  status: string
  message: string
}

export type IdentityRecordBackendResponse = {
  idNumber?: string
  saId?: string
  firstName?: string
  names?: string
  surname?: string
  lastName?: string
  fullName?: string
  dateOfBirth?: string
  status?: string
}

export type IdentityRecordStatus = 'Verified' | 'Not Found'
