export type LoginCredentials = {
  email: string
  password: string
}

export type LoginFormProps = {
  onSubmitAction?: (data: LoginCredentials) => void
}
