import type { AxiosResponse } from 'axios'

import api from '@/lib/api'

import emergencyUrls from './emergency-urls'
import type {
  EmergencyProfile,
  OfflineCredential,
  RegisterDeviceRequest,
  RegisterDeviceResponse,
  ResolveEmergencyRequest,
  ResolveEmergencyResponse,
  SaveEmergencyProfileRequest,
} from './types'

const getProfile = () =>
  api
    .get(emergencyUrls.profile())
    .then((res: AxiosResponse<EmergencyProfile>) => res.data)

const saveProfile = (request: SaveEmergencyProfileRequest) =>
  api
    .put(emergencyUrls.profile(), request)
    .then((res: AxiosResponse<EmergencyProfile>) => res.data)

const registerDevice = (dto: RegisterDeviceRequest) =>
  api
    .post(emergencyUrls.devices(), dto)
    .then((res: AxiosResponse<RegisterDeviceResponse>) => res.data)

const getOfflineCredential = () =>
  api
    .get(emergencyUrls.offlineCredential())
    .then((res: AxiosResponse<OfflineCredential>) => res.data)

const resolve = (dto: ResolveEmergencyRequest) =>
  api
    .post(emergencyUrls.resolve(), dto)
    .then((res: AxiosResponse<ResolveEmergencyResponse>) => res.data)

const emergencyService = {
  getOfflineCredential,
  getProfile,
  registerDevice,
  resolve,
  saveProfile,
}

export default emergencyService
