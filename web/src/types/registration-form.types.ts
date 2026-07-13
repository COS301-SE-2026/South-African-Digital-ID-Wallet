export type RegistrationCredentials = {
  email: string
  password: string
}

export type RegistrationFormProps = {
  onSubmitAction?: (data: RegistrationCredentials) => void
}
