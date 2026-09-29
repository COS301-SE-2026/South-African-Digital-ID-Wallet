import type { AxiosResponse } from 'axios'
import api from '@/lib/api'
import fraudDetectionUrls from './fraud-detection-urls'
import type {
  DismissFraudAlertRequest,
  FraudAlertDetailsResponse,
  FraudAlertStatus,
  FraudAlertSummaryResponse,
  SecurityActivityItemResponse,
  SecurityOverviewResponse,
  SecuritySettingsResponse,
  SecureAccountRequest,
  SecureAccountResultResponse,
  UpdateSecuritySettingsRequest,
} from './types'

const getOverview = (): Promise<SecurityOverviewResponse> => {
  const url = fraudDetectionUrls.overview()
  return api
    .get(url)
    .then((res: AxiosResponse<SecurityOverviewResponse>) => res.data)
}
const getActivity = (
  limit = 20
): Promise<SecurityActivityItemResponse[]> => {
  const url = fraudDetectionUrls.activity(limit)
  return api
    .get(url)
    .then(
      (res: AxiosResponse<SecurityActivityItemResponse[]>) => res.data
    )
}
const getAlerts = (
  status?: FraudAlertStatus
): Promise<FraudAlertSummaryResponse[]> => {
  const url = fraudDetectionUrls.alerts(status)
  return api
    .get(url)
    .then(
      (res: AxiosResponse<FraudAlertSummaryResponse[]>) => res.data
    )
}
const getAlertDetails = (
  alertId: string
): Promise<FraudAlertDetailsResponse> => {
  const url = fraudDetectionUrls.alertDetails(alertId)
  return api
    .get(url)
    .then((res: AxiosResponse<FraudAlertDetailsResponse>) => res.data)
}
const secureAccount = (
  alertId: string,
  request: SecureAccountRequest
): Promise<SecureAccountResultResponse> => {
  const url = fraudDetectionUrls.secureAccount(alertId)
  return api
    .post(url, request)
    .then(
      (res: AxiosResponse<SecureAccountResultResponse>) => res.data
    )
}
const dismissAlert = (
  alertId: string,
  request: DismissFraudAlertRequest
): Promise<void> => {
  const url = fraudDetectionUrls.dismissAlert(alertId)
  return api.post(url, request).then(() => undefined)
}
const getSettings = (): Promise<SecuritySettingsResponse> => {
  const url = fraudDetectionUrls.settings()
  return api
    .get(url)
    .then((res: AxiosResponse<SecuritySettingsResponse>) => res.data)
}
const updateSettings = (
  request: UpdateSecuritySettingsRequest
): Promise<SecuritySettingsResponse> => {
  const url = fraudDetectionUrls.settings()
  return api
    .put(url, request)
    .then((res: AxiosResponse<SecuritySettingsResponse>) => res.data)
}
const fraudDetectionService = {
  getOverview,
  getActivity,
  getAlerts,
  getAlertDetails,
  secureAccount,
  dismissAlert,
  getSettings,
  updateSettings,
}
export default fraudDetectionService