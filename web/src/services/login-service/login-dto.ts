import type { LoginFormValues } from './types'

export const loginDto = (formData: LoginFormValues) => {
  return {
    email: formData.email,
    password: formData.password,
  }
}
