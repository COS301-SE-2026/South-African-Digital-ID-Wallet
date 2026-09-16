import { NativeModule, requireNativeModule } from 'expo'

declare class FlashidEmergencyModule extends NativeModule<{}> {}

export default requireNativeModule<FlashidEmergencyModule>('FlashidEmergency')
