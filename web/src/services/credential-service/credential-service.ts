import { AxiosResponse } from 'axios'
import api from '@/lib/api'
import credentialUrls from './credential-urls'
import type {
  CredentialResponse,
  RevokeCredentialRequest,
  RevokeCredentialResponse,
  ReinstateCredentialRequest,
  ReinstateCredentialResponse,
  SearchCitizensResponse,
} from './types'

const getMine = (): Promise<CredentialResponse[]> => {
  const url = credentialUrls.getMine()
  return api
    .get(url)
    .then((res: AxiosResponse<CredentialResponse[]>) => res.data)
}

const revoke = (
  credentialId: string,
  request: RevokeCredentialRequest
): Promise<RevokeCredentialResponse> => {
  const url = credentialUrls.revoke(credentialId)
  return api
    .post(url, request)
    .then((res: AxiosResponse<RevokeCredentialResponse>) => res.data)
}
const reinstate = (
  credentialId: string,
  request: ReinstateCredentialRequest
): Promise<ReinstateCredentialResponse> => {
  const url = credentialUrls.reinstate(credentialId)
  return api
    .post(url, request)
    .then((res: AxiosResponse<ReinstateCredentialResponse>) => res.data)
}
const search = (
  query: string,
  page: number,
  pageSize: number
): Promise<SearchCitizensResponse> => {
  const url = credentialUrls.search(query, page, pageSize)
  return api
    .get(url)
    .then((res: AxiosResponse<SearchCitizensResponse>) => res.data)
}
const getCredentialsForCitizen = (
  citizenId: string
): Promise<CredentialResponse[]> => {
  const url = credentialUrls.citizen(citizenId)
  return api
    .get(url)
    .then((res: AxiosResponse<CredentialResponse[]>) => res.data)
}
const credentialService = {
  getMine,
  revoke,
  reinstate,
  search,
  getCredentialsForCitizen,
}

export default credentialService
