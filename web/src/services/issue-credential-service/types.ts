import {
  CitizenCredentialStatus,
  CredentialType,
  IssuedCredential,
} from '@/types'

export type IssueCredentialFormValues = {
  consentGiven: boolean
  credentialType: CredentialType
  saId: string
}

export type IssueCredentialApi = {
  getCitizenStatus: (saId: string) => Promise<CitizenCredentialStatus>
  issueCredential: (
    formValues: IssueCredentialFormValues
  ) => Promise<IssuedCredential>
}
