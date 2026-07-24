export type ActivateCredentialsSelection = {
  identityDocument: boolean
  driversLicense: boolean
}

export type ActivateCredentialsFormProps = {
  identityDocumentAvailable: boolean
  driversLicenseAvailable: boolean
  selection: ActivateCredentialsSelection
  onSelectionChange: (selection: ActivateCredentialsSelection) => void
  onSubmit: () => void
  onBack: () => void
  isSubmitting?: boolean
}
