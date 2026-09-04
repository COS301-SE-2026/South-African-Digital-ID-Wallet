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
const MORNING_END = 12
const AFTERNOON_END = 17
const CENTURY_CUTOFF = 30

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

export const formatActivityDay = (
  value: string,
  now: Date = new Date()
): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  const days = Math.round((atMidnight(now) - atMidnight(date)) / DAY_MS)
  if (days === 0) {
    return 'Today'
  }
  if (days === 1) {
    return 'Yesterday'
  }
  return formatIdDate(value)
}

export const formatActivityTime = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export const isSameDay = (value: string, now: Date = new Date()): boolean => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return false
  }
  return atMidnight(date) === atMidnight(now)
}

export const greetingForHour = (now: Date = new Date()): string => {
  const hour = now.getHours()
  if (hour < MORNING_END) {
    return 'Good morning'
  }
  if (hour < AFTERNOON_END) {
    return 'Good afternoon'
  }
  return 'Good evening'
}
