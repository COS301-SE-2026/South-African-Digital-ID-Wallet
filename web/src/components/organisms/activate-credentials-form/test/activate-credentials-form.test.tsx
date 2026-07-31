import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActivateCredentialsForm } from '../activate-credentials-form'
import type { ActivateCredentialsSelection } from '../types'

const baseSelection: ActivateCredentialsSelection = {
  identityDocument: false,
  driversLicense: false,
}

describe('ActivateCredentialsForm', () => {
  it('renders the heading and both credential cards', () => {
    render(
      <ActivateCredentialsForm
        identityDocumentAvailable={true}
        driversLicenseAvailable={true}
        selection={baseSelection}
        onSelectionChange={() => {}}
        onSubmit={() => {}}
        onBack={() => {}}
      />
    )
    expect(
      screen.getByText('Activate your digital credentials')
    ).toBeInTheDocument()
    expect(
      screen.getByText('South African Identity Document')
    ).toBeInTheDocument()
    expect(screen.getByText("Driver's Licence")).toBeInTheDocument()
  })

  it('renders the "Why activate credentials?" info panel', () => {
    render(
      <ActivateCredentialsForm
        identityDocumentAvailable={true}
        driversLicenseAvailable={true}
        selection={baseSelection}
        onSelectionChange={() => {}}
        onSubmit={() => {}}
        onBack={() => {}}
      />
    )
    expect(screen.getByText('Why activate credentials?')).toBeInTheDocument()
    expect(
      screen.getByText('Prove your identity instantly')
    ).toBeInTheDocument()
  })

  it('disables the submit button when nothing is selected', () => {
    render(
      <ActivateCredentialsForm
        identityDocumentAvailable={true}
        driversLicenseAvailable={true}
        selection={baseSelection}
        onSelectionChange={() => {}}
        onSubmit={() => {}}
        onBack={() => {}}
      />
    )
    expect(
      screen.getByRole('button', { name: /activate selected credentials/i })
    ).toBeDisabled()
  })

  it('enables the submit button once a credential is selected', () => {
    render(
      <ActivateCredentialsForm
        identityDocumentAvailable={true}
        driversLicenseAvailable={true}
        selection={{ identityDocument: true, driversLicense: false }}
        onSelectionChange={() => {}}
        onSubmit={() => {}}
        onBack={() => {}}
      />
    )
    expect(
      screen.getByRole('button', { name: /activate selected credentials/i })
    ).not.toBeDisabled()
  })

  it('calls onSelectionChange with the identity document toggled on', async () => {
    const user = userEvent.setup()
    const onSelectionChange = jest.fn()
    render(
      <ActivateCredentialsForm
        identityDocumentAvailable={true}
        driversLicenseAvailable={true}
        selection={baseSelection}
        onSelectionChange={onSelectionChange}
        onSubmit={() => {}}
        onBack={() => {}}
      />
    )
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])
    expect(onSelectionChange).toHaveBeenCalledWith({
      identityDocument: true,
      driversLicense: false,
    })
  })

  it('calls onSubmit when the submit button is clicked with a selection', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(
      <ActivateCredentialsForm
        identityDocumentAvailable={true}
        driversLicenseAvailable={true}
        selection={{ identityDocument: true, driversLicense: false }}
        onSelectionChange={() => {}}
        onSubmit={onSubmit}
        onBack={() => {}}
      />
    )
    await user.click(
      screen.getByRole('button', { name: /activate selected credentials/i })
    )
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('calls onBack when the back button is clicked', async () => {
    const user = userEvent.setup()
    const onBack = jest.fn()
    render(
      <ActivateCredentialsForm
        identityDocumentAvailable={true}
        driversLicenseAvailable={true}
        selection={baseSelection}
        onSelectionChange={() => {}}
        onSubmit={() => {}}
        onBack={onBack}
      />
    )
    await user.click(screen.getByRole('button', { name: /back/i }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('shows credentials as unavailable when available is false', () => {
    render(
      <ActivateCredentialsForm
        identityDocumentAvailable={false}
        driversLicenseAvailable={false}
        selection={baseSelection}
        onSelectionChange={() => {}}
        onSubmit={() => {}}
        onBack={() => {}}
      />
    )
    expect(screen.getAllByText('Unavailable')).toHaveLength(2)
  })
})
