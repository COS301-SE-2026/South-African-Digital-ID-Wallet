export type CitizenStatus =
  | 'Pending'
  | 'Verified'
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

export type UnlinkedAccountResponse = MessageResponse & {
  linked: false
}
