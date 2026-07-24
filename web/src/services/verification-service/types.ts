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
