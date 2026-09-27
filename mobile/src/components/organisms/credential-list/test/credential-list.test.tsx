import { fireEvent, render, screen } from '@testing-library/react-native'
import { Car, IdCard } from 'lucide-react-native'

import type { WalletCredential } from '@/services'

import {
  CREDENTIAL_LIST_CARD_HEIGHT,
  CredentialList,
  credentialIconFor,
} from '../credential-list'

const credential = (
  id: string,
  title: string,
  overrides: Partial<WalletCredential> = {}
): WalletCredential => ({
  fields: [],
  id,
  isVerified: true,
  issuedBy: 'Department of Home Affairs',
  issuedOn: '02 Feb 2026',
  status: 'Active',
  title,
  tone: 'green',
  type: 'IdentityDocument',
  ...overrides,
})

const CREDENTIALS = [
  credential('id-1', 'National ID Card'),
  credential('dl-1', "Driver's Licence", {
    issuedBy: 'Department of Transport',
    tone: 'blue',
    type: 'DriversLicense',
  }),
]

describe('<CredentialList/>', () => {
  it('Should render one plain card per credential', async () => {
    await render(
      <CredentialList credentials={CREDENTIALS} onSelect={jest.fn()} />
    )
    expect(screen.getByText('National ID Card')).toBeTruthy()
    expect(screen.getByText("Driver's Licence")).toBeTruthy()
    expect(screen.getByTestId('credential-card-id-1')).toBeTruthy()
    expect(screen.getByTestId('credential-card-dl-1')).toBeTruthy()
  })

  it('Should render every card at the same fixed height', async () => {
    await render(
      <CredentialList credentials={CREDENTIALS} onSelect={jest.fn()} />
    )
    for (const item of CREDENTIALS) {
      expect(screen.getByTestId(`credential-card-${item.id}`)).toHaveStyle({
        height: CREDENTIAL_LIST_CARD_HEIGHT,
      })
    }
  })

  it('Should show an unlock hint on every card', async () => {
    await render(
      <CredentialList credentials={CREDENTIALS} onSelect={jest.fn()} />
    )
    expect(screen.getAllByText('Tap to unlock')).toHaveLength(2)
  })

  it('Should select any card straight away when pressed', async () => {
    const onSelect = jest.fn()
    await render(
      <CredentialList credentials={CREDENTIALS} onSelect={onSelect} />
    )
    await fireEvent.press(screen.getByTestId('credential-card-dl-1'))
    expect(onSelect).toHaveBeenCalledWith(CREDENTIALS[1])
    await fireEvent.press(screen.getByTestId('credential-card-id-1'))
    expect(onSelect).toHaveBeenCalledWith(CREDENTIALS[0])
    expect(onSelect).toHaveBeenCalledTimes(2)
  })

  it('Should render an empty list without crashing', async () => {
    await render(<CredentialList credentials={[]} onSelect={jest.fn()} />)
    expect(screen.getByTestId('credential-list')).toBeTruthy()
    expect(screen.queryByText('Tap to unlock')).toBeNull()
  })
})

describe('credentialIconFor', () => {
  it.each([
    ['IdentityDocument', IdCard],
    ['identitydocument', IdCard],
    ['DriversLicense', Car],
    ['  DRIVERSLICENSE  ', Car],
  ])('Should map %p to its icon', (type, expected) => {
    expect(credentialIconFor(type)).toBe(expected)
  })
  it.each([undefined, '', 'Passport'])(
    'Should fall back to the ID icon for %p',
    (type) => {
      expect(credentialIconFor(type)).toBe(IdCard)
    }
  )
})
