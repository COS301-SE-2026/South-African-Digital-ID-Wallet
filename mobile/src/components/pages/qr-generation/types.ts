export type QrGenerationPageProps = {
  credentialId: string | undefined
}

export type OnlineQrStateProps = {
  credentialTitle: string
  error: unknown
  isGenerating: boolean
  onCancel: () => void
  onRefresh: () => void
  secondsRemaining: number
  token: string | null
}
