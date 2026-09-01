import { formatActivityTimestamp } from '../format-date'

const REFERENCE_TIME = new Date('2026-08-31T18:00:00')
const SAME_DAY_TIMESTAMP = '2026-08-31T09:30:00'
const SAME_DAY_RESULT = 'Today, 09:30'
const PREV_DAY_TIMESTAMP = '2026-08-30T14:05:00'
const PREV_DAY_RESULT = 'Yesterday, 14:05'
const OLD_TIMESTAMP = '2026-08-12T07:09:00'
const OLD_TIMESTAMP_RESULT = '12 Aug, 07:09'
const INVALID_TIMESTAMP = 'not-a-date'
const EMPTY_RESULT = ''

describe('formatActivityTimestamp', () => {
  it('Should prefix same-day timestamps with Today', () => {
    const formatted = formatActivityTimestamp(
      SAME_DAY_TIMESTAMP,
      REFERENCE_TIME
    )
    expect(formatted).toBe(SAME_DAY_RESULT)
  })
  it('Should prefix previous-day timestamps with Yesterday', () => {
    const formatted = formatActivityTimestamp(
      PREV_DAY_TIMESTAMP,
      REFERENCE_TIME
    )
    expect(formatted).toBe(PREV_DAY_RESULT)
  })
  it('Should fall back to a day and month for older timestamps', () => {
    const formatted = formatActivityTimestamp(OLD_TIMESTAMP, REFERENCE_TIME)
    expect(formatted).toBe(OLD_TIMESTAMP_RESULT)
  })
  it('Should return an empty string for an unparseable value', () => {
    const formatted = formatActivityTimestamp(INVALID_TIMESTAMP, REFERENCE_TIME)
    expect(formatted).toBe(EMPTY_RESULT)
  })
})
