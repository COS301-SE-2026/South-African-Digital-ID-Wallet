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

// Hosted as a GitHub Release asset because the APK is over GitHub's 100 MB repo file limit
export const ANDROID_APK_URL: string =
  'https://github.com/COS301-SE-2026/South-African-Digital-ID-Wallet/releases/download/v1.0.0-android/FlashID-v1.0.0-prod-2026-09-30.apk'

export const MOBILE_REGISTER_SCREEN = {
  src: MobileRegistration.src,
  aspectRatio: MobileRegistration.width / MobileRegistration.height,
  isMockup: false,
}
