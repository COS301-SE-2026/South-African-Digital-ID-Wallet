import { readFileSync } from 'fs'
import { join } from 'path'

import { act, renderHook } from '@testing-library/react-native'
import * as LocalAuthentication from 'expo-local-authentication'

import {
  encodeKeyBindingFrame,
  interleaveKeyBindingFrame,
  splitPayloadFrames,
} from '@/lib/offline/qr-frames'
import type { PublicJwk, TrustData } from '@/lib/offline/verify'
import { offlineService } from '@/services/offline-service'
import { useAuthStore } from '@/stores/auth-store'

import { useEmergencyOfflineRead } from '../use-emergency-offline-read'
import { useVerifierTrust } from '../use-verifier-trust'

jest.mock('expo-crypto', () => ({
  getRandomBytes: jest.fn(() => new Uint8Array(4)),
  randomUUID: jest.fn(() => 'access-uuid'),
}))

jest.mock('expo-local-authentication', () => ({
  authenticateAsync: jest.fn(),
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
}))

jest.mock('../use-verifier-trust', () => ({ useVerifierTrust: jest.fn() }))

jest.mock('@/services/offline-service', () => ({
  offlineService: { queueEmergencyAccess: jest.fn() },
}))

type Fixture = {
  verifyAtUnix: number
  issuerKeys: (PublicJwk & { kid: string })[]
  presentation: string
  expected: { revocationIndex: number; claims: Record<string, string> }
}

const FIXTURES = join(
  __dirname,
  '../../../../backend/FlashIdBackend/tests/TestData/offline-verification'
)
const load = (name: string): Fixture =>
  JSON.parse(readFileSync(join(FIXTURES, name), 'utf8'))

const emergency = load('emergency-cross-stack-fixture.json')
const identity = load('cross-stack-fixture.json')

const trustFor = (fixture: Fixture): TrustData => ({
  keys: fixture.issuerKeys.map((key) => ({ ...key, status: 'active' })),
  retrievedAt: fixture.verifyAtUnix,
  revokedIndexes: [],
  revocationRetrievedAt: fixture.verifyAtUnix,
})

const framesFor = (presentation: string): readonly string[] => {
  const lastTilde = presentation.lastIndexOf('~')
  const sdJwt = presentation.slice(0, lastTilde + 1)
  const keyBindingJwt = presentation.slice(lastTilde + 1)
  const payload = splitPayloadFrames(sdJwt, 'AbCdEf').map(
    (frame) => frame.encoded
  )

  return keyBindingJwt
    ? interleaveKeyBindingFrame(
        payload,
        encodeKeyBindingFrame('AbCdEf', keyBindingJwt)
      )
    : payload
}

const hasHardware = LocalAuthentication.hasHardwareAsync as jest.Mock
const isEnrolled = LocalAuthentication.isEnrolledAsync as jest.Mock
const authenticate = LocalAuthentication.authenticateAsync as jest.Mock
const trustMock = useVerifierTrust as jest.Mock
const queueMock = offlineService.queueEmergencyAccess as jest.Mock

const readAll = async (fixture: Fixture) => {
  jest.spyOn(Date, 'now').mockReturnValue(fixture.verifyAtUnix * 1000)
  trustMock.mockReturnValue({ trust: trustFor(fixture), isLoading: false })

  const hook = await renderHook(() => useEmergencyOfflineRead())
  for (const frame of framesFor(fixture.presentation)) {
    await act(async () => {
      hook.result.current.addFrame(frame)
    })
  }
  return hook
}

describe('useEmergencyOfflineRead', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
    hasHardware.mockResolvedValue(true)
    isEnrolled.mockResolvedValue(true)
    authenticate.mockResolvedValue({ success: true })
    queueMock.mockResolvedValue(undefined)
    useAuthStore.setState({
      isAuthenticated: true,
      user: {
        names: 'Naledi',
        role: 'Official',
        surname: 'Khumalo',
        userId: 'official-1',
      },
    })
  })

  it('Should verify the emergency code the backend issued, from its frames', async () => {
    const { result } = await readAll(emergency)

    expect(result.current.result).toMatchObject({
      ok: true,
      revocationIndex: emergency.expected.revocationIndex,
      claims: emergency.expected.claims,
    })
  })

  it('Should refuse an identity code', async () => {
    const { result } = await readAll(identity)

    expect(result.current.result).toMatchObject({
      ok: false,
      code: 'MALFORMED',
    })
  })

  it('Should record the access before showing anything, then allow the profile', async () => {
    const { result } = await readAll(emergency)
    expect(result.current.accessedAt).toBeNull()

    await act(async () => {
      await result.current.confirm('Unconscious, no signal at scene')
    })

    expect(queueMock).toHaveBeenCalledWith({
      id: 'access-uuid',
      responderId: 'official-1',
      revocationIndex: emergency.expected.revocationIndex,
      justification: 'Unconscious, no signal at scene',
      accessedAt: emergency.verifyAtUnix,
      presentation: emergency.presentation,
    })
    expect(result.current.accessedAt).not.toBeNull()
  })

  it('Should show nothing when the identity check fails', async () => {
    authenticate.mockResolvedValue({ success: false, error: 'user_cancel' })
    const { result } = await readAll(emergency)

    await act(async () => {
      await result.current.confirm('Unconscious, no signal at scene')
    })

    expect(queueMock).not.toHaveBeenCalled()
    expect(result.current.accessedAt).toBeNull()
    expect(result.current.gateError).toBe(
      'Identity check failed. The profile was not opened.'
    )
  })

  it('Should show nothing when the phone has no biometrics', async () => {
    isEnrolled.mockResolvedValue(false)
    const { result } = await readAll(emergency)

    await act(async () => {
      await result.current.confirm('Unconscious, no signal at scene')
    })

    expect(result.current.accessedAt).toBeNull()
    expect(result.current.gateError).toContain('no enrolled biometrics')
  })

  it('Should show nothing if the access cannot be recorded on the phone', async () => {
    queueMock.mockRejectedValue(new Error('disk full'))
    const { result } = await readAll(emergency)

    await act(async () => {
      await result.current.confirm('Unconscious, no signal at scene')
    })

    expect(result.current.accessedAt).toBeNull()
    expect(result.current.gateError).toContain('could not be recorded')
  })

  it('Should do nothing before a code has been verified', async () => {
    trustMock.mockReturnValue({ trust: trustFor(emergency), isLoading: false })
    const { result } = await renderHook(() => useEmergencyOfflineRead())

    await act(async () => {
      await result.current.confirm('Unconscious, no signal at scene')
    })

    expect(authenticate).not.toHaveBeenCalled()
    expect(queueMock).not.toHaveBeenCalled()
  })

  it('Should clear the read on reset', async () => {
    const { result } = await readAll(emergency)
    await act(async () => {
      await result.current.confirm('Unconscious, no signal at scene')
    })

    await act(async () => {
      result.current.reset()
    })

    expect(result.current.result).toBeNull()
    expect(result.current.accessedAt).toBeNull()
  })
})
