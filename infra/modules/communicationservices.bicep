@description('Environment name: dev or prod')
param env string

@description('Base name for the Communication Service resource')
param baseName string = 'flashid'

@description('Data residency location for Communication Services')
param dataLocation string = 'africa'

resource communicationService 'Microsoft.Communication/CommunicationServices@2023-04-01' = {
  name: 'acs-${baseName}-${env}'
  location: 'global'
  properties: {
    dataLocation: dataLocation
  }
}

output communicationServiceId string = communicationService.id
output communicationServiceName string = communicationService.name
