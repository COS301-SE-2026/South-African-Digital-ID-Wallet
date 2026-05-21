export type VerificationMethod = 'activation' | 'physical'

export type RegistrationCredentials = {
  idnumber: string
  username: string
  password: string
  activationCode: string
  verificationMethod: VerificationMethod
}

export type RegistrationFormProps = {
  onSubmitAction?: (data: RegistrationCredentials) => void
}
