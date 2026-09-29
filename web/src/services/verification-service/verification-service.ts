import { AxiosResponse } from 'axios'
import api from '@/lib/api'
import verificationUrls from './verification-urls'
import {
  VerifyCitizenRequest,
  VerifyCitizenResponse,
  CreateLivenessSessionResponse,
  PhysicalVerificationResponse,
  StartPhysicalVerificationResponse,
} from './types'

const verify = (
  request: VerifyCitizenRequest
): Promise<VerifyCitizenResponse> => {
  const url = verificationUrls.verify()
  return api
    .post(url, request)
    .then((res: AxiosResponse<VerifyCitizenResponse>) => res.data)
}

const startPhysicalVerification =
  (): Promise<StartPhysicalVerificationResponse> => {
    const url = verificationUrls.physical.start()
    return api
      .post(url)
      .then((res: AxiosResponse<StartPhysicalVerificationResponse>) => res.data)
  }

const grantPhysicalConsent = (
  verificationId: string
): Promise<PhysicalVerificationResponse> => {
  const url = verificationUrls.physical.consent(verificationId)
  return api
    .post(url)
    .then((res: AxiosResponse<PhysicalVerificationResponse>) => res.data)
}

const createLivenessSession = (
  verificationId: string,
  saId: string
): Promise<CreateLivenessSessionResponse> => {
  const url = verificationUrls.physical.createLivenessSession()
  return api
    .post(url, { verificationId, saId })
    .then((res: AxiosResponse<CreateLivenessSessionResponse>) => res.data)
}

const completeLiveness = (
  verificationId: string
): Promise<PhysicalVerificationResponse> => {
  const url = verificationUrls.physical.completeLiveness(verificationId)
  return api
    .post(url)
    .then((res: AxiosResponse<PhysicalVerificationResponse>) => res.data)
}

const getPhysicalVerification = (
  verificationId: string
): Promise<PhysicalVerificationResponse> => {
  const url = verificationUrls.physical.get(verificationId)
  return api
    .get(url)
    .then((res: AxiosResponse<PhysicalVerificationResponse>) => res.data)
}

export default {
  verify,
  startPhysicalVerification,
  grantPhysicalConsent,
  createLivenessSession,
  completeLiveness,
  getPhysicalVerification,
}
