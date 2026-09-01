using './main.bicep'

param env = 'dev'
param location = 'southafricanorth'
param baseName = 'flashid'

// App Service
param appServiceSkuName = 'B1'
param appServiceAlwaysOn = false

// SQL Server
param sqlAdminLogin = 'marcomagilebridge'
param sqlAdminPassword = readEnvironmentVariable('SQL_ADMIN_PASSWORD')
param sqlEntraAdminLogin = 'Marcom@agilebridge.co.za'
param sqlEntraAdminObjectId = '7b721699-3a0b-4234-8f4f-0297fb93793e'
param sqlDatabases = [
  {
    name: 'sqldb-flashid-dev'
    maxSizeBytes: 21474836480       // 20 GB
    autoPauseDelay: 60
    backupRedundancy: 'Local'
  }
  {
    name: 'sqldb-gov-registry'
    maxSizeBytes: 10737418240       // 10 GB
    autoPauseDelay: 30
    backupRedundancy: 'Local'
  }
]
