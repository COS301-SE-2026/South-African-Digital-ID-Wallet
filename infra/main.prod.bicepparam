using './main.bicep'

param env = 'prod'
param location = 'southafricanorth'
param baseName = 'flashid'

// App Service
param appServiceSkuName = 'B1'
param appServiceAlwaysOn = false

// App URLs
param frontendBaseUrl = 'https://flashid.co.za'
param apiBaseUrl = 'https://api-flashid-prod-behwhegmcshsb6dg.southafricanorth-01.azurewebsites.net'
param govRegistryBaseUrl = 'https://api-government-registry-prod-ajavcaate3e5fecb.southafricanorth-01.azurewebsites.net'
param corsAdditionalOrigins = []

// SQL Server
param sqlAdminLogin = 'marcomagilebridge'
param sqlAdminPassword = readEnvironmentVariable('SQL_ADMIN_PASSWORD')
param sqlEntraAdminLogin = 'Marcom@agilebridge.co.za'
param sqlEntraAdminObjectId = '7b721699-3a0b-4234-8f4f-0297fb93793e'
param sqlDatabases = [
  {
    name: 'sqldb-flashid-prod'
    maxSizeBytes: 34359738368       // 32 GB
    autoPauseDelay: 60
    backupRedundancy: 'Geo'
  }
  {
    name: 'sqldb-gov-registry'
    maxSizeBytes: 10737418240       // 10 GB
    autoPauseDelay: 30
    backupRedundancy: 'Local'
  }
]
