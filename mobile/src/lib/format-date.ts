const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const pad = (value: number) => String(value).padStart(2, '0')

const atMidnight = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

const DAY_MS = 86_400_000

export const formatActivityTimestamp = (
  value: string,
  now: Date = new Date()
): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`
  const days = Math.round((atMidnight(now) - atMidnight(date)) / DAY_MS)
  if (days === 0) {
    return `Today, ${time}`
  }
  if (days === 1) {
    return `Yesterday, ${time}`
  }
  return `${date.getDate()} ${MONTHS[date.getMonth()]}, ${time}`
}

export const formatIdDate = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return `${pad(date.getDate())} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

export const formatSaId = (saId: string): string => {
  const digits = (saId ?? '').replace(/\D/g, '')
  if (digits.length !== 13) {
    return saId ?? ''
  }
  return `${digits.slice(0, 6)} ${digits.slice(6, 10)} ${digits.slice(10)}`
}

const CENTURY_CUTOFF = 30

export const saIdToDateOfBirth = (saId: string): string => {
  const digits = (saId ?? '').replace(/\D/g, '')
  if (digits.length < 6) {
    return ''
  }
  const year = Number(digits.slice(0, 2))
  const month = Number(digits.slice(2, 4))
  const day = Number(digits.slice(4, 6))
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return ''
  }
  const century = year <= CENTURY_CUTOFF ? 2000 : 1900
  return `${pad(day)} ${MONTHS[month - 1]} ${century + year}`
}
