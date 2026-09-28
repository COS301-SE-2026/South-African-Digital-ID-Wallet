import type { AxiosResponse } from 'axios'

import api from '@/lib/api'

import citizenDashboardUrls from './citizen-dashboard-urls'
import type {
  ActivityResponse,
  CredentialResponse,
  OfficialActivityResponse,
} from './types'

const getCredentials = () =>
  api
    .get(citizenDashboardUrls.credentials())
    .then((res: AxiosResponse<CredentialResponse[]>) => res.data)

const getActivity = () =>
  api
    .get(citizenDashboardUrls.activity())
    .then((res: AxiosResponse<ActivityResponse[]>) => res.data)

const getOfficialActivity = () =>
  api
    .get(citizenDashboardUrls.officialActivity())
    .then((res: AxiosResponse<OfficialActivityResponse>) => res.data)

const citizenDashboardService = {
  getActivity,
  getCredentials,
  getOfficialActivity,
}

export default citizenDashboardService
