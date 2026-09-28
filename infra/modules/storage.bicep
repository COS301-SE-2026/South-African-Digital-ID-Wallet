@description('Environment name: dev or prod')
param env string

@description('Base name (no hyphens — storage accounts only allow alphanumeric)')
param baseName string = 'flashid'

@description('Azure region')
param location string = 'southafricanorth'

@description('Storage SKU')
param skuName string = 'Standard_RAGRS'

@description('Allow public blob access (dev may need this, prod should not)')
param allowBlobPublicAccess bool = false

@description('CORS allowed origin for blob access (e.g. the web app hostname)')
param corsAllowedOrigin string = ''

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: 'st${baseName}${env}'
  location: location
  sku: {
    name: skuName
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: allowBlobPublicAccess
    allowSharedKeyAccess: true
    allowCrossTenantReplication: false
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Allow'
    }
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    deleteRetentionPolicy: {
      enabled: true
      days: 7
    }
    containerDeleteRetentionPolicy: {
      enabled: true
      days: 7
    }
    cors: {
      corsRules: corsAllowedOrigin != '' ? [
        {
          allowedOrigins: [corsAllowedOrigin]
          allowedMethods: ['GET']
          maxAgeInSeconds: 3600
          exposedHeaders: ['*']
          allowedHeaders: ['*']
        }
      ] : []
    }
  }
}

resource citizenPhotosContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobService
  name: 'citizen-photos'
  properties: {
    publicAccess: 'None'
  }
}

resource imagesContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobService
  name: 'images'
  properties: {
    publicAccess: allowBlobPublicAccess ? 'Container' : 'None'
  }
}

output storageAccountId string = storageAccount.id
output storageAccountName string = storageAccount.name
output primaryBlobEndpoint string = storageAccount.properties.primaryEndpoints.blob
