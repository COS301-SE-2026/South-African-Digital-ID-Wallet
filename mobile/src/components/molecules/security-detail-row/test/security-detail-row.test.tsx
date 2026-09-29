import { render, screen } from '@testing-library/react-native'
import { Laptop } from 'lucide-react-native'

import { SecurityDetailRow } from '@/components/molecules/security-detail-row'

describe('<SecurityDetailRow/>', () => {
  it('Should show the label and value', async () => {
    await render(
      <SecurityDetailRow
        Icon={Laptop}
        label="Device"
        value="Chrome on Windows"
      />
    )
    expect(screen.getByText('Device')).toBeTruthy()
    expect(screen.getByText('Chrome on Windows')).toBeTruthy()
  })

  it('Should show the hint and badge when given', async () => {
    await render(
      <SecurityDetailRow
        badge={{ label: 'New device', tone: 'danger' }}
        hint="First time we have seen this device"
        Icon={Laptop}
        label="Device"
        value="Chrome on Windows"
      />
    )
    expect(screen.getByText('First time we have seen this device')).toBeTruthy()
    expect(screen.getByText('New device')).toBeTruthy()
  })

  it('Should leave the hint and badge out when not given', async () => {
    await render(
      <SecurityDetailRow
        Icon={Laptop}
        label="Device"
        value="Chrome on Windows"
      />
    )
    expect(screen.queryByText('New device')).toBeNull()
    expect(screen.queryByText('First time we have seen this device')).toBeNull()
  })
})
