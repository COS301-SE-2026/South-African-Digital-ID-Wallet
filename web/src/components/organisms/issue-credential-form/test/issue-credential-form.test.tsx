import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { CitizenCredentialStatus } from '@/types'

import { IssueCredentialForm } from '../issue-credential-form'
import type { IssueCredentialFormProps } from '../types'

const activatedCitizen: CitizenCredentialStatus = {
  activatedAt: '2026-03-11',
  dateOfBirth: '1994-05-22',
  email: 'thandi@example.com',
  existingCredentials: [],
  names: 'Thandi',
  phoneNumber: '+27612345678',
  saId: '9405225800083',
  status: 'Activated',
  surname: 'Mokoena',
}

const baseProps: IssueCredentialFormProps = {
  citizen: { ...activatedCitizen },
  consentGiven: false,
  errors: {},
  hasActiveLicense: false,
  isPending: false,
  issued: null,
  onIssue: () => {},
  setConsentGiven: () => {},
  setErrors: () => {},
}

const issueButton = () =>
  screen.getByRole('button', { name: /issue driver's licence/i })

describe('IssueCredentialForm', () => {
  it('prompts for a citizen when none is looked up', () => {
    render(<IssueCredentialForm {...baseProps} citizen={null} />)

    expect(
      screen.getByText(/look up a citizen to begin issuing a credential/i)
    ).toBeInTheDocument()
    expect(issueButton()).toBeDisabled()
  })

  it('blocks issuance when the citizen is not activated', () => {
    render(
      <IssueCredentialForm
        {...baseProps}
        citizen={{ ...activatedCitizen, status: 'Pending' }}
        consentGiven
      />
    )

    expect(screen.getByText(/must be activated/i)).toBeInTheDocument()
    expect(issueButton()).toBeDisabled()
  })

  it('blocks issuance when an active licence already exists', () => {
    render(<IssueCredentialForm {...baseProps} consentGiven hasActiveLicense />)

    expect(
      screen.getByText(/already has an active driver's licence/i)
    ).toBeInTheDocument()
    expect(issueButton()).toBeDisabled()
  })

  it('disables issuance until consent is captured', () => {
    render(<IssueCredentialForm {...baseProps} />)

    expect(issueButton()).toBeDisabled()
  })

  it('calls onIssue on the happy path', async () => {
    const onIssue = jest.fn()
    render(
      <IssueCredentialForm {...baseProps} consentGiven onIssue={onIssue} />
    )

    await userEvent.click(issueButton())

    expect(onIssue).toHaveBeenCalledTimes(1)
  })

  it('renders the issued licence details', () => {
    render(
      <IssueCredentialForm
        {...baseProps}
        consentGiven
        issued={{
          driversLicense: {
            expiryDate: '2031-08-22',
            licenseCode: 'EB',
            licenseNumber: 'DL-940522',
            restrictions: 'Corrective lenses',
          },
          id: 'cred-1',
          issueDate: '2026-08-22',
          issuedBy: 'Licensing Department',
          status: 'Active',
          title: "Driver's Licence",
          type: 'DriversLicense',
        }}
      />
    )

    expect(screen.getByText('DL-940522')).toBeInTheDocument()
    expect(screen.getByText('Licensing Department')).toBeInTheDocument()
  })
})
