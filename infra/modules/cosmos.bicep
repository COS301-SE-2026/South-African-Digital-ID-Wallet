@description('Environment name: dev or prod')
param env string

@description('Base name for the Cosmos DB account')
param baseName string = 'flashid-qr-cosmos'

@description('Azure region')
param location string = 'southafricanorth'

@description('Enable the free tier (only one per subscription)')
param enableFreeTier bool = false

@description('Provisioned throughput (RU/s) per container')
param containerThroughput int = 400

resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2024-11-15' = {
  name: '${baseName}-${env}'
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    enableFreeTier: enableFreeTier
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    backupPolicy: {
      type: 'Periodic'
      periodicModeProperties: {
        backupIntervalInMinutes: 240
        backupRetentionIntervalInHours: 8
        backupStorageRedundancy: 'Geo'
      }
    }
    enableAutomaticFailover: true
    minimalTlsVersion: 'Tls12'
    publicNetworkAccess: 'Enabled'
  }
}

// ─── Database: FlashIDDb ────────────────────────────────────────────────────
resource flashIdDb 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2024-11-15' = {
  parent: cosmosAccount
  name: 'FlashIDDb'
  properties: {
    resource: {
      id: 'FlashIDDb'
    }
  }
}

resource qrCodesContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-11-15' = {
  parent: flashIdDb
  name: 'QrCodes'
  properties: {
    resource: {
      id: 'QrCodes'
      partitionKey: {
        paths: ['/id']
        kind: 'Hash'
        version: 2
      }
      indexingPolicy: {
        indexingMode: 'consistent'
        automatic: true
        includedPaths: [{ path: '/*' }]
        excludedPaths: [{ path: '/"_etag"/?' }]
      }
    }
  }
}

resource qrCodesThroughput 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/throughputSettings@2024-11-15' = {
  parent: qrCodesContainer
  name: 'default'
  properties: {
    resource: {
      throughput: containerThroughput
    }
  }
}

// ─── Database: FlashIdQrDb ──────────────────────────────────────────────────
resource flashIdQrDb 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2024-11-15' = {
  parent: cosmosAccount
  name: 'FlashIdQrDb'
  properties: {
    resource: {
      id: 'FlashIdQrDb'
    }
  }
}

resource qrTokenClaimsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-11-15' = {
  parent: flashIdQrDb
  name: 'QrTokenClaims'
  properties: {
    resource: {
      id: 'QrTokenClaims'
      partitionKey: {
        paths: ['/id']
        kind: 'Hash'
      }
      defaultTtl: -1
      indexingPolicy: {
        indexingMode: 'consistent'
        automatic: true
        includedPaths: [{ path: '/*' }]
        excludedPaths: [{ path: '/"_etag"/?' }]
      }
    }
  }
}

resource qrTokenClaimsThroughput 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/throughputSettings@2024-11-15' = {
  parent: qrTokenClaimsContainer
  name: 'default'
  properties: {
    resource: {
      throughput: containerThroughput
    }
  }
}

output cosmosAccountId string = cosmosAccount.id
output cosmosAccountName string = cosmosAccount.name
output cosmosEndpoint string = cosmosAccount.properties.documentEndpoint
