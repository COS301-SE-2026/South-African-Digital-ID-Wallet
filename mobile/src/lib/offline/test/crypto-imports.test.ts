import { p256 } from '@noble/curves/nist.js'
import { sha256 } from '@noble/hashes/sha2.js'
import { base64urlnopad } from '@scure/base'

describe('offline crypto dependencies', () => {
  it('load under jest and agree on encodings', () => {
    const digest = sha256(new Uint8Array([1, 2, 3]))

    expect(digest).toHaveLength(32)
    // The backend emits unpadded base64url, so the decoder has to match that alphabet exactly.
    expect(base64urlnopad.encode(digest)).not.toContain('=')
    expect(typeof p256.verify).toBe('function')
  })
})
