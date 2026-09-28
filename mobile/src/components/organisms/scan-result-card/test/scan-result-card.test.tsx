import { render, screen } from '@testing-library/react-native'

import { ScanResultCard } from '../scan-result-card'

describe('<ScanResultCard/>', () => {
  it('Should render the credential type and verified badge', async () => {
    await render(
      <ScanResultCard
        credentialType="Identity Document"
        disclosedFields={{ Gender: 'F' }}
      />
    )
    expect(screen.getByText('Identity Document')).toBeTruthy()
    expect(screen.getByText('Verified')).toBeTruthy()
  })
  it('Should render text fields as rows', async () => {
    await render(
      <ScanResultCard
        credentialType="ID"
        disclosedFields={{ Gender: 'F', Surname: 'Mokoena' }}
      />
    )
    expect(screen.getByTestId('scan-field-Gender')).toBeTruthy()
    expect(screen.getByTestId('scan-field-Surname')).toBeTruthy()
  })
  it.each(['Photo', 'Photograph', 'Signature'])(
    'Should render the %s field as an image',
    async (label) => {
      await render(
        <ScanResultCard
          credentialType="ID"
          disclosedFields={{ [label]: 'data:image/png;base64,AAA' }}
        />
      )
      expect(screen.getByTestId(`scan-field-${label}`).props.source).toEqual({
        uri: 'data:image/png;base64,AAA',
      })
    }
  )
  it('Should fall back to a text row for an empty image value', async () => {
    await render(
      <ScanResultCard credentialType="ID" disclosedFields={{ Photo: '' }} />
    )
    expect(screen.getByTestId('scan-field-Photo')).toBeTruthy()
  })
  it('Should render nothing extra with no disclosed fields', async () => {
    await render(<ScanResultCard credentialType="ID" disclosedFields={{}} />)
    expect(screen.getByTestId('scan-result-card')).toBeTruthy()
  })
})
