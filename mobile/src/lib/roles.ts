export type AppRole = 'citizen' | 'official'

export const normalizeRole = (role: string | undefined): AppRole | null => {
  const normailzed = (role ?? '')
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, '')
  if (normailzed === 'citizen') {
    return 'citizen'
  }
  if (normailzed === 'official') {
    return 'official'
  }
  return null
}

export const ROLE_HOME = {
  citizen: '/citizen/home',
  official: '/official/home',
} as const satisfies Record<AppRole, string>
