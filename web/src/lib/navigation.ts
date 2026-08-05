export function getSafeReturnTo(returnTo: string | null, fallback: string) {
  if (!returnTo || !returnTo.startsWith('/') || returnTo.startsWith('//')) {
    return fallback
  }
  return returnTo
}
