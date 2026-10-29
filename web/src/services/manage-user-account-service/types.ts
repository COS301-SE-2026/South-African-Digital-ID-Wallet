export type CitizenStatus =
  | 'Pending'
  // START FLASHID — CITIZEN DASHBOARD STATUS
  | 'Verified'
  // END FLASHID — CITIZEN DASHBOARD STATUS
  | 'Activated'
  | 'Deactivated'
  | 'Suspended'

export type ManageUserAccountDto = {
  fullName: string
  idEnding: string
  emailAddress: string
  phoneNumber: string
  dateOfBirth: string
  memberSince: string
  lastLogin: string | null
  accountStatus: CitizenStatus
}

export type MessageResponse = {
  message: string
}
