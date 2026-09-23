import {
  formatActivityDay,
  formatActivityTime,
  greetingForHour,
  isSameDay,
  saIdToDateOfBirth,
} from '../format-date'

const NOW = new Date(2026, 0, 15, 10, 0, 0)

describe('formatActivityDay', () => {
  it('Should label today', () => {
    expect(
      formatActivityDay(new Date(2026, 0, 15, 8, 0).toISOString(), NOW)
    ).toBe('Today')
  })
  it('Should label yesterday', () => {
    expect(
      formatActivityDay(new Date(2026, 0, 14, 8, 0).toISOString(), NOW)
    ).toBe('Yesterday')
  })
  it('Should fall back to a full date', () => {
    expect(
      formatActivityDay(new Date(2026, 0, 2, 8, 0).toISOString(), NOW)
    ).toBe('02 Jan 2026')
  })
  it('Should return an empty string for an invalid date', () => {
    expect(formatActivityDay('nonsense', NOW)).toBe('')
  })
})

describe('formatActivityTime', () => {
  it('Should zero-pad the clock time', () => {
    expect(formatActivityTime(new Date(2026, 0, 15, 9, 5).toISOString())).toBe(
      '09:05'
    )
  })
  it('Should return an empty string for an invalid date', () => {
    expect(formatActivityTime('nonsense')).toBe('')
  })
})

describe('isSameDay', () => {
  it('Should be true for the same calendar day', () => {
    expect(isSameDay(new Date(2026, 0, 15, 23, 0).toISOString(), NOW)).toBe(
      true
    )
  })
  it('Should be false for a different day', () => {
    expect(isSameDay(new Date(2026, 0, 14, 23, 0).toISOString(), NOW)).toBe(
      false
    )
  })
  it('Should be false for an invalid date', () => {
    expect(isSameDay('nonsense', NOW)).toBe(false)
  })
})

describe('greetingForHour', () => {
  it.each([
    [8, 'Good morning'],
    [13, 'Good afternoon'],
    [19, 'Good evening'],
  ])('Should greet at %s:00 with %s', (hour, expected) => {
    expect(greetingForHour(new Date(2026, 0, 15, hour, 0))).toBe(expected)
  })
})

describe('saIdToDateOfBirth', () => {
  it('Should read a 2000s birth date', () => {
    expect(saIdToDateOfBirth('0202204720082')).toBe('20 Feb 2002')
  })
  it('Should read a 1900s birth date', () => {
    expect(saIdToDateOfBirth('9202204720082')).toBe('20 Feb 1992')
  })
  it('Should reject an impossible month', () => {
    expect(saIdToDateOfBirth('9213204720082')).toBe('')
  })
  it('Should reject an impossible day', () => {
    expect(saIdToDateOfBirth('9202324720082')).toBe('')
  })
  it('Should return an empty string for a short id', () => {
    expect(saIdToDateOfBirth('920')).toBe('')
  })
})
