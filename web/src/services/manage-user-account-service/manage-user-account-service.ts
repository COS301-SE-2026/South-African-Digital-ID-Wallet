import api from '@/lib/api'
import manageUserAccountUrls from './manage-user-account-urls'
import type { ManageUserAccountDto, MessageResponse } from './types'

// START FLASHID — UNLINKED CITIZEN RECORD
const noLinkedCitizenMessage =
  'You have no credentials linked. To see your information please activate your credentials.'

export const isNoLinkedCitizenResponse = (
  value: unknown
): value is MessageResponse =>
  typeof value === 'object' &&
  value !== null &&
  'message' in value &&
  value.message === noLinkedCitizenMessage
// END FLASHID — UNLINKED CITIZEN RECORD

const getMyAccount = (): Promise<ManageUserAccountDto | MessageResponse> =>
  api
    .get(manageUserAccountUrls.me())
    .then((res) => res.data as ManageUserAccountDto | MessageResponse)

const verifyPassword = (password: string): Promise<MessageResponse> =>
  api
    .post(manageUserAccountUrls.verifyPassword(), { password })
    .then((res) => res.data as MessageResponse)

const requestEmailChange = (newEmail: string): Promise<MessageResponse> =>
  api
    .post(manageUserAccountUrls.requestEmailChange(), { newEmail })
    .then((res) => res.data as MessageResponse)

const resendEmailChangeOtp = (): Promise<MessageResponse> =>
  api
    .post(manageUserAccountUrls.resendEmailChangeOtp())
    .then((res) => res.data as MessageResponse)

const confirmEmailChange = (
  otp: string
): Promise<ManageUserAccountDto | MessageResponse> =>
  api
    .post(manageUserAccountUrls.confirmEmailChange(), { otp })
    .then((res) => res.data as ManageUserAccountDto | MessageResponse)

const manageUserAccountService = {
  getMyAccount,
  verifyPassword,
  requestEmailChange,
  resendEmailChangeOtp,
  confirmEmailChange,
}

export default manageUserAccountService
