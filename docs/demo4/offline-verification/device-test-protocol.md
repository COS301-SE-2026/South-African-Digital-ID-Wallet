# Offline Verification Device Test Protocol

| | |
|---|---|
| Status | Steps 1 to 5 run; steps 6 and 7 pending |
| Owner | Nathan Chisadza |
| Devices | Samsung Galaxy S23 (citizen), Samsung Galaxy S24 (verifier) |
| Build | Expo Go for SDK 56, dev API on Azure (South Africa North) |

Each step lists what to do, what should happen and what happened. The unit and integration tests cover the logic; this protocol covers what only real phones can show: cameras reading animated codes, aeroplane mode and real clocks.

## Setup

1. Install Expo Go **for SDK 56** from expo.dev/go. The Play Store version is SDK 57 and will not open the project. Turn off Play Store auto-update for Expo Go.
2. Create `mobile/.env` with `EXPO_PUBLIC_API_URL` set to the dev API. Without it the app calls the emulator-only `10.0.2.2`.
3. Run `pnpm start --clear` in `mobile` and open the app on both phones over the same Wi-Fi (not university Wi-Fi, which blocks device-to-device traffic; use `--tunnel` there).
4. Citizen phone: a citizen with an active driver's licence and a photo, and a fingerprint enrolled. Verifier phone: any other account.
5. For steps 5 to 7 the dev API must run the branch under test (manual run of the `api-flashid-dev` workflow).

## Steps

| Step | Do | Expect | Result |
|---|---|---|---|
| 1 | Both phones online. Citizen shares the licence; verifier scans the online code | Verified result screen | Pass, 2026-09-24 |
| 2 | Both phones online, then aeroplane mode on both. Citizen shows the offline code; verifier scans it | "Receiving offline code: n of N", then the result with the portrait and "Verified offline on this phone" | Pass, 2026-09-24 |
| 3 | Citizen online shows an online code; verifier in aeroplane mode scans it | "No connection. Ask the citizen to show their offline code." | Pass, 2026-09-24 |
| 4 | Citizen changes the shared fields while offline; verifier scans the new code | The result shows only the new selection | Pass, 2026-09-24 |
| 5 | Replay. Package bound to the citizen's phone ("Frame 1 of 28"). Film the offline code with a third phone, replay it at once, then again after 2 minutes | Live code verifies; immediate replay may verify (the D-023 window); replay after 2 minutes fails with "This code has expired. Ask the citizen to show it again." | Pass, 2026-09-25. 28 frames, about 4.2 s. Immediate replay verified, replay after 2 minutes rejected |
| 6 | Revocation. Verifier online downloads the list; citizen stays offline; an administrator revokes the licence; verifier refreshes online, then scans offline | Before revocation: no "Revocation status was not checked" line. After: "This credential has been revoked." | Pending |
| 7 | Audit sync. Scan offline, then reconnect the verifier | An `OfflineCredentialVerified` audit row with the phone's scan time and the receipt time | Pending |

## Findings from device testing

Device testing on 2026-09-24 found issues no unit test caught, all fixed before review:

- The share screen was registered as a hidden tab, so it kept old state and Back went to Home. It is now a screen in the wallet stack.
- A credential screen left open behind another prompted for the fingerprint when a different credential was unlocked. Only the visible screen prompts now.
- Offline reads of the cache were reused for minutes, so a newly downloaded package was not seen. Offline reads are now fresh each time.
- The scanner stayed on the result screen when Verify was pressed again.
- Switching codes left the new code partly scrolled off screen, where it could not be scanned.
