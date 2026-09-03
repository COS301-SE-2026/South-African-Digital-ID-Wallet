import { SupportItem } from './types'

export const HELP_FAQS: SupportItem[] = [
  {
    title: 'How do I share my identity?',
    body: 'Open your wallet, tap a credential, then tap Share Identity. Choose what you want to reveal and a QR code is generated for one minute.',
  },
  {
    title: 'What is selective disclosure?',
    body: 'It lets you share only the fields a verifier needs, such as your date of birth, instead of your whole credential.',
  },
  {
    title: 'How do I verify someone else?',
    body: 'Tap the centre Verify button, point your camera at their QR code, and the disclosed fields appear once the code checks out.',
  },
  {
    title: 'Is my information safe?',
    body: 'Every credential is digitally signed by the issuing authority, QR codes expire after a minute, and screenshots are blocked on sensitive screens.',
  },
  {
    title: 'What if I lose my device?',
    body: 'Open Linked Devices and unlink it. That device then has to be verified again before it can sign in.',
  },
]

export const ABOUT_FLASHID: SupportItem[] = [
  {
    body: 'FlashID is a South African digital identity wallet. It holds government-issued credentials on your phone and lets you prove who you are without handing over a physical document.',
  },
  {
    body: 'Credentials are issued and signed by the authority that owns them. FlashID never changes what is inside a credential, it only stores it and helps you share it.',
  },
  {
    body: 'Built by Tech Titans for COS 301 at the University of Pretoria.',
  },
]
