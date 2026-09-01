@description('Environment name: dev or prod')
param env string

@description('Azure region for all resources')
param location string = 'southafricanorth'

@description('Base name used across resources')
param baseName string = 'flashid'

@description('App Service Plan SKU (e.g. B1 for dev, S1 or P1v3 for prod)')
param appServiceSkuName string = 'B1'

@description('Enable always-on for App Services (recommended for prod)')
param appServiceAlwaysOn bool = false

@description('SQL Server admin login')
param sqlAdminLogin string

@secure()
@description('SQL Server admin password')
param sqlAdminPassword string

@description('Entra ID admin email for SQL Server')
param sqlEntraAdminLogin string

@description('Entra ID admin object ID for SQL Server')
param sqlEntraAdminObjectId string

@description('SQL databases to create (array of {name, maxSizeBytes, autoPauseDelay?, backupRedundancy?})')
param sqlDatabases array

// ─── Built-in Azure RBAC role definition IDs ───────────────────────────────
var keyVaultSecretsUserRole = '4633458b-17de-408a-b874-0445c86b69e6'
var storageBlobDataContributorRole = 'ba92f5b4-2d11-453d-a403-e96b0029c9fe'
var cognitiveServicesUserRole = 'a97b65f3-24c7-4388-baec-2e87135dc908'

// ─── Derived names (for Key Vault references in app settings) ──────────────
var keyVaultName = 'kv-${baseName}-${env}'

// ─── App Service Plan ───────────────────────────────────────────────────────
module appServicePlan 'modules/appserviceplan.bicep' = {
  name: 'appServicePlan'
  params: {
    name: 'asp-${baseName}'
    location: location
    skuName: appServiceSkuName
  }
}

// ─── Communication Services ─────────────────────────────────────────────────
module communicationService 'modules/communicationservices.bicep' = {
  name: 'communicationService-${env}'
  params: {
    env: env
    baseName: baseName
  }
}

// ─── Key Vault ──────────────────────────────────────────────────────────────
module keyVault 'modules/keyvault.bicep' = {
  name: 'keyVault-${env}'
  params: {
    env: env
    baseName: baseName
    location: location
  }
}

// ─── Cosmos DB ──────────────────────────────────────────────────────────────
module cosmos 'modules/cosmos.bicep' = {
  name: 'cosmos-${env}'
  params: {
    env: env
    location: location
    enableFreeTier: env == 'dev'
  }
}

// ─── Face API ───────────────────────────────────────────────────────────────
module faceApi 'modules/faceapi.bicep' = {
  name: 'faceApi-${env}'
  params: {
    env: env
    location: location
  }
}

// ─── SQL Server + Databases ─────────────────────────────────────────────────
module sql 'modules/sql.bicep' = {
  name: 'sql'
  params: {
    serverName: 'sql-${baseName}'
    location: location
    adminLogin: sqlAdminLogin
    adminPassword: sqlAdminPassword
    entraAdminLogin: sqlEntraAdminLogin
    entraAdminObjectId: sqlEntraAdminObjectId
    databases: sqlDatabases
  }
}

// ─── Storage Accounts ───────────────────────────────────────────────────────
module storage 'modules/storage.bicep' = {
  name: 'storage-${env}'
  params: {
    env: env
    baseName: baseName
    location: location
    allowBlobPublicAccess: env == 'dev'
    corsAllowedOrigin: 'https://${webFlashId.outputs.defaultHostName}'
  }
}

// ─── Derived names (for values that don't need module outputs) ─────────────
var storageAccountName = 'st${baseName}${env}'
var storageBlobEndpoint = 'https://${storageAccountName}.blob.core.windows.net/'

// ─── Shared app settings for API services ──────────────────────────────────
var sharedAppSettings = [
  // Non-secret values — resolved from module outputs or derived names
  { name: 'KeyVault__VaultUri', value: keyVault.outputs.keyVaultUri }
  { name: 'CosmosDb__Endpoint', value: cosmos.outputs.cosmosEndpoint }
  { name: 'CosmosDb__DatabaseName', value: 'FlashIDDb' }
  { name: 'Storage__BlobEndpoint', value: storageBlobEndpoint }
  { name: 'SqlServer__Fqdn', value: sql.outputs.sqlServerFqdn }
  // Secrets — read from Key Vault at runtime via managed identity
  { name: 'ConnectionStrings__DefaultConnection', value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=db-connection-string-flashid-${env})' }
  { name: 'FaceApi__Endpoint', value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=FaceApi--Endpoint)' }
  { name: 'FaceApi__Key', value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=FaceApi--Key1--${env})' }
  { name: 'Jwt__Key', value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=Jwt--Key)' }
  { name: 'SmsPortal__ApiKey', value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=SmsPortal--ApiKey)' }
  { name: 'SmsPortal__ApiSecret', value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=SmsPortal--ApiSecret)' }
]

var apiFlashIdSettings = concat(sharedAppSettings, [])

var apiGovRegistrySettings = concat(sharedAppSettings, [
  { name: 'GovernmentRegistry__ApiKey', value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=GovernmentRegistry--ApiKeyGov)' }
])

// ─── App Services ───────────────────────────────────────────────────────────

module apiFlashId 'modules/appservice.bicep' = {
  name: 'apiFlashId-${env}'
  params: {
    env: env
    namePrefix: 'api-${baseName}'
    appServicePlanId: appServicePlan.outputs.appServicePlanId
    location: location
    alwaysOn: appServiceAlwaysOn
    appSettings: apiFlashIdSettings
  }
}

module apiGovRegistry 'modules/appservice.bicep' = {
  name: 'apiGovRegistry-${env}'
  params: {
    env: env
    namePrefix: 'api-government-registry'
    appServicePlanId: appServicePlan.outputs.appServicePlanId
    location: location
    alwaysOn: appServiceAlwaysOn
    appSettings: apiGovRegistrySettings
  }
}

module webFlashId 'modules/appservice.bicep' = {
  name: 'webFlashId-${env}'
  params: {
    env: env
    namePrefix: 'web-${baseName}'
    appServicePlanId: appServicePlan.outputs.appServicePlanId
    location: location
    alwaysOn: appServiceAlwaysOn
    linuxFxVersion: 'DOCKER|acrflashid.azurecr.io/web-flashid:${env}-latest'
    appSettings: [
      { name: 'KeyVault__VaultUri', value: keyVault.outputs.keyVaultUri }
      { name: 'Storage__BlobEndpoint', value: storageBlobEndpoint }
    ]
  }
}

// ─── RBAC Role Assignments ──────────────────────────────────────────────────
// Grant each App Service's managed identity access to shared resources.
// Scoped to the resource group — covers Key Vault, Storage, and Cognitive Services within it.

// API FlashID
module apiFlashIdKvRole 'modules/roleassignment.bicep' = {
  name: 'apiFlashId-kv-role-${env}'
  params: {
    principalId: apiFlashId.outputs.principalId
    roleDefinitionId: keyVaultSecretsUserRole
  }
}

module apiFlashIdStorageRole 'modules/roleassignment.bicep' = {
  name: 'apiFlashId-storage-role-${env}'
  params: {
    principalId: apiFlashId.outputs.principalId
    roleDefinitionId: storageBlobDataContributorRole
  }
}

module apiFlashIdCognitiveRole 'modules/roleassignment.bicep' = {
  name: 'apiFlashId-cognitive-role-${env}'
  params: {
    principalId: apiFlashId.outputs.principalId
    roleDefinitionId: cognitiveServicesUserRole
  }
}

// API Government Registry
module apiGovRegistryKvRole 'modules/roleassignment.bicep' = {
  name: 'apiGovRegistry-kv-role-${env}'
  params: {
    principalId: apiGovRegistry.outputs.principalId
    roleDefinitionId: keyVaultSecretsUserRole
  }
}

module apiGovRegistryStorageRole 'modules/roleassignment.bicep' = {
  name: 'apiGovRegistry-storage-role-${env}'
  params: {
    principalId: apiGovRegistry.outputs.principalId
    roleDefinitionId: storageBlobDataContributorRole
  }
}

module apiGovRegistryCognitiveRole 'modules/roleassignment.bicep' = {
  name: 'apiGovRegistry-cognitive-role-${env}'
  params: {
    principalId: apiGovRegistry.outputs.principalId
    roleDefinitionId: cognitiveServicesUserRole
  }
}

// Web FlashID
module webFlashIdKvRole 'modules/roleassignment.bicep' = {
  name: 'webFlashId-kv-role-${env}'
  params: {
    principalId: webFlashId.outputs.principalId
    roleDefinitionId: keyVaultSecretsUserRole
  }
}

module webFlashIdStorageRole 'modules/roleassignment.bicep' = {
  name: 'webFlashId-storage-role-${env}'
  params: {
    principalId: webFlashId.outputs.principalId
    roleDefinitionId: storageBlobDataContributorRole
  }
}

// ─── Outputs ────────────────────────────────────────────────────────────────
output apiFlashIdHostName string = apiFlashId.outputs.defaultHostName
output apiGovRegistryHostName string = apiGovRegistry.outputs.defaultHostName
output webFlashIdHostName string = webFlashId.outputs.defaultHostName
output communicationServiceName string = communicationService.outputs.communicationServiceName
output keyVaultUri string = keyVault.outputs.keyVaultUri
output cosmosEndpoint string = cosmos.outputs.cosmosEndpoint
output sqlServerFqdn string = sql.outputs.sqlServerFqdn
output storageBlobEndpoint string = storage.outputs.primaryBlobEndpoint
