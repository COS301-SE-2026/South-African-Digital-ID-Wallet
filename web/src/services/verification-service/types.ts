export type VerifyCitizenRequest = {
  token: string
  saId: string
  pin: string
}

export type VerifyCitizenResponse = {
  citizenId: string
  status: string
  isVerified: boolean
  message: string
}

export type IdentityVerificationStatus =
  | 'AwaitingConsent'
  | 'AwaitingDocument'
  | 'DocumentProcessing'
  | 'AwaitingIdConfirmation'
  | 'AwaitingLiveness'
  | 'LivenessProcessing'
  | 'AwaitingRegistryVerification'
  | 'Verified'
  | 'Failed'
  | 'Expired'

export interface StartPhysicalVerificationResponse {
  verificationId: string
  status: IdentityVerificationStatus
  expiresAt: string
}

export interface PhysicalVerificationResponse {
  verificationId: string
  status: IdentityVerificationStatus
  registryIdentityMatched: boolean | null
  livenessPassed: boolean | null
  registryFaceMatched: boolean | null
  expiresAt: string
  verifiedAt: string | null
  failureReason: string | null
}

export interface CreateLivenessSessionRequest {
  verificationId: string
  saId: string
}

export interface CreateLivenessSessionResponse {
  sessionId: string
  authToken: string
  status: string | null
}
