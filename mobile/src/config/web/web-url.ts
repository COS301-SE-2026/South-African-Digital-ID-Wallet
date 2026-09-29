// The web portal hosts flows the app hands off to, such as password reset and Face API activation.
export const WEB_BASE_URL =
  process.env.EXPO_PUBLIC_WEB_URL ?? 'https://flashid.co.za'

// Joins a path onto the portal URL without doubling the slash.
export const webUrl = (path: string): string =>
  `${WEB_BASE_URL.replace(/\/$/, '')}${path}`
