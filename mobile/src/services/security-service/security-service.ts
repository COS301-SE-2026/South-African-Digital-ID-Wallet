import type { AxiosResponse } from 'axios'
import api from '@/lib/api'
import securityUrls from './security-urls'
import type {
  DismissAlertRequest,
  FraudAlertDetailsResponse,
  SecureAccountRequest,
  SecureAccountResponse,
  SecurityActivityResponse,
  SecurityOverviewResponse,
  SecurityService,
  SecuritySettingsResponse,
  UpdateSecuritySettingsRequest,
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

const dismissAlert = (alertId: string, request: DismissAlertRequest) =>
  api.post(securityUrls.dismiss(alertId), request).then(() => undefined)

const getSettings = () =>
  api
    .get(securityUrls.settings())
    .then((res: AxiosResponse<SecuritySettingsResponse>) => res.data)

const updateSettings = (request: UpdateSecuritySettingsRequest) =>
  api
    .put(securityUrls.settings(), request)
    .then((res: AxiosResponse<SecuritySettingsResponse>) => res.data)

const securityService: SecurityService = {
  dismissAlert,
  getActivity,
  getAlert,
  getOverview,
  getSettings,
  secureAccount,
  updateSettings,
}

export default securityService
