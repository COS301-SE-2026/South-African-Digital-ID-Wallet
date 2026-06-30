import { RegisterFormValues, VerifyEmailValues } from './types'

export const registerDto = (formData: RegisterFormValues) => {
  return {
    Email: formData.email,
    Password: formData.password,
  }
}
