import type { AxiosResponse } from 'axios'

import api from '@/lib/api'

import profileUrls from './profile-urls'
import type {
  AccountResponse,
  NotificationResponse,
  ProfileResponse,
  TrustedDeviceResponse,
  UpdatePasswordRequest,
} from './types'

const getProfile = () =>
  api
    .get(profileUrls.profile())
    .then((res: AxiosResponse<ProfileResponse>) => res.data)

const getAccount = () =>
  api
    .get(profileUrls.account())
    .then((res: AxiosResponse<AccountResponse>) => res.data)

const getTrustedDevices = () =>
  api
    .get(profileUrls.devices())
    .then((res: AxiosResponse<TrustedDeviceResponse[]>) => res.data)

const getNotifications = () =>
  api
    .get(profileUrls.notifications())
    .then((res: AxiosResponse<NotificationResponse[]>) => res.data)

const unlinkDevice = (deviceId: string) =>
  api.delete(profileUrls.device(deviceId)).then((res) => res.data)

const updatePassword = (dto: UpdatePasswordRequest) =>
  api.put(profileUrls.password(), dto).then((res) => res.data)

const verifyPassword = (password: string) =>
  api
    .post(profileUrls.emailVerifyPassword(), { password })
    .then((res) => res.data)

const requestEmailChange = (newEmail: string) =>
  api
    .post(profileUrls.emailRequestChange(), { newEmail })
    .then((res) => res.data)

const resendEmailOtp = () =>
  api.post(profileUrls.emailResendOtp()).then((res) => res.data)

const confirmEmailChange = (otp: string) =>
  api.post(profileUrls.emailConfirm(), { otp }).then((res) => res.data)

const profileService = {
  getAccount,
  getNotifications,
  getProfile,
  getTrustedDevices,
  unlinkDevice,
  updatePassword,
  verifyPassword,
  requestEmailChange,
  resendEmailOtp,
  confirmEmailChange,
}

export default profileService
