# Landing page assets

## Mobile screenshots

`web/src/components/pages/landing-page/landing-assets.ts` imports real JPEG screenshots from `web/src/assets/images/`:

- `CredentialList.jpeg`: wallet
- `verifid.jpeg`: identity verification
- `selectivedisc.jpeg`: controlled sharing
- `registerPageMobile.jpeg`: registration in the app-download section

All these screens use `isMockup: false`. The unused illustrative SVG mockups have been removed.

To replace a screenshot, update its import and the matching `MOBILE_SCREENS` or `MOBILE_REGISTER_SCREEN` entry. Keep `isMockup: false` for real screenshots. Images use `object-contain` so no screenshot is cropped; portrait screenshots around 1:2 fit the phone frames best. The registration frame uses the imported image's aspect ratio.

## Enable the APK download

Set `ANDROID_APK_URL` in `landing-assets.ts` to your trusted HTTPS release link, or put the APK in `web/public/downloads/flashid.apk` and use `/downloads/flashid.apk`.

Until this value is provided, the download button is disabled and labelled as coming soon. External hosts may ignore the browser's `download` attribute and control download behaviour themselves.

## Update the user manual

`flashid-user-manual.pdf` is copied from `docs/demo4/User Help Manual.pdf`. Replace this public copy when the source manual changes. The footer's download link uses `USER_MANUAL_URL` from `web/src/lib/landing-links.ts`.
