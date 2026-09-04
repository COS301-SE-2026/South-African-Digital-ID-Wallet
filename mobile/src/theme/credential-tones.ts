import { colors } from './colors'

export type CredentialTone = 'green' | 'deep' | 'blue' | 'gold' | 'night'

export const CREDENTIAL_TONES: Record<
  CredentialTone,
  readonly [string, string]
> = {
  green: [colors.primaryGreen, colors.green],
  deep: [colors.green, colors.secureNight],
  blue: [colors.blue, '#001A6B'],
  gold: [colors.gold, colors.warning],
  night: [colors.secureNight, colors.black],
}

const TONE_ORDER: CredentialTone[] = ['green', 'blue', 'deep', 'gold', 'night']

export const toneForIndex = (index: number): CredentialTone =>
  TONE_ORDER[index % TONE_ORDER.length]
