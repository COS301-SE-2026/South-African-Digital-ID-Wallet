import { colors } from '../colors'
import { CREDENTIAL_TONES } from '../credential-tones'
import { radius, spacing } from '../spacing'
import { typography } from '../typography'

describe('theme tokens', () => {
  it('Should expose an ascending spacing scale', () => {
    const values = [
      spacing.xs,
      spacing.sm,
      spacing.md,
      spacing.lg,
      spacing.xl,
      spacing.xxl,
    ]
    expect(values).toEqual([...values].sort((a, b) => a - b))
  })
  it('Should expose a radius scale with a pill value', () => {
    expect(radius.sm).toBeLessThan(radius.md)
    expect(radius.md).toBeLessThan(radius.lg)
    expect(radius.full).toBeGreaterThan(radius.lg)
  })
  it('Should give every typography role a size and weight', () => {
    for (const role of Object.values(typography)) {
      expect(typeof role.fontSize).toBe('number')
      expect(typeof role.fontWeight).toBe('string')
    }
  })
  it('Should define every colour as a string', () => {
    for (const value of Object.values(colors)) {
      expect(typeof value).toBe('string')
    }
  })
  it('Should give every credential tone a from/to pair', () => {
    for (const tone of Object.values(CREDENTIAL_TONES)) {
      expect(tone).toHaveLength(2)
    }
  })
})
