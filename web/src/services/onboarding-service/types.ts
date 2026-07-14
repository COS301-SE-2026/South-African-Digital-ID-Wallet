export type OnboardCitizenFormValues = {
  idNumber: string
  email: string
  phoneNumber: string
  consentProvided: boolean
}

export type OnboardCitizenResponse = {
  citizenId: string
  idNumber: string
  actvationPin: string
  activationExpiresAt: string
  status: string
}

export type IdentityRecordStatus = 'Verified' | 'Not Found'
