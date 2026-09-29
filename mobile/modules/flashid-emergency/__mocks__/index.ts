import type { FlashidEmergencyModule } from '../index'

const mock: FlashidEmergencyModule = {
  disableEmergency: async () => {},
  generateEmergencyKey: async () => ({
    isStrongBoxBacked: true,
    publicKeySpki: 'TU9DSw',
  }),
  isConfigured: async () => true,
  requestAddTile: async () => true,
  setEmergencyHandle: async () => {},
  setOfflineBundle: async () => {},
}

export default mock
