@description('Name for the App Service Plan')
param name string = 'asp-flashid'

@description('Azure region')
param location string = 'southafricanorth'

@description('SKU name (e.g. B1, B2, S1, P1v3)')
param skuName string = 'B1'

resource appServicePlan 'Microsoft.Web/serverfarms@2024-11-01' = {
  name: name
  location: location
  kind: 'linux'
  sku: {
    name: skuName
  }
  properties: {
    reserved: true
  }
}

output appServicePlanId string = appServicePlan.id
output appServicePlanName string = appServicePlan.name
