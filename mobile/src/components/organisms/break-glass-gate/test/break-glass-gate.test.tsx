import { act, fireEvent, render, screen } from '@testing-library/react-native'

import { BreakGlassGate } from '../break-glass-gate'

const setup = async (overrides = {}) => {
  const onCancel = jest.fn()
  const onConfirm = jest.fn()
  await render(
    <BreakGlassGate onCancel={onCancel} onConfirm={onConfirm} {...overrides} />
  )
  return { onCancel, onConfirm }
}

const typeReason = async (value: string) => {
  await act(async () => {
    fireEvent.changeText(screen.getByTestId('break-glass-reason'), value)
  })
}

describe('<BreakGlassGate/>', () => {
  it('Should warn that a medical record is being opened', async () => {
    await setup()
    expect(screen.getByText('You are opening a medical record')).toBeTruthy()
  })

  it('Should tell the responder that the citizen will be told', async () => {
    await setup()
    expect(
      screen.getByText(/tell the citizen and their emergency contacts/i)
    ).toBeTruthy()
  })

  it('Should not confirm with a reason that is too short', async () => {
    const { onConfirm } = await setup()
    await typeReason('short')
    fireEvent.press(screen.getByTestId('break-glass-confirm'))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('Should nudge when the reason is started but too short', async () => {
    await setup()
    await typeReason('short')
    expect(screen.getByText(/a little more detail/i)).toBeTruthy()
  })

  it('Should confirm with the trimmed reason', async () => {
    const { onConfirm } = await setup()
    await typeReason('  Unconscious patient at scene  ')
    fireEvent.press(screen.getByTestId('break-glass-confirm'))
    expect(onConfirm).toHaveBeenCalledWith('Unconscious patient at scene')
  })

  it('Should cancel without a reason', async () => {
    const { onCancel } = await setup()
    fireEvent.press(screen.getByTestId('break-glass-cancel'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('Should render a server error', async () => {
    await setup({ error: 'This emergency code is not valid.' })
    expect(screen.getByTestId('break-glass-error')).toBeTruthy()
  })
})
