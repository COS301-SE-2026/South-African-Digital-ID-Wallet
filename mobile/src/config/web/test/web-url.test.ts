import { WEB_BASE_URL, webUrl } from '../web-url'

describe('webUrl', () => {
  it('Should join a path onto the web portal URL', () => {
    expect(webUrl('/forgot-password')).toBe(
      `${WEB_BASE_URL.replace(/\/$/, '')}/forgot-password`
    )
  })

  it('Should never produce a double slash after the host', () => {
    expect(webUrl('/forgot-password')).not.toMatch(/[^:]\/\//)
  })
})
