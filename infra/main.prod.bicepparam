using './main.bicep'

param env = 'prod'
param location = 'southafricanorth'
param baseName = 'flashid'

// App Service — consider upgrading SKU for prod (S1 or P1v3)
param appServiceSkuName = 'B1'
param appServiceAlwaysOn = false

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
]
