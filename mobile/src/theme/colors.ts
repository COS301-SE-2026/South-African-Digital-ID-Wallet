export const colors = {
  green: '#053B2C',
  cream: '#F7F4EA',
  gold: '#FFB81C',

  red: '#DE3831',
  blue: '#002395',
  black: '#000000',
  white: '#FFFFFF',

  success: '#0F8A4F',
  successBackground: '#E7F6EC',
  danger: '#DE3831',
  dangerBackground: '#FBEAE9',
  warning: '#FFB81C',
  warningBackground: '#FFF6E0',

  textPrimary: '#1A1A1A',
  textSecondary: '#5C5C5C',
  textMuted: '#8C8C8C',
  border: '#E5E1D8',
  surface: '#FFFFFF',
  background: '#F7F4EA',

  primaryGreen: '#007A4D',
} as const

export type ColorToken = keyof typeof colors
