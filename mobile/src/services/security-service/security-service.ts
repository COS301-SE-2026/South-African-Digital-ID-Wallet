import type { AxiosResponse } from 'axios'
import api from '@/lib/api'
import securityUrls from './security-urls'
import type {
  FraudAlertDetailsResponse,
  SecureAccountRequest,
  SecureAccountResponse,
  SecurityActivityResponse,
  SecurityOverviewResponse,
  SecurityService,
} from './types'

const getOverview = () =>
  api
    .get(securityUrls.overview())
    .then((res: AxiosResponse<SecurityOverviewResponse>) => res.data)

const getActivity = (limit?: number) =>
  api
    .get(securityUrls.activity(limit))
    .then((res: AxiosResponse<SecurityActivityResponse[]>) => res.data)

const getAlert = (alertId: string) =>
  api
    .get(securityUrls.alert(alertId))
    .then((res: AxiosResponse<FraudAlertDetailsResponse>) => res.data)

const secureAccount = (alertId: string, request: SecureAccountRequest) =>
  api
    .post(securityUrls.secure(alertId), request)
    .then((res: AxiosResponse<SecureAccountResponse>) => res.data)

const securityService: SecurityService = {
  getActivity,
  getAlert,
  getOverview,
  secureAccount,
}

export default securityService
