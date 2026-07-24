export type CitizenStatus =
  | 'Pending'
  | 'Activated'
  | 'Deactivated'
  | 'Suspended'

export interface ManageUserAccountDto {
  fullName: string
  idEnding: string
  emailAddress: string
  phoneNumber: string
  dateOfBirth: string
  memberSince: string
  lastLogin: string | null
  accountStatus: CitizenStatus
}
