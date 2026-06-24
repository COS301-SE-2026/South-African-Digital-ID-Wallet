import { RegisterFormValues } from './types'

export const registerDto = (formData: RegisterFormValues) => {
  return {
    SaId: formData.id,
    Username: formData.username,
    Password: formData.password,
  }
}
