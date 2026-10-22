# Landing page assets

The `mobile-*.svg` images are illustrative mockups, not actual app screenshots.

## Replace with real screenshots

1. Put your portrait screenshots in this folder, for example `wallet.png`, `credentials.png`, and `sharing.png`.
2. Open `web/src/components/pages/landing-page/landing-assets.ts`.
3. Set the matching `src` values to `/landing/wallet.png`, `/landing/credentials.png`, and `/landing/sharing.png`.
4. Set each replaced screen's `isMockup` to `false`. This removes the illustrative-preview label for that screen.

Images use `object-contain` so no screenshot is cropped. Portrait screenshots around 1:2 fit the phone frames best.

The app-download section uses `MOBILE_REGISTER_SCREEN` in the same configuration file. Replace its `src` with your real registration screenshot path and set its `isMockup` to `false`. The hero phones keep their own images as they animate between carousel positions.

## Enable the APK download

Set `ANDROID_APK_URL` in the same configuration file to your trusted HTTPS release link, or put the APK in `web/public/downloads/flashid.apk` and use `/downloads/flashid.apk`.

Until this value is provided, the download button is disabled and clearly labelled as coming soon. There is no placeholder download URL. External hosts may ignore the browser's `download` attribute and control download behaviour themselves.

## Update the user manual

`flashid-user-manual.pdf` is copied from `docs/demo4/User Help Manual.pdf`. Replace this public copy when the source manual changes. Both landing-page links use `USER_MANUAL_URL` from the configuration file.
