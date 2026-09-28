import type { ParsedScannedToken } from './types'

const EMERGENCY_PREFIX = 'https://flashid.co.za/e#'

const base64ToUtf8 = (base64: string): string => {
  const binary = atob(base64)
  let escaped = ''
  for (let index = 0; index < binary.length; index += 1) {
    escaped += `%${binary.charCodeAt(index).toString(16).padStart(2, '0')}`
  }
  return decodeURIComponent(escaped)
}

export const parseScannedToken = (
  rawText: string
): ParsedScannedToken | null => {
  if (rawText.startsWith(EMERGENCY_PREFIX)) {
    return { token: rawText, type: 'emergency' }
  }

  try {
    const envelope = JSON.parse(base64ToUtf8(rawText)) as {
      payload?: unknown
      signature?: unknown
    }
    if (
      typeof envelope.payload !== 'string' ||
      typeof envelope.signature !== 'string'
    ) {
      return null
    }
    const payload = JSON.parse(base64ToUtf8(envelope.payload)) as {
      type?: unknown
    }
    if (payload.type === 'disclosure' || payload.type === 'badge') {
      return { token: rawText, type: payload.type }
    }
    return null
  } catch {
    return null
  }
}
