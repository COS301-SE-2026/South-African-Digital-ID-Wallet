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

@description('SQL databases to create')
param sqlDatabases array

// App URLs (breaks circular dependency: hostnames contain random hashes)
@description('Frontend base URL (e.g. https://flashid.co.za for prod, Azure hostname for dev)')
param frontendBaseUrl string

@description('FlashID API base URL')
param apiBaseUrl string

@description('Government Registry API base URL')
param govRegistryBaseUrl string

@description('Additional CORS origins (e.g. http://localhost:3000 for dev)')
param corsAdditionalOrigins array = []

// Built-in Azure RBAC role definition IDs 
var keyVaultSecretsUserRole = '4633458b-17de-408a-b874-0445c86b69e6'
var storageBlobDataContributorRole = 'ba92f5b4-2d11-453d-a403-e96b0029c9fe'
var cognitiveServicesUserRole = 'a97b65f3-24c7-4388-baec-2e87135dc908'

// Derived names 
var keyVaultName = 'kv-${baseName}-${env}'
var kv = '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName='
var acrLoginServer = 'acrflashid.azurecr.io'

// App Service Plan 
module appServicePlan 'modules/appserviceplan.bicep' = {
  name: 'appServicePlan'
  params: {
    name: 'asp-${baseName}'
    location: location
    skuName: appServiceSkuName
  }
}

// Communication Services
module communicationService 'modules/communicationservices.bicep' = {
  name: 'communicationService-${env}'
  params: {
    env: env
    baseName: baseName
  }
}

// Key Vault 
module keyVault 'modules/keyvault.bicep' = {
  name: 'keyVault-${env}'
  params: {
    env: env
    baseName: baseName
    location: location
  }
}

// Cosmos DB 
module cosmos 'modules/cosmos.bicep' = {
  name: 'cosmos-${env}'
  params: {
    env: env
    location: location
    enableFreeTier: env == 'dev'
  }
}

// Face API 
module faceApi 'modules/faceapi.bicep' = {
  name: 'faceApi-${env}'
  params: {
    env: env
    location: location
  }
}

// SQL Server + Databases 
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

// Storage Accounts 
module storage 'modules/storage.bicep' = {
  name: 'storage-${env}'
  params: {
    env: env
    baseName: baseName
    location: location
    allowBlobPublicAccess: env == 'dev'
    corsAllowedOrigin: frontendBaseUrl
  }
}

// App Settings 
// Non-secret values are inline. Secrets use Key Vault references.
// Bicep's siteConfig.appSettings is a FULL REPLACE. Every setting must be here.

var corsOrigins = concat([frontendBaseUrl], corsAdditionalOrigins)
var corsSettings = [for (origin, i) in corsOrigins: { name: 'Cors__AllowedOrigins__${i}', value: origin }]

var apiFlashIdSettings = concat(
  [
    // Runtime
    { name: 'ASPNETCORE_ENVIRONMENT', value: env == 'prod' ? 'Production' : 'Development' }
    // URLs
    { name: 'Activation__FrontendBaseUrl', value: frontendBaseUrl }
    { name: 'GovernmentRegistry__BaseUrl', value: govRegistryBaseUrl }
    { name: 'SmsPortal__BaseUrl', value: 'https://rest.smsportal.com' }
    // Storage
    { name: 'BlobStorage__ContainerName', value: 'citizen-photos' }
    // JWT (non-secret)
    { name: 'Jwt__Audience', value: 'FlashID-Users' }
    { name: 'Jwt__Issuer', value: 'FlashID' }
    // Email (non-secret)
    { name: 'Email__FromAddress', value: 't3chtitansgo@gmail.com' }
    // Secrets — resolved from Key Vault at runtime
    { name: 'ConnectionStrings__DefaultConnection', value: '${kv}ConnectionStrings--DefaultConnection-Flashid)' }
    { name: 'BlobStorage__ConnectionString', value: '${kv}BlobStorage--ConnectionString)' }
    { name: 'Cosmos__ConnectionString', value: '${kv}Cosmos--ConnectionString)' }
    { name: 'Cosmos__CredentialIdHmacKey', value: '${kv}Cosmos--CredentialIdHmacKey)' }
    { name: 'Email__AppPassword', value: '${kv}Email--AppPassword)' }
    { name: 'GovernmentRegistry__ApiKeyGov', value: '${kv}GovernmentRegistry--ApiKeyGov)' }
    { name: 'Jwt__Key', value: '${kv}Jwt--Key)' }
    { name: 'Qr__Ed25519PrivateKey', value: '${kv}Qr--Ed25519PrivateKey)' }
    { name: 'SmsPortal__ApiKey', value: '${kv}SmsPortal--ApiKey)' }
    { name: 'SmsPortal__ApiSecret', value: '${kv}SmsPortal--ApiSecret)' }
  ],
  corsSettings
)

var apiGovRegistrySettings = [
  { name: 'ASPNETCORE_ENVIRONMENT', value: env == 'prod' ? 'Production' : 'Development' }
  { name: 'Logging__LogLevel__Default', value: 'Information' }
  { name: 'Logging__LogLevel__Microsoft.AspNetCore', value: 'Warning' }
  // Secrets
  { name: 'ConnectionStrings__DefaultConnection', value: '${kv}ConnectionStrings--DefaultConnection-GovRegistry)' }
  { name: 'Security__ApiKeyGov', value: '${kv}Security--ApiKeyGov)' }
]

var webFlashIdSettings = [
  // Docker / container config
  { name: 'DOCKER_REGISTRY_SERVER_URL', value: 'https://${acrLoginServer}' }
  { name: 'DOCKER_REGISTRY_SERVER_USERNAME', value: 'acrflashid' }
  { name: 'DOCKER_REGISTRY_SERVER_PASSWORD', value: '${kv}DOCKER-REGISTRY-SERVER-PASSWORD)' }
  { name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE', value: 'false' }
  // App config
  { name: 'API_INTERNAL_URL', value: apiBaseUrl }
  // Secret
  { name: 'JWT_SECRET', value: '${kv}JWT-SECRET)' }
]

// App Services 

module apiFlashId 'modules/appservice.bicep' = {
  name: 'apiFlashId-${env}'
  params: {
    env: env
    namePrefix: 'api-${baseName}'
    appServicePlanId: appServicePlan.outputs.appServicePlanId
    location: location
    alwaysOn: appServiceAlwaysOn
    linuxFxVersion: 'DOTNETCORE|10.0'
    healthCheckPath: '/health'
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
    linuxFxVersion: 'DOTNETCORE|10.0'
    healthCheckPath: '/health'
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
    linuxFxVersion: 'DOCKER|${acrLoginServer}/web-flashid:${env}-latest'
    healthCheckPath: '/api/health'
    appSettings: webFlashIdSettings
  }
}

// RBAC Role Assignments 

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
