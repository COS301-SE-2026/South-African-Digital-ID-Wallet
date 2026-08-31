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
