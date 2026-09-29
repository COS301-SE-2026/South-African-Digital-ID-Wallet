import certifiedCopyUrls from '../certified-copy-urls'
import certifiedCopyService from '../certified-copy-service'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}))

import api from '@/lib/api'

describe('certifiedCopyUrls', () => {
  it('generate returns the correct URL', () => {
    expect(certifiedCopyUrls.generate('c-1')).toBe(
      '/api/certified-copies/credentials/c-1'
    )
  })

  it('generate encodes the credential ID', () => {
    expect(certifiedCopyUrls.generate('a/b c?')).toBe(
      '/api/certified-copies/credentials/a%2Fb%20c%3F'
    )
  })
})

describe('certifiedCopyService', () => {
  let mockPost: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockPost = api.post as jest.Mock
  })

  it('generates an identity document certified copy', async () => {
    const pdfBlob = new Blob(['pdf-content'], {
      type: 'application/pdf',
    })

    mockPost.mockResolvedValue({
      data: pdfBlob,
      headers: {
        'content-disposition':
          'attachment; filename="certified-identity-document.pdf"',
      },
    })

    const result = await certifiedCopyService.generate('c-1', {
      credentialType: 'IdentityDocument',
    })

    expect(mockPost).toHaveBeenCalledWith(
      '/api/certified-copies/credentials/c-1',
      {
        credentialType: 'IdentityDocument',
      },
      {
        headers: {
          Accept: 'application/pdf',
        },
        responseType: 'blob',
      }
    )

    expect(result.blob).toBe(pdfBlob)
    expect(result.fileName).toBe('certified-identity-document.pdf')
  })

  it('generates a drivers licence certified copy', async () => {
    const pdfBlob = new Blob(['pdf-content'], {
      type: 'application/pdf',
    })

    mockPost.mockResolvedValue({
      data: pdfBlob,
      headers: {
        'content-disposition':
          'attachment; filename="certified-drivers-license.pdf"',
      },
    })

    const result = await certifiedCopyService.generate('c-2', {
      credentialType: 'DriversLicense',
    })

    expect(mockPost).toHaveBeenCalledWith(
      '/api/certified-copies/credentials/c-2',
      {
        credentialType: 'DriversLicense',
      },
      {
        headers: {
          Accept: 'application/pdf',
        },
        responseType: 'blob',
      }
    )

    expect(result.blob).toBe(pdfBlob)
    expect(result.fileName).toBe('certified-drivers-license.pdf')
  })

  it('uses a fallback filename when content-disposition is missing', async () => {
    const pdfBlob = new Blob(['pdf-content'], {
      type: 'application/pdf',
    })

    mockPost.mockResolvedValue({
      data: pdfBlob,
      headers: {},
    })

    const result = await certifiedCopyService.generate('c-1', {
      credentialType: 'IdentityDocument',
    })

    expect(result.blob).toBe(pdfBlob)
    expect(result.fileName).toBeTruthy()
  })

  it('propagates an error when certified copy generation fails', async () => {
    mockPost.mockRejectedValue(new Error('Certified copy generation failed'))

    await expect(
      certifiedCopyService.generate('c-1', {
        credentialType: 'IdentityDocument',
      })
    ).rejects.toThrow('Certified copy generation failed')
  })
})
