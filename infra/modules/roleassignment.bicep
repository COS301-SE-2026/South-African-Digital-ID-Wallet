@description('Principal ID of the managed identity to grant the role to')
param principalId string

@description('Built-in role definition ID (GUID only, e.g. "4633458b-17de-408a-b874-0445c86b69e6")')
param roleDefinitionId string

@description('Principal type')
param principalType string = 'ServicePrincipal'

resource roleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, principalId, roleDefinitionId)
  properties: {
    principalId: principalId
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', roleDefinitionId)
    principalType: principalType
  }
}
