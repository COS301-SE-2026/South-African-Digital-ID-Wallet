export const CERTIFIED_COPY_FALLBACK_FILE_NAME = 'certified-copy.pdf'

const ENCODED_FILE_NAME = /filename\*\s*=\s*(?:UTF-8'[^']*')?([^;]+)/i
const PLAIN_FILE_NAME = /filename\s*=\s*"?([^";]+)"?/i

const safeDecode = (value: string): string => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export const toCertifiedCopyFileName = (
  disposition: string | null | undefined
): string => {
  const encoded = disposition?.match(ENCODED_FILE_NAME)?.[1]
  const plain = disposition?.match(PLAIN_FILE_NAME)?.[1]
  const raw = encoded ? safeDecode(encoded.trim()) : (plain ?? '')
  const cleaned = raw
    .trim()
    .replace(/[^\w.-]+/g, '-')
    .replace(/^[.-]+/, '')
  if (!cleaned) {
    return CERTIFIED_COPY_FALLBACK_FILE_NAME
  }
  return cleaned.toLowerCase().endsWith('.pdf') ? cleaned : `${cleaned}.pdf`
}
