import MobileRegistration from '@/assets/images/registerPageMobile.jpeg'
import CredentialList from '@/assets/images/CredentialList.jpeg'
import VerifyId from '@/assets/images/verifid.jpeg'
import SelectiveDisclosure from '@/assets/images/selectivedisc.jpeg'

export const MOBILE_SCREENS = [
  { label: 'Your wallet', src: CredentialList.src, isMockup: false },
  { label: 'Identity verification', src: VerifyId.src, isMockup: false },
  {
    label: 'Controlled sharing',
    src: SelectiveDisclosure.src,
    isMockup: false,
  },
]

export const ANDROID_APK_URL: string = ''
export const USER_MANUAL_URL = '/landing/flashid-user-manual.pdf'
export const MOBILE_REGISTER_SCREEN = {
  src: MobileRegistration.src,
  aspectRatio: MobileRegistration.width / MobileRegistration.height,
  isMockup: false,
}
