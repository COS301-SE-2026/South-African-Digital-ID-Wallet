import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { FraudAlertFlow } from '../fraud-alert-flow'
import type { SecurityAlert } from '../types'

import { fraudDetectionService } from '@/services/fraud-detection-service'

jest.mock('@/services/fraud-detection-service', () => ({
  fraudDetectionService: { secureAccount: jest.fn(), dismissAlert: jest.fn() },
}))

const alert: SecurityAlert = {
  id: 'alert-1',
  severity: 'high',
  title: 'Suspicious login activity',
  summary: 'A suspicious login was detected.',
  detailsDescription: 'Impossible travel was detected.',
  newLogin: {
    location: 'Cape Town',
    timestamp: '29 September 2026 • 10:30',
  },
  previousLogin: {
    location: 'Johannesburg',
    timestamp: '29 September 2026 • 08:00',
  },
  travel: {
    distance: '1,400 km',
    impliedSpeed: '560 km/h',
    timeBetweenLogins: '~2 hours 30 minutes',
  },
  device: {
    name: 'Chrome on Windows',
    ipAddress: '192.168.1.10',
    locationAccuracy: 'Approximate location',
  },
}
describe('FraudAlertFlow', () => {
  it('renders the security alert card', () => {
    render(<FraudAlertFlow alert={alert} />)
    expect(
      screen.getByRole('region', {
        name: /security alert/i,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/suspicious activity detected/i)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /review security event/i,
      })
    ).toBeInTheDocument()
  })
  it('opens the fraud summary modal', () => {
    render(<FraudAlertFlow alert={alert} />)
    fireEvent.click(
      screen.getByRole('button', {
        name: /review security event/i,
      })
    )
    expect(
      screen.getByRole('heading', {
        name: /suspicious login activity/i,
      })
    ).toBeInTheDocument()
  })
  it('opens the account security guidance layer', () => {
    render(<FraudAlertFlow alert={alert} />)
    fireEvent.click(
      screen.getByRole('button', {
        name: /review security event/i,
      })
    )
    fireEvent.click(
      screen.getByRole('button', {
        name: /how to keep your account secure/i,
      })
    )
    expect(
      screen.getByRole('heading', {
        name: /keep your account secure/i,
      })
    ).toBeInTheDocument()
  })
  it('closes the fraud alert modal', () => {
    render(<FraudAlertFlow alert={alert} />)
    fireEvent.click(
      screen.getByRole('button', {
        name: /review security event/i,
      })
    )
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Close dialog',
      })
    )
    expect(
      screen.queryByRole('heading', {
        name: /suspicious login activity/i,
      })
    ).not.toBeInTheDocument()
  })
  it('renders the correct risk level', () => {
    render(
      <FraudAlertFlow
        alert={{
          ...alert,
          severity: 'medium',
        }}
      />
    )
    expect(screen.getByText('Medium risk')).toBeInTheDocument()
    expect(screen.queryByText('High risk')).not.toBeInTheDocument()
  })
})

describe('FraudAlertFlow security actions', () => {
  beforeEach(() => jest.clearAllMocks())
  const openGuidance = (onResolved?: () => Promise<void>) => {
    render(<FraudAlertFlow alert={alert} onResolved={onResolved} />)
    fireEvent.click(
      screen.getByRole('button', { name: /review security event/i })
    )
    fireEvent.click(
      screen.getByRole('button', { name: /how to keep your account secure/i })
    )
  }
  const confirmAction = (name: RegExp) => {
    fireEvent.click(screen.getByRole('button', { name }))
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Current password'), {
      target: { value: 'secret123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
  }
  it.each(['Devices secured.', ''])(
    'logs out other devices and shows the success message (%s)',
    async (message) => {
      jest
        .mocked(fraudDetectionService.secureAccount)
        .mockResolvedValueOnce({ message } as Awaited<
          ReturnType<typeof fraudDetectionService.secureAccount>
        >)
      const onResolved = jest.fn().mockResolvedValue(undefined)
      openGuidance(onResolved)
      confirmAction(/log out from all other devices/i)
      expect(await screen.findByRole('status')).toHaveTextContent(
        message || 'All other devices have been logged out.'
      )
      await waitFor(() =>
        expect(
          screen.queryByLabelText('Current password')
        ).not.toBeInTheDocument()
      )
      expect(fraudDetectionService.secureAccount).toHaveBeenCalledWith(
        'alert-1',
        { action: 'LogOutOtherDevices', password: 'secret123' }
      )
      expect(onResolved).toHaveBeenCalledTimes(1)
    }
  )
  it('dismisses an alert after password confirmation', async () => {
    jest
      .mocked(fraudDetectionService.dismissAlert)
      .mockResolvedValueOnce(undefined)
    const onResolved = jest.fn().mockResolvedValue(undefined)
    openGuidance(onResolved)
    confirmAction(/dismiss security alert/i)
    expect(await screen.findByRole('status')).toHaveTextContent(
      'The security alert has been dismissed.'
    )
    await waitFor(() =>
      expect(
        screen.queryByLabelText('Current password')
      ).not.toBeInTheDocument()
    )
    expect(fraudDetectionService.dismissAlert).toHaveBeenCalledWith('alert-1', {
      password: 'secret123',
    })
    expect(onResolved).toHaveBeenCalledTimes(1)
  })
  it.each([
    ['logout', new Error('Incorrect password.'), 'Incorrect password.'],
    [
      'logout',
      'network failed',
      'We could not complete that security action. Please try again.',
    ],
    ['dismiss', new Error('Alert unavailable.'), 'Alert unavailable.'],
    [
      'dismiss',
      new Error(''),
      'We could not complete that security action. Please try again.',
    ],
  ])(
    'keeps the password prompt open when %s fails',
    async (action, error, message) => {
      const service =
        action === 'logout'
          ? fraudDetectionService.secureAccount
          : fraudDetectionService.dismissAlert
      jest.mocked(service).mockRejectedValueOnce(error)
      const onResolved = jest.fn().mockResolvedValue(undefined)
      openGuidance(onResolved)
      confirmAction(
        action === 'logout'
          ? /log out from all other devices/i
          : /dismiss security alert/i
      )
      expect(await screen.findByRole('status')).toHaveTextContent(message)
      expect(screen.getByLabelText('Current password')).toBeInTheDocument()
      expect(onResolved).not.toHaveBeenCalled()
    }
  )
  it.each([
    [/check recent activity/i, 'activity-overview'],
    [/review trusted devices/i, 'trusted-devices-overview'],
  ])(
    'closes the dialog and scrolls to the selected section',
    async (name, id) => {
      const section = document.createElement('section')
      section.id = id
      section.scrollIntoView = jest.fn()
      document.body.appendChild(section)
      try {
        openGuidance()
        fireEvent.click(screen.getByRole('button', { name }))
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        await waitFor(() =>
          expect(section.scrollIntoView).toHaveBeenCalledWith({
            behavior: 'smooth',
            block: 'center',
          })
        )
      } finally {
        section.remove()
      }
    }
  )
  it('opens the password-change dialog from guidance', () => {
    openGuidance()
    fireEvent.click(
      screen.getByRole('button', { name: /change your password/i })
    )
    expect(
      screen.getByRole('heading', { name: 'Update Password' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Keep your account secure' })
    ).not.toBeInTheDocument()
  })
  it('renders low-risk alerts', () => {
    render(<FraudAlertFlow alert={{ ...alert, severity: 'low' }} />)
    expect(screen.getByText('Low risk')).toBeInTheDocument()
  })
})
