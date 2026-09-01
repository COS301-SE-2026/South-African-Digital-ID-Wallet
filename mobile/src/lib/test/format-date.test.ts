import {
  formatActivityTimestamp,
  formatIdDate,
  formatSaId,
  saIdToDateOfBirth,
} from '../format-date'

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

describe('formatIdDate', () => {
  it('Should format an ISO date as a readable ID date', () => {
    expect(formatIdDate('2026-02-09T10:15:00Z')).toBe('09 Feb 2026')
  })
  it('Should return an empty string for an unparseable value', () => {
    expect(formatIdDate('not-a-date')).toBe('')
  })
})

describe('formatSaId', () => {
  it('Should group a 13 digit SA ID as 6-4-3', () => {
    expect(formatSaId('9801011234086')).toBe('980101 1234 086')
  })
  it('Should strip separators before grouping', () => {
    expect(formatSaId('980101-1234-086')).toBe('980101 1234 086')
  })
  it('Should return the input untouched when it is not 13 digits', () => {
    expect(formatSaId('12345')).toBe('12345')
  })
})

describe('saIdToDateOfBirth', () => {
  it('Should decode a 1900s date of birth', () => {
    expect(saIdToDateOfBirth('9801011234086')).toBe('01 Jan 1998')
  })
  it('Should decode a 2000s date of birth below the century cutoff', () => {
    expect(saIdToDateOfBirth('0503151234086')).toBe('15 Mar 2005')
  })
  it('Should reject an impossible month', () => {
    expect(saIdToDateOfBirth('9899011234086')).toBe('')
  })
  it('Should reject an impossible day', () => {
    expect(saIdToDateOfBirth('9801991234086')).toBe('')
  })
  it('Should return an empty string when there are too few digits', () => {
    expect(saIdToDateOfBirth('980')).toBe('')
  })
})
