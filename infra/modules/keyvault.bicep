@description('Environment name: dev or prod')
param env string

@description('Base name for the Key Vault resource')
param baseName string = 'flashid'

@description('Azure region')
param location string = 'southafricanorth'

@description('Soft-delete retention in days')
param softDeleteRetentionInDays int = 90

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: 'kv-${baseName}-${env}'
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: tenant().tenantId
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: softDeleteRetentionInDays
    publicNetworkAccess: 'Enabled'
  }
}

// Secrets are NOT managed in Bicep — they have no values in IaC exports.
// Set secrets via `az keyvault secret set` or through the CI/CD pipeline.
// App Services reference them via Key Vault references in app settings:
//   @Microsoft.KeyVault(VaultName=kv-flashid-dev;SecretName=my-secret)

output keyVaultId string = keyVault.id
output keyVaultName string = keyVault.name
output keyVaultUri string = keyVault.properties.vaultUri
