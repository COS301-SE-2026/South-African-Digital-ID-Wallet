import { IssueCredentialFormValues } from './types'

export const issueCredentialDto = (formValues: IssueCredentialFormValues) => {
  return {
    consentGiven: formValues.consentGiven,
    credentialType: formValues.credentialType,
    saId: formValues.saId,
  }
}
