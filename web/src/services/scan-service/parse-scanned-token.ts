function base64ToUtf8(base64: string): string {
  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder('utf-8').decode(bytes)
}

export type ParsedScannedToken =
  | { type: 'disclosure'; token: string }
  | { type: 'badge'; token: string }

export function parseScannedToken(rawText: string): ParsedScannedToken | null {
  try {
    const envelopeJson = base64ToUtf8(rawText)
    const envelope = JSON.parse(envelopeJson) as {
      payload?: unknown
      signature?: unknown
    }

    if (
      typeof envelope.payload !== 'string' ||
      typeof envelope.signature !== 'string'
    ) {
      return null
    }

    const payloadJson = base64ToUtf8(envelope.payload)
    const payload = JSON.parse(payloadJson) as {
      type?: unknown
    }

    if (payload.type === 'disclosure' || payload.type === 'badge') {
      return {
        type: payload.type,
        token: rawText,
      }
    }

    return null
  } catch {
    return null
  }
}
