import axios, { AxiosResponse } from 'axios'

import onboardingUrls from './onboarding-urls'
import { onboardCitizenDto } from './onboarding-dto'
import { OnboardCitizenFormValues, OnboardCitizenResponse } from './types'

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
  onboardCitizen,
}
