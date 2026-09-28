@description('Environment name: dev or prod')
param env string

@description('Base name for the Face API resource')
param baseName string = 'digitalwallet'

@description('Azure region')
param location string = 'southafricanorth'

@description('SKU name (S0 is the only paid tier for Face API)')
param skuName string = 'S0'

resource faceApi 'Microsoft.CognitiveServices/accounts@2024-10-01' = {
  name: 'face-${baseName}-${env}'
  location: location
  sku: {
    name: skuName
  }
  kind: 'Face'
  properties: {
    customSubDomainName: 'face-${baseName}-${env}'
    publicNetworkAccess: 'Enabled'
  }
}

output faceApiId string = faceApi.id
output faceApiName string = faceApi.name
output faceApiEndpoint string = faceApi.properties.endpoint
