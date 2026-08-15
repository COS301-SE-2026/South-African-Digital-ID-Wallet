import { RegisterInstitutionFormValues } from './types'

export const registerInstitutionDto = (
  formData: RegisterInstitutionFormValues
) => {
  return {
    name: formData.institutionName,
    type: formData.institutionType === 'HomeAffairs' ? 0 : 1,
    verificationNumber: formData.verificationNumber,
    adminId: formData.adminId,
    contactEmail: formData.contactEmail,
  }
}
