export type RegistrationCredentials = {
  idnumber: string
  username: string
  password: string
  activationCode: string
}

export type RegistrationFormProps = {
  onSubmitAction?: (data: RegistrationCredentials) => void
}
