import { registerInstitutionDto } from '../institution-dto'
import { institutionModel } from '../institution-model'
import institutionUrls from '../institution-urls'

describe('registerInstitutionDto', () => {
  it('maps HomeAffairs type to 0', () => {
    const result = registerInstitutionDto({
      institutionName: 'Home Affairs JHB',
      institutionType: 'HomeAffairs',
      verificationNumber: 'HA-001',
      adminId: 'admin-123',
    })
    expect(result.type).toBe(0)
  })

  it('maps LicensingDepartment type to 1', () => {
    const result = registerInstitutionDto({
      institutionName: 'DLTC Pretoria',
      institutionType: 'LicensingDepartment',
      verificationNumber: 'DLTC-001',
      adminId: 'admin-123',
    })
    expect(result.type).toBe(1)
  })

  it('maps form fields to backend field names correctly', () => {
    const result = registerInstitutionDto({
      institutionName: 'Home Affairs JHB',
      institutionType: 'HomeAffairs',
      verificationNumber: 'HA-001',
      adminId: 'admin-guid-123',
    })
    expect(result.name).toBe('Home Affairs JHB')
    expect(result.verificationNumber).toBe('HA-001')
    expect(result.adminId).toBe('admin-guid-123')
  })
})

describe('institutionModel', () => {
  it('maps backend response to frontend model correctly', () => {
    const backendData = {
      institutionId: 'inst-123',
      name: 'Home Affairs JHB',
      type: 'HomeAffairs',
      apiKey: 'flashid_live_abc123',
      apiKeyReference: 'ref-guid-123',
      verificationNumber: 'HA-001',
      createdAt: '2026-05-20T00:00:00Z',
    }
    const result = institutionModel(backendData)
    expect(result.institutionId).toBe('inst-123')
    expect(result.name).toBe('Home Affairs JHB')
    expect(result.apiKey).toBe('flashid_live_abc123')
    expect(result.verificationNumber).toBe('HA-001')
  })
})

describe('institutionUrls', () => {
  it('register url contains correct path', () => {
    expect(institutionUrls.register()).toContain('/api/institutions/register')
  })

  it('getAll url contains correct path', () => {
    expect(institutionUrls.getAll()).toContain('/api/institutions')
  })

  it('getById url contains institution id', () => {
    expect(institutionUrls.getById('inst-123')).toContain('inst-123')
  })
})
