import { loginDto, verifyDeviceDto } from '../login-dto'

describe('loginDto', () => {
  it('Should default rememberMe to false when the field is absent', () => {
    expect(
      loginDto({ email: 'thabo@flashid.co.za', password: 'hunter2' })
    ).toEqual({
      email: 'thabo@flashid.co.za',
      password: 'hunter2',
      rememberMe: false,
    })
  })

  it('Should preserve rememberMe when explicitly false', () => {
    expect(
      loginDto({
        email: 'thabo@flashid.co.za',
        password: 'hunter2',
        rememberMe: false,
      })
    ).toEqual(expect.objectContaining({ rememberMe: false }))
  })

  it('Should pass the email through unchanged', () => {
    expect(
      loginDto({ email: ' thabo@flashid.co.za ', password: 'hunter2' }).email
    ).toBe(' thabo@flashid.co.za ')
  })
})

describe('verifyDeviceDto', () => {
  it('Should map every device field and default rememberMe', () => {
    expect(
      verifyDeviceDto({
        deviceVerificationId: 'dv-1',
        otp: '123456',
        deviceType: 'Desktop',
        operatingSystem: 'macOS',
        browser: 'Chrome',
      })
    ).toEqual({
      deviceVerificationId: 'dv-1',
      otp: '123456',
      deviceType: 'Desktop',
      operatingSystem: 'macOS',
      browser: 'Chrome',
      rememberMe: false,
    })
  })
})
