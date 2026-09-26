import { Directory } from 'expo-file-system'
import { startActivityAsync } from 'expo-intent-launcher'
import * as Sharing from 'expo-sharing'
import { Platform } from 'react-native'

import { clearCertifiedCopies, deletePdf, openPdf, savePdf } from '../pdf-file'

jest.mock('expo-file-system', () => {
  const existing = new Set<string>()
  class MockDirectory {
    static existing = existing
    static instances: MockDirectory[] = []
    uri: string
    create = jest.fn(() => existing.add(this.uri))
    delete = jest.fn(() => existing.delete(this.uri))
    constructor(parent: { uri: string }, name: string) {
      this.uri = `${parent.uri}${name}/`
      MockDirectory.instances.push(this)
    }
    get exists() {
      return existing.has(this.uri)
    }
  }
  class MockFile {
    uri: string
    contentUri: string
    create = jest.fn(() => existing.add(this.uri))
    delete = jest.fn(() => existing.delete(this.uri))
    write = jest.fn()
    constructor(directory: { uri: string }, name: string) {
      this.uri = `${directory.uri}${name}`
      this.contentUri = `content://flashid/${name}`
    }
    get exists() {
      return existing.has(this.uri)
    }
  }
  return {
    Directory: MockDirectory,
    File: MockFile,
    Paths: { cache: { uri: 'file:///cache/' } },
  }
})
jest.mock('expo-intent-launcher', () => ({ startActivityAsync: jest.fn() }))
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}))

type MockEntry = {
  contentUri: string
  create: jest.Mock
  delete: jest.Mock
  exists: boolean
  uri: string
  write: jest.Mock
}

const MockDirectory = Directory as unknown as {
  existing: Set<string>
  instances: MockEntry[]
}
const startActivity = startActivityAsync as jest.Mock
const isAvailable = Sharing.isAvailableAsync as jest.Mock
const share = Sharing.shareAsync as jest.Mock
const originalOS = Platform.OS

const COPY_DIRECTORY = 'file:///cache/certified-copies/'

const setPlatform = (os: typeof Platform.OS) =>
  Object.defineProperty(Platform, 'OS', { configurable: true, value: os })

const fileNamed = (name: string) =>
  savePdf(new Uint8Array([1]), name) as unknown as MockEntry

const resetFileSystem = () => {
  MockDirectory.existing.clear()
  MockDirectory.instances.length = 0
}

describe('savePdf', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    resetFileSystem()
  })

  it('Should write the bytes into the certified copies cache folder', () => {
    const bytes = new Uint8Array([37, 80, 68, 70])
    const file = savePdf(bytes, 'copy.pdf') as unknown as MockEntry
    expect(file.uri).toBe(`${COPY_DIRECTORY}copy.pdf`)
    expect(file.create).toHaveBeenCalled()
    expect(file.write).toHaveBeenCalledWith(bytes)
  })

  it('Should create the folder before writing', () => {
    savePdf(new Uint8Array([1]), 'copy.pdf')
    const folder = MockDirectory.instances.at(-1)
    expect(folder?.create).toHaveBeenCalledWith({
      idempotent: true,
      intermediates: true,
    })
  })

  it('Should clear older certified copies before writing a new one', () => {
    MockDirectory.existing.add(COPY_DIRECTORY)
    MockDirectory.existing.add(`${COPY_DIRECTORY}old.pdf`)
    savePdf(new Uint8Array([1]), 'new.pdf')
    const [cleared] = MockDirectory.instances
    expect(cleared.delete).toHaveBeenCalled()
  })

  it('Should not try to clear a folder that does not exist yet', () => {
    savePdf(new Uint8Array([1]), 'copy.pdf')
    const [first] = MockDirectory.instances
    expect(first.delete).not.toHaveBeenCalled()
  })
})

describe('clearCertifiedCopies', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    resetFileSystem()
  })

  it('Should delete the certified copies folder when present', () => {
    MockDirectory.existing.add(COPY_DIRECTORY)
    clearCertifiedCopies()
    expect(MockDirectory.instances[0].delete).toHaveBeenCalled()
    expect(MockDirectory.existing.has(COPY_DIRECTORY)).toBe(false)
  })

  it('Should do nothing when there is no folder', () => {
    clearCertifiedCopies()
    expect(MockDirectory.instances[0].delete).not.toHaveBeenCalled()
  })
})

describe('deletePdf', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    resetFileSystem()
  })

  it('Should remove a saved copy', () => {
    const file = fileNamed('copy.pdf')
    deletePdf(file as never)
    expect(file.delete).toHaveBeenCalled()
    expect(file.exists).toBe(false)
  })

  it('Should skip a copy that is already gone', () => {
    const file = fileNamed('copy.pdf')
    deletePdf(file as never)
    file.delete.mockClear()
    deletePdf(file as never)
    expect(file.delete).not.toHaveBeenCalled()
  })
})

describe('openPdf', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    resetFileSystem()
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

  it('Should warn and fall back to the share sheet when android has no viewer', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(jest.fn())
    setPlatform('android')
    const failure = new Error('No Activity found')
    startActivity.mockRejectedValue(failure)
    const file = fileNamed('copy.pdf')
    await openPdf(file as never)
    expect(warn).toHaveBeenCalledWith(
      'No PDF viewer, falling back to share',
      failure
    )
    expect(share).toHaveBeenCalledWith(`${COPY_DIRECTORY}copy.pdf`, {
      dialogTitle: 'Certified copy',
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
    })
    warn.mockRestore()
  })

  it('Should present the pdf through the share sheet on ios', async () => {
    setPlatform('ios')
    const file = fileNamed('copy.pdf')
    await openPdf(file as never)
    expect(startActivity).not.toHaveBeenCalled()
    expect(share).toHaveBeenCalledWith(
      `${COPY_DIRECTORY}copy.pdf`,
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
