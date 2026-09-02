export type VerifyMethodOption = 'code' | 'id'
export type VerifyMethodProps = {
  onSelectMethod: (method: VerifyMethodOption) => void
  steps?: string[]
  currentStep?: number
}
