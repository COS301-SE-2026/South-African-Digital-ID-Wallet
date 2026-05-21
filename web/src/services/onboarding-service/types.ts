export type OnboardCitizenFormValues = {
  idNumber: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
}

export type OnboardCitizenResponse = {
  citizenId: string
  idNumber: string
  firstName: string
  lastName: string
  status: string
  message: string
}
