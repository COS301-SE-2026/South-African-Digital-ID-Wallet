import { registerWebModule, NativeModule } from 'expo'

class FlashidEmergencyModule extends NativeModule<{}> {}

export default registerWebModule(
  FlashidEmergencyModule,
  'FlashidEmergencyModule'
)
