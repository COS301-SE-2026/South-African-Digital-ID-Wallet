import { loginDto } from '../login-dto'

describe('loginDto', () => {
  it('Should trim the email and always request a persistent session', () => {
    expect(
      loginDto({ email: ' thabo@flashid.co.za ', password: ' pw ' })
    ).toEqual({
      email: 'thabo@flashid.co.za',
      password: ' pw ',
      rememberMe: true,
    })
  })
})
