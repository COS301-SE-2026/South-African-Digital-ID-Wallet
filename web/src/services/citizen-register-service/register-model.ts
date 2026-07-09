import { RegisterFormValues } from './types'

export type RegisterBackendRow = {
  Email: string
  Password: string
}

export const registerFormModel = (
  row: RegisterBackendRow
): RegisterFormValues => {
  return {
    email: row.Email,
    password: row.Password,
  }
}
