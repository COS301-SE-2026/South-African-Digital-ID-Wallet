export const colors = {
  primaryGreen: '#007A4D',
  green: '#053B2C',
  gold: '#FFB81C',
  red: '#DE3831',
  blue: '#002395',

  cream: '#F7F4EA',
  white: '#FFFFFF',
  black: '#000000',
  secureNight: '#031F18',
  success: '#16A34A',
  successBackground: '#E7F6EC',
  danger: '#DC2626',
  dangerBackground: '#FBEAE9',
  warning: '#D97706',
  warningBackground: '#FFF6E0',

  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#6B7280',
  neutralMidGrey: '#9CA3AF',
  border: '#E5E7EB',
  surface: '#FFFFFF',
  background: '#F7F4EA',
} as const

export type ColorToken = keyof typeof colors
