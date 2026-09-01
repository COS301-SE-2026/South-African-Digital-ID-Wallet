import type { ParsedScannedToken } from './types'

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
