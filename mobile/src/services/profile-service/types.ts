export type ProfileResponse = {
  email: string
  names: string | null
  role: string
  saId: string | null
  surname: string | null
  userId: string
}

export type AccountResponse = {
  dateOfBirth?: string
  emailAddress?: string
  fullName?: string
  idEnding?: string
  lastLogin?: string | null
  memberSince?: string
  message?: string
  phoneNumber?: string
}

export type TrustedDeviceResponse = {
  browser: string
  deviceName: string
  deviceType: string
  id: string
  isCurrentDevice: boolean
  isTrusted: boolean
  lastActive: string
  lastKnownCity: string | null
  lastKnownCountry: string | null
  operatingSystem: string
}

export type NotificationResponse = {
  description: string
  id: string
  title: string
  tone: string
}

export type UpdatePasswordRequest = {
  confirmPassword: string
  currentPassword: string
  newPassword: string
}
