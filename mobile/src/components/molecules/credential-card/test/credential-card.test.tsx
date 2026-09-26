import { fireEvent, render, screen } from '@testing-library/react-native'
import type { LucideIcon } from 'lucide-react-native'
import { StyleSheet } from 'react-native'

import { colors } from '@/theme/colors'

import { CREDENTIAL_PATTERN, CredentialCard } from '../credential-card'

const MockIcon = jest.fn(() => null) as unknown as jest.Mock & LucideIcon

const base = {
  height: 150,
  Icon: MockIcon,
  issuedBy: 'Home Affairs Cape Town',
  title: 'National ID Card',
}

type IconProps = { color: string; size: number }

const HIDDEN = { includeHiddenElements: true }

const iconCalls = () =>
  (MockIcon as jest.Mock).mock.calls.map(([props]) => props as IconProps)

describe('<CredentialCard/>', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should show the title, the issued by label and the issuer', async () => {
    await render(<CredentialCard {...base} testID="card" />)
    expect(screen.getByText('National ID Card')).toBeTruthy()
    expect(screen.getByText('Issued by')).toBeTruthy()
    expect(screen.getByText('Home Affairs Cape Town')).toBeTruthy()
  })

  it('Should expose a descriptive accessible name', async () => {
    await render(<CredentialCard {...base} testID="card" />)
    expect(
      screen.getByLabelText(
        'National ID Card, issued by Home Affairs Cape Town'
      )
    ).toBeTruthy()
  })

  it('Should use the given height', async () => {
    await render(<CredentialCard {...base} testID="card" />)
    expect(screen.getByTestId('card')).toHaveStyle({ height: 150 })
  })

  it('Should fire onPress when pressable', async () => {
    const onPress = jest.fn()
    await render(<CredentialCard {...base} onPress={onPress} testID="card" />)
    await fireEvent.press(screen.getByTestId('card'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('Should be disabled without an onPress', async () => {
    await render(<CredentialCard {...base} testID="card" />)
    expect(screen.getByTestId('card').props.accessibilityState.disabled).toBe(
      true
    )
  })
})

describe('<CredentialCard/> icon and pattern', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should draw the credential icon in the tile and across the pattern', async () => {
    await render(<CredentialCard {...base} testID="card" />)
    const calls = iconCalls()
    expect(calls).toHaveLength(CREDENTIAL_PATTERN.length + 1)
    expect(calls).toContainEqual(
      expect.objectContaining({ color: colors.green, size: 30 })
    )
  })

  it('Should mix strong and soft icons in the pattern', async () => {
    await render(<CredentialCard {...base} testID="card" />)
    const colours = iconCalls().map((props) => props.color)
    expect(colours).toContain(colors.primaryGreen)
    expect(colours.filter((colour) => colour === colors.green).length).toBe(
      CREDENTIAL_PATTERN.filter((item) => item.strong).length + 1
    )
  })

  it('Should tilt and fade every pattern icon', async () => {
    await render(<CredentialCard {...base} testID="card" />)
    const pattern = screen.getByTestId('card-pattern', HIDDEN)
    expect(pattern.children).toHaveLength(CREDENTIAL_PATTERN.length)
    CREDENTIAL_PATTERN.forEach((item, index) => {
      const style = StyleSheet.flatten(
        (pattern.children[index] as unknown as { props: { style: object } })
          .props.style
      )
      expect(style).toMatchObject({
        opacity: item.opacity,
        right: item.right,
        top: item.top,
        transform: [{ rotate: '-28deg' }],
      })
    })
  })

  it('Should hide the decorative pattern from screen readers and touches', async () => {
    await render(<CredentialCard {...base} testID="card" />)
    const pattern = screen.getByTestId('card-pattern', HIDDEN)
    expect(pattern.props.accessibilityElementsHidden).toBe(true)
    expect(pattern.props.importantForAccessibility).toBe('no-hide-descendants')
    expect(pattern.props.pointerEvents).toBe('none')
  })

  it('Should skip pattern and hint test ids without a card test id', async () => {
    await render(<CredentialCard {...base} hint="Tap to unlock" />)
    expect(screen.queryByTestId('undefined-pattern', HIDDEN)).toBeNull()
    expect(screen.getByText('Tap to unlock')).toBeTruthy()
  })
})

describe('<CredentialCard/> hint', () => {
  it('Should render the hint at the bottom of the card', async () => {
    await render(
      <CredentialCard {...base} hint="Tap to unlock" testID="card" />
    )
    expect(screen.getByTestId('card-hint')).toBeTruthy()
    expect(screen.getByText('Tap to unlock')).toBeTruthy()
  })
  it('Should announce the hint to screen readers', async () => {
    await render(
      <CredentialCard {...base} hint="Tap to unlock" testID="card" />
    )
    expect(screen.getByTestId('card').props.accessibilityHint).toBe(
      'Tap to unlock'
    )
  })
  it('Should omit the hint when not given', async () => {
    await render(<CredentialCard {...base} testID="card" />)
    expect(screen.queryByTestId('card-hint')).toBeNull()
  })
})
