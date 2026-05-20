import {
  citizenNavSections,
  governmentAdminNavSections,
  officialsNavSections,
} from '@/config'

describe('navigation config', () => {
  it('citizen nav includes a Dashboard item', () => {
    const allLabels = citizenNavSections.flatMap((s) =>
      s.items.map((i) => i.label)
    )
    expect(allLabels).toContain('Dashboard')
  })

  it('every nav item has a non-empty href', () => {
    const allConfigs = [
      ...citizenNavSections,
      ...governmentAdminNavSections,
      ...officialsNavSections,
    ]
    allConfigs.forEach((section) => {
      section.items.forEach((item) => {
        expect(item.href).toBeTruthy()
      })
    })
  })
})
