export type AppRole = 'citizen' | 'official'

export const normalizeRole = (role: string | undefined): AppRole | null => {
  const normalized = (role ?? '')
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, '')
  if (normalized === 'citizen') {
    return 'citizen'
  }
  if (normalized === 'official') {
    return 'official'
  }
  return null
}

export const ROLE_HOME = {
  citizen: '/citizen/home',
  official: '/official/home',
} as const satisfies Record<AppRole, string>
