import { RegisterInstitutionResponse } from './types'

export const institutionModel = (data: RegisterInstitutionResponse) => {
  return {
    institutionId: data.institutionId,
    name: data.name,
    type: data.type,
    apiKey: data.apiKey,
    apiKeyReference: data.apiKeyReference,
    verificationNumber: data.verificationNumber,
    createdAt: data.createdAt,
  }
}

export const formatInstitutionType = (type: string) =>
  type.replace(/([a-z])([A-Z])/g, '$1 $2')
