const emergencyUrls = {
  accesses: (): string => '/api/emergency/accesses',
  devices: (): string => '/api/emergency/devices',
  offlineCredential: (): string => '/api/emergency/offline-credential',
  profile: (): string => '/api/emergency/profile',
  resolve: (): string => '/api/emergency/resolve',
}

export default emergencyUrls
