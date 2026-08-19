import type { LoginFormValues } from './types'

export const loginDto = (formData: LoginFormValues) => ({
  email: formData.email.trim(),
  password: formData.password,
  rememberMe: true,
})
