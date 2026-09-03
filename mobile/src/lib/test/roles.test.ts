import { normalizeRole, ROLE_HOME } from '../roles'

describe('normalizeRole', () => {
  it.each([
    ['citizen', 'citizen'],
    ['  CITIZEN ', 'citizen'],
    ['Official', 'official'],
    ['offi_cial', 'official'],
    ['admin', null],
    [undefined, null],
    ['', null],
  ])('Should map %s to %s', (input, expected) => {
    expect(normalizeRole(input)).toBe(expected)
  })
  it('Should point each role at its home route', () => {
    expect(ROLE_HOME).toEqual({
      citizen: '/citizen/home',
      official: '/official/home',
    })
  })
})
