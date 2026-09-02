import { LogIn, ShieldAlert } from 'lucide-react-native'

import {
  toActivityEntries,
  toIdentityStatus,
  toWalletCredentials,
} from '../citizen-dashboard-dto'
import type { CredentialResponse } from '../types'

const DEFAULT_CREDENTIAL_ID = 'c-1'
const DEFAULT_ISSUER = 'DHA'
const DEFAULT_ISSUE_DATE = '2026-01-01T00:00:00Z'
const DEFAULT_STATUS = 'Active'
const DEFAULT_TITLE = 'National ID Card'
const DEFAULT_TYPE = 'IdentityDocument'

const ISSUE_DATE = '2026-02-02T00:00:00Z'
const SA_ID = '9801011234086'

const IDENTITY = {
  id: 'c-1',
  identityDocument: {
    citizenship: 'South African',
    countryOfBirth: 'South Africa',
    idNumber: SA_ID,
    nationality: 'South African',
    status: 'Citizen',
  },
  issueDate: ISSUE_DATE,
  issuedBy: 'Department of Home Affairs',
  status: 'Active',
  title: 'National ID Card',
  type: 'IdentityDocument',
}

const LICENCE = {
  driversLicense: {
    expiryDate: '2030-05-01T00:00:00Z',
    licenseCode: 'EB',
    licenseNumber: 'DL-99881',
    restrictions: '',
  },
  id: 'c-2',
  issueDate: ISSUE_DATE,
  issuedBy: 'RTMC',
  status: 'Pending',
  title: "Driver's Licence",
  type: 'DriversLicense',
}

const createCredentialFixture = (
  overrides: Partial<CredentialResponse> = {}
): CredentialResponse => ({
  id: DEFAULT_CREDENTIAL_ID,
  issuedBy: DEFAULT_ISSUER,
  issueDate: DEFAULT_ISSUE_DATE,
  status: DEFAULT_STATUS,
  title: DEFAULT_TITLE,
  type: DEFAULT_TYPE,
  ...overrides,
})

describe('toIdentityStatus', () => {
  it('Should report verified for an active identity document', () => {
    const credentials = [createCredentialFixture()]
    const result = toIdentityStatus(credentials)
    expect(result.status).toBe('verified')
  })
  it('Should report pending for an inactive identity document', () => {
    const credentials = [createCredentialFixture({ status: 'Inactive' })]
    const result = toIdentityStatus(credentials)
    expect(result.status).toBe('pending')
  })
  it('Should report attention for a revoked identity document', () => {
    const credentials = [createCredentialFixture({ status: 'Revoked' })]
    const result = toIdentityStatus(credentials)
    expect(result.status).toBe('attention')
  })
  it('Should ignore a driver licence when deciding identity status', () => {
    const credentials = [createCredentialFixture({ type: 'DriversLicense' })]
    const result = toIdentityStatus(credentials)
    expect(result.status).toBe('attention')
  })
  it('Should report attention for undefined or empty credentials', () => {
    const resultUndefined = toIdentityStatus(undefined)
    const resultEmpty = toIdentityStatus([])
    expect(resultUndefined.status).toBe('attention')
    expect(resultEmpty.status).toBe('attention')
  })
})

describe('toActivityEntries', () => {
  const REF_TIME = new Date('2026-08-31T18:00:00')
  const SAMPLE_EVENT = {
    id: 'a-1',
    timestamp: '2026-08-31T09:30:00',
    title: 'Mobile App',
    type: 'UserLoggedIn',
  }
  const FAILURE_EVENT = {
    id: 'a-2',
    timestamp: '2026-08-31T09:30:00',
    title: 'Bad password',
    type: 'FailedLoginAttempt',
  }
  const UNKNOWN_EVENT = {
    id: 'a-3',
    timestamp: '2026-08-31T09:30:00',
    title: '',
    type: 'Xyz',
  }

  it('Should map a known audit event to its icon, title and tone', () => {
    const entries = toActivityEntries([SAMPLE_EVENT], REF_TIME)
    const [entry] = entries
    expect(entry).toMatchObject({
      description: 'Mobile App',
      Icon: LogIn,
      timestamp: 'Today, 09:30',
      title: 'Logged in',
      tone: 'soft-green',
    })
  })
  it('Should map failure events to the danger tone', () => {
    const entries = toActivityEntries([FAILURE_EVENT], REF_TIME)
    const [entry] = entries
    expect(entry.Icon).toBe(ShieldAlert)
    expect(entry.tone).toBe('soft-red')
  })
  it('Should fall back gracefully for an unknown event type', () => {
    const entries = toActivityEntries([UNKNOWN_EVENT], REF_TIME)
    const [entry] = entries
    expect(entry.title).toBe('Account activity')
    expect(entry.tone).toBe('neutral')
  })
  it('Should return an empty list for undefined activity', () => {
    const result = toActivityEntries(undefined)
    expect(result).toEqual([])
  })
})

describe('toWalletCredentials', () => {
  it('Should return an empty list when there are no credentials', () => {
    expect(toWalletCredentials(undefined)).toEqual([])
    expect(toWalletCredentials([])).toEqual([])
  })

  it('Should build identity document fields with a decoded date of birth', () => {
    const [credential] = toWalletCredentials([IDENTITY])
    expect(credential.fields).toEqual([
      { label: 'ID Number', value: '980101 1234 086' },
      { label: 'Date of Birth', value: '01 Jan 1998' },
      { label: 'Nationality', value: 'South African' },
      { label: 'Citizenship', value: 'South African' },
      { label: 'Country of Birth', value: 'South Africa' },
    ])
    expect(credential.issuedOn).toBe('02 Feb 2026')
  })

  it('Should mark only active credentials as verified', () => {
    const [identity, licence] = toWalletCredentials([IDENTITY, LICENCE])
    expect(identity.isVerified).toBe(true)
    expect(licence.isVerified).toBe(false)
  })

  it('Should build licence fields and default empty restrictions to None', () => {
    const [credential] = toWalletCredentials([LICENCE])
    expect(credential.fields).toContainEqual({
      label: 'Restrictions',
      value: 'None',
    })
    expect(credential.fields).toContainEqual({
      label: 'Expires',
      value: '01 May 2030',
    })
  })

  it('Should assign a distinct tone to each card in the deck', () => {
    const [first, second] = toWalletCredentials([IDENTITY, LICENCE])
    expect(first.tone).not.toBe(second.tone)
  })

  it('Should fall back to a default issuer when none is supplied', () => {
    const [credential] = toWalletCredentials([{ ...IDENTITY, issuedBy: '' }])
    expect(credential.issuedBy).toBe('Republic of South Africa')
  })

  it('Should return no fields for a credential with neither detail block', () => {
    const bare = { ...IDENTITY, identityDocument: null, type: 'Passport' }
    const [credential] = toWalletCredentials([bare])
    expect(credential.fields).toEqual([])
  })

  it('Should drop fields the registry left blank', () => {
    const sparse = {
      ...IDENTITY,
      identityDocument: { ...IDENTITY.identityDocument, countryOfBirth: '' },
    }
    const [credential] = toWalletCredentials([sparse])
    const labels = credential.fields.map((field) => field.label)
    expect(labels).not.toContain('Country of Birth')
  })
})
