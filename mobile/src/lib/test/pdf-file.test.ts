import { File } from 'expo-file-system'
import { startActivityAsync } from 'expo-intent-launcher'
import * as Sharing from 'expo-sharing'
import { Platform } from 'react-native'

import { openPdf, savePdf } from '../pdf-file'

jest.mock('expo-file-system', () => {
  class MockFile {
    static existing = new Set<string>()
    uri: string
    contentUri: string
    exists: boolean
    create = jest.fn()
    delete = jest.fn()
    write = jest.fn()
    constructor(directory: { uri: string }, name: string) {
      this.uri = `${directory.uri}${name}`
      this.contentUri = `content://flashid/${name}`
      this.exists = MockFile.existing.has(name)
    }
  }
  return { File: MockFile, Paths: { cache: { uri: 'file:///cache/' } } }
})
jest.mock('expo-intent-launcher', () => ({ startActivityAsync: jest.fn() }))
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}))

type MockFileInstance = {
  contentUri: string
  create: jest.Mock
  delete: jest.Mock
  exists: boolean
  uri: string
  write: jest.Mock
}

const startActivity = startActivityAsync as jest.Mock
const isAvailable = Sharing.isAvailableAsync as jest.Mock
const share = Sharing.shareAsync as jest.Mock
const originalOS = Platform.OS

const setPlatform = (os: typeof Platform.OS) =>
  Object.defineProperty(Platform, 'OS', { configurable: true, value: os })

const fileNamed = (name: string) =>
  savePdf(new Uint8Array([1]), name) as unknown as MockFileInstance

describe('savePdf', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should write the bytes into a cache file with the given name', () => {
    const bytes = new Uint8Array([37, 80, 68, 70])
    const file = savePdf(bytes, 'copy.pdf') as unknown as MockFileInstance
    expect(file.uri).toBe('file:///cache/copy.pdf')
    expect(file.create).toHaveBeenCalled()
    expect(file.write).toHaveBeenCalledWith(bytes)
    expect(file.delete).not.toHaveBeenCalled()
  })

  it('Should replace a previous copy with the same name', () => {
    const existing = (File as unknown as { existing: Set<string> }).existing
    existing.add('old.pdf')
    const file = fileNamed('old.pdf')
    expect(file.delete).toHaveBeenCalled()
    expect(file.create).toHaveBeenCalled()
    expect(file.write).toHaveBeenCalled()
    existing.clear()
  })
})

describe('openPdf', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    isAvailable.mockResolvedValue(true)
  })
  afterAll(() => setPlatform(originalOS))

  it('Should open the pdf in a viewer on android', async () => {
    setPlatform('android')
    startActivity.mockResolvedValue({ resultCode: 0 })
    const file = fileNamed('copy.pdf')
    await openPdf(file as never)
    expect(startActivity).toHaveBeenCalledWith('android.intent.action.VIEW', {
      data: 'content://flashid/copy.pdf',
      flags: 1,
      type: 'application/pdf',
    })
    expect(share).not.toHaveBeenCalled()
  })

  it('Should fall back to the share sheet when android has no viewer', async () => {
    setPlatform('android')
    startActivity.mockRejectedValue(new Error('No Activity found'))
    const file = fileNamed('copy.pdf')
    await openPdf(file as never)
    expect(share).toHaveBeenCalledWith('file:///cache/copy.pdf', {
      dialogTitle: 'Certified copy',
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
    })
  })

  it('Should present the pdf through the share sheet on ios', async () => {
    setPlatform('ios')
    const file = fileNamed('copy.pdf')
    await openPdf(file as never)
    expect(startActivity).not.toHaveBeenCalled()
    expect(share).toHaveBeenCalledWith(
      'file:///cache/copy.pdf',
      expect.objectContaining({ UTI: 'com.adobe.pdf' })
    )
  })

  it('Should fail when the device cannot share files', async () => {
    setPlatform('ios')
    isAvailable.mockResolvedValue(false)
    const file = fileNamed('copy.pdf')
    await expect(openPdf(file as never)).rejects.toThrow(
      'Sharing is not available on this device.'
    )
    expect(share).not.toHaveBeenCalled()
  })
})
