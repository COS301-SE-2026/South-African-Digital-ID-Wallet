import { RegisterFormValues } from './types'

export type RegisterBackendRow = {
  SaId: string
  Username: string
  Password: string
}

export const registerFormModel = (
  row: RegisterBackendRow
): RegisterFormValues => {
  return {
    id: row.SaId,
    username: row.Username,
    password: row.Password,
  }
}
