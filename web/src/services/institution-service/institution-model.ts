import { RegisterInstitutionResponse } from './types'

export const institutionModel = (data: RegisterInstitutionResponse) => {
  return {
    institutionId: data.institutionId,
    name: data.name,
    type: data.type,
    apiKeyReference: data.apiKeyReference,
    verificationNumber: data.verificationNumber,
    createdAt: data.createdAt,
  }
}
