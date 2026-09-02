@description('Environment name: dev or prod')
param env string

@description('Name prefix for the App Service (e.g. "api-flashid", "web-flashid")')
param namePrefix string

@description('Resource ID of the App Service Plan to host this app')
param appServicePlanId string

@description('Azure region')
param location string = 'southafricanorth'

@description('Linux runtime stack')
param linuxFxVersion string = 'DOTNETCORE|10.0'

@description('Enable always-on (recommended for prod, costs more on lower SKUs)')
param alwaysOn bool = false

@description('App settings (key-value pairs) — use Key Vault references for secrets')
param appSettings array = []

@description('Health check path (empty = disabled)')
param healthCheckPath string = ''

resource appService 'Microsoft.Web/sites@2024-11-01' = {
  name: '${namePrefix}-${env}'
  location: location
  kind: 'app,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    enabled: true
    serverFarmId: appServicePlanId
    reserved: true
    httpsOnly: true
    clientAffinityEnabled: false
    keyVaultReferenceIdentity: 'SystemAssigned'
    publicNetworkAccess: 'Enabled'
    siteConfig: {
      linuxFxVersion: linuxFxVersion
      alwaysOn: alwaysOn
      http20Enabled: true
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      healthCheckPath: empty(healthCheckPath) ? null : healthCheckPath
      appSettings: appSettings
    }
  }
}

resource ftpPolicy 'Microsoft.Web/sites/basicPublishingCredentialsPolicies@2024-11-01' = {
  parent: appService
  name: 'ftp'
  properties: {
    allow: false
  }
}

resource scmPolicy 'Microsoft.Web/sites/basicPublishingCredentialsPolicies@2024-11-01' = {
  parent: appService
  name: 'scm'
  properties: {
    allow: true
  }
}

output appServiceId string = appService.id
output appServiceName string = appService.name
output defaultHostName string = appService.properties.defaultHostName
output principalId string = appService.identity.principalId
