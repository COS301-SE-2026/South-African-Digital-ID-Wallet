import { OnboardCitizenFormValues } from './types'

export const onboardCitizenDto = (formData: OnboardCitizenFormValues) => {
  return {
    SaId: formData.idNumber,
    Email: formData.email,
    PhoneNumber: formData.phoneNumber,
    ConsentGiven: formData.consentProvided,
  }
}
