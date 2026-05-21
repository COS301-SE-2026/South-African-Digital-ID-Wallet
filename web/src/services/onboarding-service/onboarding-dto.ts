import { OnboardCitizenFormValues } from './types'

export const onboardCitizenDto = (formData: OnboardCitizenFormValues) => {
  return {
    idNumber: formData.idNumber,
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phoneNumber: formData.phoneNumber,
  }
}
