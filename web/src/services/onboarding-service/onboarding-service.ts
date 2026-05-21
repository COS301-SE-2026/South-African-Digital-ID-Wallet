import axios, { AxiosResponse } from 'axios'

import onboardingUrls from './onboarding-urls'
import { onboardCitizenDto } from './onboarding-dto'
import { OnboardCitizenFormValues, OnboardCitizenResponse } from './types'

import { IdentityRecord } from '@/types'
import { identityRecordModel } from './onboarding-model'

const retrieveIdentityRecord = (idNumber: string): Promise<IdentityRecord> => {
  const url = onboardingUrls.retrieveIdentityRecord(idNumber)

  return axios
    .get(url)
    .then((res: AxiosResponse) => identityRecordModel(res.data))
}

const onboardCitizen = (
  formData: OnboardCitizenFormValues
): Promise<OnboardCitizenResponse> => {
  const url = onboardingUrls.onboardCitizen()
  const dto = onboardCitizenDto(formData)

  return axios
    .post(url, dto)
    .then((res: AxiosResponse<OnboardCitizenResponse>) => res.data)
}

export default {
  retrieveIdentityRecord,
  onboardCitizen,
}
