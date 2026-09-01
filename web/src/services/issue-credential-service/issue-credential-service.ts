import { AxiosResponse } from 'axios'

import api from '@/lib/api'
import { CitizenCredentialStatus, IssuedCredential } from '@/types'

import { issueCredentialDto } from './issue-credential-dto'
import {
  citizenCredentialStatusModel,
  issuedCredentialModel,
} from './issue-credential-model'
import issueCredentialUrls from './issue-credential-urls'
import { IssueCredentialApi, IssueCredentialFormValues } from './types'

const getCitizenStatus = (saId: string): Promise<CitizenCredentialStatus> => {
  const url = issueCredentialUrls.citizenStatus(saId)
  return api
    .get(url)
    .then((res: AxiosResponse) => citizenCredentialStatusModel(res.data))
}

const issueCredential = (
  formValues: IssueCredentialFormValues
): Promise<IssuedCredential> => {
  const url = issueCredentialUrls.issueCredential()
  const dto = issueCredentialDto(formValues)
  return api
    .post(url, dto)
    .then((res: AxiosResponse) => issuedCredentialModel(res.data))
}

const service: IssueCredentialApi = { getCitizenStatus, issueCredential }

export default service
