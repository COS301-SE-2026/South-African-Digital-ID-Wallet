@description('Name for the SQL Server (shared across environments)')
param serverName string = 'sql-flashid'

@description('Azure region')
param location string = 'southafricanorth'

@description('SQL admin login username')
param adminLogin string

@secure()
@description('SQL admin login password')
param adminPassword string

@description('Entra ID admin email')
param entraAdminLogin string

@description('Entra ID admin object ID')
param entraAdminObjectId string

@description('Array of databases to create on this server')
param databases array

// SQL Server
resource sqlServer 'Microsoft.Sql/servers@2023-08-01-preview' = {
  name: serverName
  location: location
  properties: {
    administratorLogin: adminLogin
    administratorLoginPassword: adminPassword
    version: '12.0'
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
    administrators: {
      administratorType: 'ActiveDirectory'
      principalType: 'User'
      login: entraAdminLogin
      sid: entraAdminObjectId
      tenantId: tenant().tenantId
      azureADOnlyAuthentication: false
    }
  }
}

resource allowAzureServices 'Microsoft.Sql/servers/firewallRules@2023-08-01-preview' = {
  parent: sqlServer
  name: 'AllowAllWindowsAzureIps'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Databases 
resource sqlDatabases 'Microsoft.Sql/servers/databases@2023-08-01-preview' = [
  for db in databases: {
    parent: sqlServer
    name: db.name
    location: location
    sku: {
      name: db.?skuName ?? 'GP_S_Gen5'
      tier: db.?skuTier ?? 'GeneralPurpose'
      family: 'Gen5'
      capacity: db.?capacity ?? 1
    }
    properties: {
      collation: 'SQL_Latin1_General_CP1_CI_AS'
      maxSizeBytes: db.maxSizeBytes
      autoPauseDelay: db.?autoPauseDelay ?? 60
      minCapacity: json('0.5')
      zoneRedundant: false
      readScale: 'Disabled'
      requestedBackupStorageRedundancy: db.?backupRedundancy ?? 'Local'
    }
  }
]

output sqlServerId string = sqlServer.id
output sqlServerName string = sqlServer.name
output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName
