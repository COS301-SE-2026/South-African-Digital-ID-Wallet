import { render, screen } from '@testing-library/react-native'

import { CredentialFieldRow } from '../credential-field-row'

describe('<CredentialFieldRow/>', () => {
  it('Should render the label and value', async () => {
    await render(<CredentialFieldRow label="Gender" testID="row" value="F" />)
    expect(screen.getByTestId('row')).toBeTruthy()
    expect(screen.getByText(/Gender/)).toBeTruthy()
    expect(screen.getByText(/F/)).toBeTruthy()
  })
})
