export type RegistrationCredentials = {
  idnumber: string
  username: string
  password: string
}

export type RegistrationFormProps = {
  onSubmitAction?: (data: RegistrationCredentials) => void
}
