import api from '@/lib/api'

import type { IdentityRecord } from '@/types'

import onboardingService from '../onboarding-service'
import onboardingUrls from '../onboarding-urls'
import { onboardCitizenDto } from '../onboarding-dto'
import { identityRecordModel } from '../onboarding-model'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}))

const mockedApi = api as unknown as { get: jest.Mock; post: jest.Mock }

const formValues = {
  idNumber: '9001015800086',
  email: 'thabo@example.com',
  phoneNumber: '0612345678',
  consentProvided: true,
}

describe('onboardingUrls', () => {
  it('Should build the expected endpoints', () => {
    expect(onboardingUrls.onboardCitizen()).toBe('/api/onboarding/citizen')
    expect(onboardingUrls.retrieveIdentityRecord('9001015800086')).toBe(
      '/api/onboarding/verify/9001015800086'
    )
  })
})

describe('onboardingCitizenDto', () => {
  it('Should map form value to the correct backend field', () => {
    expect(onboardCitizenDto(formValues)).toEqual({
      SaId: '9001015800086',
      Email: 'thabo@example.com',
      PhoneNumber: '0612345678',
      ConsentGiven: true,
    })
  })
})

describe('identityRecordModel', () => {
  it('Should get the time component from the date of birth', () => {
    const result = identityRecordModel({
      saId: '9001015800086',
      fullName: 'Thabo Mokoena',
      dateOfBirth: '1990-01-01T00:00:00Z',
      status: 'Verified',
    })
    expect(result.dateOfBirth).toBe('1990-01-01')
  })

  it('defaults missing fields to empty strings', () => {
    expect(identityRecordModel({} as IdentityRecord)).toEqual({
      saId: '',
      fullName: '',
      dateOfBirth: '',
      status: 'Verified',
    })
  })

  it('Should keep a not found status and normalises anything else to Verified', () => {
    expect(
      identityRecordModel({ status: 'Not Found' } as IdentityRecord).status
    ).toBe('Not Found')
    expect(
      identityRecordModel({ status: 'whatever' } as unknown as IdentityRecord)
        .status
    ).toBe('Verified')
  })
})

describe('onboardingService', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should get the identity record and map it', async () => {
    mockedApi.get.mockResolvedValue({
      data: {
        saId: '9001015800086',
        fullName: 'Thabo Mokoena',
        dateOfBirth: '1990-01-01T00:00:00Z',
        status: 'Verified',
      },
    })

    const result =
      await onboardingService.retrieveIdentityRecord('9001015800086')
    expect(mockedApi.get).toHaveBeenCalledWith(
      '/api/onboarding/verify/9001015800086'
    )
    expect(result).toEqual({
      saId: '9001015800086',
      fullName: 'Thabo Mokoena',
      dateOfBirth: '1990-01-01',
      status: 'Verified',
    })
  })

  it('Should post the mapped dto and unwrap the respone', async () => {
    const data = {
      citizenId: 'c-1',
      saId: '9001015800086',
      activationPin: '123456',
      activationExpiresAt: '2026-08-01T10:00:00Z',
      status: 'Pending',
    }
    mockedApi.post.mockResolvedValue({ data })
    const result = await onboardingService.onboardCitizen(formValues)

    expect(mockedApi.post).toHaveBeenCalledWith('/api/onboarding/citizen', {
      SaId: '9001015800086',
      Email: 'thabo@example.com',
      PhoneNumber: '0612345678',
      ConsentGiven: true,
    })
    expect(result).toEqual(data)
  })

  it('Should go to request failure', async () => {
    mockedApi.get.mockRejectedValue(new Error('not found'))
    await expect(
      onboardingService.retrieveIdentityRecord('0000000000000')
    ).rejects.toThrow('not found')
  })
})
