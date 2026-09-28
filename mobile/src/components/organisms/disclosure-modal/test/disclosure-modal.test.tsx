import { fireEvent, render, screen } from '@testing-library/react-native'

import { MANDATORY_FIELDS, OPTIONAL_FIELDS } from '@/services/qr-service'

import { DisclosureModal } from '../disclosure-modal'

const setup = async (onConfirm = jest.fn(), onClose = jest.fn()) => {
  await render(
    <DisclosureModal
      credentialType="identityDocument"
      isVisible
      onClose={onClose}
      onConfirm={onConfirm}
    />
  )
  return { onClose, onConfirm }
}

describe('<DisclosureModal/>', () => {
  it('Should lock every mandatory field on', async () => {
    await setup()
    for (const field of MANDATORY_FIELDS.identityDocument) {
      const toggle = screen.getByTestId(`disclosure-mandatory-${field}-switch`)
      expect(toggle.props.value).toBe(true)
      expect(toggle.props.disabled).toBe(true)
    }
  })
  it('Should start with every optional field off', async () => {
    await setup()
    for (const field of OPTIONAL_FIELDS.identityDocument) {
      expect(
        screen.getByTestId(`disclosure-optional-${field}-switch`).props.value
      ).toBe(false)
    }
  })
  it('Should count only mandatory fields before any opt-in', async () => {
    await setup()
    const count = MANDATORY_FIELDS.identityDocument.length
    expect(screen.getByText(`${count} fields will be shared`)).toBeTruthy()
  })
  it('Should raise the count as optional fields are turned on', async () => {
    await setup()
    await fireEvent(
      screen.getByTestId('disclosure-optional-Gender-switch'),
      'valueChange',
      true
    )
    const count = MANDATORY_FIELDS.identityDocument.length + 1
    expect(screen.getByText(`${count} fields will be shared`)).toBeTruthy()
  })
  it('Should confirm with only the selected optional fields', async () => {
    const { onConfirm } = await setup()
    await fireEvent(
      screen.getByTestId('disclosure-optional-Gender-switch'),
      'valueChange',
      true
    )
    await fireEvent.press(screen.getByTestId('disclosure-confirm'))
    expect(onConfirm).toHaveBeenCalledWith(['Gender'])
  })
  it('Should confirm with an empty list when nothing extra is chosen', async () => {
    const { onConfirm } = await setup()
    await fireEvent.press(screen.getByTestId('disclosure-confirm'))
    expect(onConfirm).toHaveBeenCalledWith([])
  })
  it('Should drop a field that is toggled back off', async () => {
    const { onConfirm } = await setup()
    await fireEvent(
      screen.getByTestId('disclosure-optional-Gender-switch'),
      'valueChange',
      true
    )
    await fireEvent(
      screen.getByTestId('disclosure-optional-Gender-switch'),
      'valueChange',
      false
    )
    await fireEvent.press(screen.getByTestId('disclosure-confirm'))
    expect(onConfirm).toHaveBeenCalledWith([])
  })
  it('Should close from the backdrop', async () => {
    const { onClose } = await setup()
    await fireEvent.press(screen.getByTestId('disclosure-backdrop'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
  it('Should close from the header button', async () => {
    const { onClose } = await setup()
    await fireEvent.press(screen.getByTestId('disclosure-close'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
  it('Should offer the drivers licence field set', async () => {
    await render(
      <DisclosureModal
        credentialType="driversLicense"
        isVisible
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />
    )
    for (const field of MANDATORY_FIELDS.driversLicense) {
      expect(
        screen.getByTestId(`disclosure-mandatory-${field}-switch`)
      ).toBeTruthy()
    }
  })
})
