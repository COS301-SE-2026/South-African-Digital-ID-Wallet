import { render, screen } from '@testing-library/react-native'

import { useIdentityStatus } from '@/hooks'

import { IdentityStatusPanel } from '../identity-status-panel'

jest.mock('@/hooks', () => ({ useIdentityStatus: jest.fn() }))

const mockHook = useIdentityStatus as jest.Mock

const LOADING_STATE = { isError: false, isPending: true, summary: {} }
const ERROR_STATE = { isError: true, isPending: false, summary: {} }
const SUMMARY_DATA = {
  description: 'Your identity is fully verified',
  label: 'Identity Status',
  status: 'verified',
  tone: 'soft-green',
  value: 'Verified',
}
const SUCCESS_STATE = {
  isError: false,
  isPending: false,
  summary: SUMMARY_DATA,
}

describe('<IdentityStatusPanel/>', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should show a skeleton while loading', async () => {
    mockHook.mockReturnValue(LOADING_STATE)
    await render(<IdentityStatusPanel />)
    const skeleton = screen.getByTestId('identity-status-loading')
    expect(skeleton).toBeTruthy()
  })
  it('Should show an error message when the query fails', async () => {
    mockHook.mockReturnValue(ERROR_STATE)
    await render(<IdentityStatusPanel />)
    const error = screen.getByTestId('identity-status-error')
    expect(error).toBeTruthy()
  })
  it('Should render the resolved status summary', async () => {
    mockHook.mockReturnValue(SUCCESS_STATE)
    await render(<IdentityStatusPanel />)
    const verifiedText = screen.getByText('Verified')
    const descText = screen.getByText('Your identity is fully verified')
    expect(verifiedText).toBeTruthy()
    expect(descText).toBeTruthy()
  })
})
