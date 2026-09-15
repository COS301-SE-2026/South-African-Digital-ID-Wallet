# Offline Verification Decision Log

Each entry records what was decided, what else was considered, and why. Status is **Accepted**, **Proposed** (needs evidence or team agreement) or **Superseded**. An accepted decision is never edited; it is superseded by a new entry.

The byte-level rules are in [wire-format.md](wire-format.md).

---

### D-001 One scan per verification

**Status:** Accepted, 2026-09-11

**Context.** Officials scan citizens and citizens scan citizens. Citizens scanning officials is ruled out.

**Decision.** A verification is exactly one scan: the verifier scans the holder.

**Alternatives.** A two-QR handshake in which the holder also scans the verifier, which would allow encrypting to the verifier. Rejected because it requires citizens to scan officials.

**Consequences.** Without a radio link, the offline payload cannot be encrypted in transit, so R2.4.4 must be amended with compensating controls.

---

### D-002 Animated QR with holder binding is the baseline; BLE is a stretch goal

**Status:** Accepted, 2026-09-11

**Context.** ISO/IEC 18013-5 uses BLE for offline transfer, and the lecturer favours it.

**Decision.** Single-scan animated QR with holder binding on every phone. BLE only after the baseline is complete, Android to Android.

**Alternatives.** BLE as the baseline. Rejected: any phone can be a verifier, so every phone would need the BLE peripheral role, which needs Swift and Kotlin native modules that cannot be delivered on iOS in time.

**Consequences.** Works on every phone. BLE can be added later without touching the cryptography.

---

### D-003 SD-JWT with JWS instead of ISO mdoc with CBOR and COSE

**Status:** Accepted, 2026-09-13

**Context.** Both are standards. ISO/IEC 18013-5 mdoc uses CBOR and COSE; IETF SD-JWT uses JSON and JWS.

**Decision.** SD-JWT with JWS compact serialisation.

**Alternatives.** mdoc with COSE_Sign1. Rejected because:

1. Without an ISO transport (NFC, BLE or Wi-Fi Aware), device engagement and a session transcript, the result would be ISO-shaped but not ISO-conformant.
2. COSE signs re-encoded CBOR, so .NET and JavaScript must produce identical bytes. JWS signs the exact text that travels.
3. No maintained COSE library runs in React Native without Node's `crypto` module.

**Consequences.** About 20 to 25 percent larger than CBOR, roughly two more QR frames. The format is isolated in the backend builder and the JavaScript verifier, so it could be changed later.

---

### D-004 ES256 with raw 64-byte signatures; local key before Key Vault

**Status:** Accepted, 2026-09-13

**Context.** Azure Key Vault cannot hold Ed25519 keys, and the rolling-keys work moves signing to ES256.

**Decision.** ES256 with IEEE P1363 raw signatures. A local ES256 provider is built first; the Key Vault provider replaces it through the same interface.

**Alternatives.** Waiting for Key Vault, which blocks this work. Staying on Ed25519, which rules out Key Vault key custody and has weaker browser support.

**Consequences.** Development and CI need no Azure access. The interface shape must be agreed with the rolling-keys owner (Q-3).

---

### D-005 Holder binding with a Key Binding JWT

**Status:** Accepted, 2026-09-13

**Context.** Without binding, a leaked copy of stored packages or a copied wallet could be presented from any phone, and a filmed QR could be replayed.

**Decision.** Each wallet generates a P-256 device key whose public key is embedded as `cnf` at minting. Every presentation carries a Key Binding JWT with `iat` and `sd_hash`, re-signed every 5 seconds and accepted for 30 seconds.

**Alternatives.** No binding. A hardware-backed key in the Secure Enclave or StrongBox, which needs a native module.

**Consequences.** A new phone receives a freshly minted package. A software key in SecureStore is a stated limitation. The Key Binding JWT has no verifier `nonce` or `aud` (wire-format section 11).

---

### D-006 Online presentation stays the default

**Status:** Accepted, 2026-09-11

**Decision.** The wallet shows the existing online QR whenever it has signal. The citizen chooses "Show offline code", after a warning, when the verifier is offline. Verifiers prefer online resolution when they have signal, and offline results are flagged in the audit log.

**Consequences.** Showing readable fields is an informed citizen choice. Forcing offline mode to dodge the one-time-use check becomes visible in the audit log.

---

### D-007 Offline packages last 30 days and are minted on request

**Status:** Accepted, 2026-09-13

**Decision.** A package is minted on the first request and minted again when it has expired, is older than 7 days, the device key has changed, the credential was updated, or its signing key was
revoked. Its `exp` is the earlier of the document's expiry and 30 days.

**Alternatives.** Minting at issuance, which touches three services and needs a backfill. Long-lived packages, which force keeping retired keys for years and leave revocation stale.

**Consequences.** Retired key retention is bounded at 45 days. After a key revocation, wallets receive fresh packages automatically on their next connection.

---

### D-008 Retiring and revoking keys are different operations

**Status:** Accepted, 2026-09-13

**Context.** The question was raised whether keeping old keys defeats key rotation.

**Decision.** A retired key's private key is disabled and never signs again, but its public key stays published for 45 days so existing packages still verify. A revoked key's signatures stop verifying. Credential signing uses its own key (`Purpose = Credential`), separate from the QR token key.

**Consequences.** Rotation still limits how much any one key signs and for how long. Keeping public keys exposes nothing. Separate keys per purpose mean a token signed for one purpose cannot pass as
another.

---

### D-009 The prototype trust anchor is the issuer key set over TLS

**Status:** Accepted, 2026-09-13

**Decision.** Verifiers fetch and cache the issuer key set from the backend over TLS. Offline verification warns when trust data is over 24 hours old and refuses when it is over 7 days old.

**Alternatives.** An IACA root key that signs the key set, as ISO/IEC 18013-5 does. This is the production design, deferred for time.

**Consequences.** Stated limitation: whoever controls the backend or its TLS certificate at fetch time controls which keys are trusted.

---

### D-010 Stable claim names

**Status:** Proposed, 2026-09-13

**Context.** `QrFieldDefinitions.cs` uses display labels such as "Full surname".

**Decision.** Use snake_case claim names mapped from the labels (wire-format section 5).

**Alternatives.** Using the labels as claim names. Rejected: rewording the interface would break verification of packages already on phones.

---

### D-011 Signature image excluded from offline presentations

**Status:** Proposed, 2026-09-13

**Context.** The handwritten signature is an image of several kilobytes and is not a mandatory field.

**Decision.** Leave it out of offline packages; it remains available online.

**Alternatives.** Including it, which would roughly double the number of QR frames.

---

### D-012 The revocation index is the only credential identifier

**Status:** Proposed, 2026-09-13

**Context.** The online QR carries the database credential id. A stable identifier in every presentation lets verifiers link a citizen's presentations together.

**Decision.** Offline presentations carry only the revocation index. The backend maps it back to the credential when audit entries sync.

**Consequences.** Presentations are still linkable through the revocation index and the portrait, a stated limitation. Internal database ids are not exposed.

---

### D-013 No rename of `Credential.Signature` during the sprint

**Status:** Accepted, 2026-09-13

**Decision.** Add `IssuerSignedCredential` as a new column. Rename `Signature` to `SignatureImagePath` after 27 September.

**Alternatives.** Renaming now. Rejected: a repository-wide rename during a team sprint causes merge conflicts.

---

### D-014 Verifiers accept high-S signatures

**Status:** Accepted, 2026-09-14

**Context.** `@noble/curves` version 2 rejects high-S ECDSA signatures by default. .NET and Azure Key Vault do not normalise S.

**Decision.** Verify with `{ lowS: false }`. Never use signature bytes as an identifier.

**Alternatives.** Normalising S on the backend after every signing operation, including Key Vault output.

**Evidence.** Spike A, 2026-09-14: two batches of 50 fixtures, each fixture signed by a fresh .NET key. With noble defaults, 21 of 50 and 24 of 50 verified, so 29 and 26 signatures were high-S. With `lowS: false`, 50 of 50 verified in both batches. Forcing `lowS: true` reproduced the 21 of 50 failure with a non-zero exit code.

---

### D-015 Develop in Expo Go or a debug build; measure on release builds

**Status:** Accepted, 2026-09-13

**Decision.** Everything this feature needs is JavaScript or an Expo module, so it runs both in Expo Go and in the `pnpm android` debug build that the team runbook uses. Both run the same
JavaScript from the same Metro server and can sit side by side on one device, so teammates are not split. Scan timing and the demo use a release build, because development-mode JavaScript is much slower in both.

**Consequences.** The choice stays reversible until native code lands. The Emergency QR lock screen tile or the BLE stretch goal each end Expo Go for the shared app, and the whole team then moves to a development build together.

---

### D-016 Credentials are signed on the first offline package request, not at issuance

**Status:** Accepted, 2026-09-14

**Context.** R2.1.3 and R9.1.1 require every credential to be signed with Ed25519 at the point of issuance, and R9.3.2 requires the previous signed version to be archived after an update. Holder
binding (D-005) embeds the phone's public key in the signed credential, and that key does not exist at issuance: the wallet creates it and sends it with its first offline package request.

**Decision.** Sign on the first offline package request, and sign again after every update, expiry, device key change or signing key revocation (D-007). Amend R2.1.3, R9.1.1 and R9.3.2 to:
"Every credential shall be signed with ES256 before it can be presented offline. The signature covers all credential fields through salted digests and binds the credential to the holder's
device key. The credential shall be re-signed after every update."

**Alternatives.** Also signing an unbound copy at issuance. Rejected: verifiers require key binding (wire-format section 10, step 9), so an unbound credential could never be presented and
the signature would be for show.

**Consequences.** Requirements R2.1.3, R9.1.1 and R9.3.2 are amended (checklist 6.1). Credentials never used offline are never signed. Signed packages are not archived, because each is disposable and can be minted again from the archived credential version (R2.5.4).

---

### D-017 ImageSharp 3.1.12 for portrait processing

**Status:** Accepted, 2026-09-14

**Context.** The backend must downscale and re-encode portraits for offline packages (Spike C). The candidates were ImageSharp and SkiaSharp (Q-4). ImageSharp 4.x adds a build-time licence check: without a Six Labors licence key, Release builds fail, and the backend deploys with
`dotnet publish`, which builds Release.

**Decision.** Use SixLabors.ImageSharp 3.1.12. It is pure .NET, supports every operation the portrait recipe needs, has no build-time licence check and no known vulnerabilities. It is used under the Six Labors Split License clause granting Apache 2.0 to "a For-profit company/individual with less than 1M USD annual gross revenue"; FlashID is a student project with no revenue.

**Alternatives.** ImageSharp 4.1.2, rejected because Release builds need a licence key and community licences are application-based. SkiaSharp 4.152.0 under the MIT licence, kept as the fallback; it needs the native `SkiaSharp.NativeAssets.Linux.NoDependencies` package on Linux App
Service and different code.

**Consequences.** Q-4 is closed. Do not upgrade to ImageSharp 4.x without a licence key. Watch for security updates on the 3.1 line: 3.1.10 had a known vulnerability, fixed in 3.1.11.

---

### D-018 Portrait: 160 x 160 colour WebP, sent inline

**Status:** Accepted, 2026-09-15

**Context.** R3.4.2 makes the photograph mandatory, so every offline presentation carries a portrait, and it is most of the payload. Spike C (2026-09-14) rendered 10 photos (5 people, each normal and artificially darkened) across four rounds on ImageSharp 3.1.12, measuring bytes, QR
frames and recognisability.

**Decision.** AutoOrient, centre crop to 160 x 160, bicubic resize, colour, WebP lossy quality 40, metadata stripped. The portrait travels inline as a standard SD-JWT disclosure whose value is the base64url of the WebP.

**Alternatives.**

- 64 and 96 px: facial features blur together. 128 px: acceptable but visibly softer.
- JPEG: blocky at the same size; WebP looked cleaner.
- Greyscale: with WebP only 0 to 1 frame smaller, and it loses skin tone, hair and eye colour.
- Portrait (3:4), tight and natural-proportion crops: no clearer, and tall photos get a small face.
- Lanczos3 with sharpening: crisper but not clearer, and about 15 percent larger. Adaptive contrast: blotchy and 2 to 3 times larger.
- Detached portrait (a hash in the disclosure, the image as a separate segment): saves 1 to 5 frames, at most about a second at 8 fps (D-019), but adds a custom structure and another deviation from SD-JWT.

**Evidence.** Recipe C2: 772 to 4,814 bytes; inline 7 to 14 frames for nine photos and 23 for the worst (a 518 px source with a busy background). React Native `Image` displayed a WebP data URI on Samsung Android 16 (Spike B).

**Consequences.** Every portrait scans within about 4 seconds at 8 fps. Data URIs need standard base64, converted from base64url. Official ID photos with plain backgrounds should compress smaller than the test photos. The 23-frame worst case was predicted, not measured (checklist 3.7).

---

### D-019 QR frames carry 450 characters at 8 frames per second

**Status:** Accepted, 2026-09-15

**Context.** Wire-format section 9 splits a presentation into QR frames. The chunk size and frame rate were estimates: 450 characters at 5 fps.

**Decision.** 450 characters per payload frame, displayed at 8 frames per second, with one key binding frame after every third payload frame.

**Alternatives.** 700 characters per frame: fewer frames but denser codes, unreliable in dim light. 5 fps: reliable but slower.

**Evidence.** Spike B, 2026-09-15, release build; display phone Samsung Galaxy S23, scanner Samsung Galaxy S24, both Android 16. Scan time was about one display cycle: payload frames plus key binding frames, divided by fps. The camera decoded about 27 QR codes per second, about 3 reads per frame at 8 fps.

| Preset | Light | fps | Seconds, 3 runs |
|---|---|---|---|
| 8 x 450 | normal | 5 | 1.9, 2.0, 2.2 |
| 12 x 450 | normal | 5 | 3.1, 2.9, 3.0 |
| 18 x 450 | normal | 5 | 4.8, 4.7, 4.7 |
| 6 x 700 | normal | 5 | 1.4, 1.3, 1.4 |
| 8 x 700 | normal | 5 | 2.0, 1.8, 1.8 |
| 12 x 700 | normal | 5 | 3.0, 2.8, 3.0 |
| 12 x 450 | dim | 5 | 3.1, 3.2, 3.0 |
| 18 x 450 | dim | 5 | 4.8, 4.7, 4.7 |
| 8 x 700 | dim | 5 | 4.4, 2.0, 3.9 |
| 12 x 700 | dim | 5 | 6.0, 9.3, 3.2 |
| 8 x 450 | dim | 8 | 1.4, 1.3, 1.3 |
| 12 x 450 | normal | 8 | 1.9, 1.8, 1.9 |
| 12 x 450 | dim | 8 | 1.9, 2.0, 2.0 |
| 18 x 450 | normal | 8 | 3.0, 3.1, 3.1 |
| 18 x 450 | dim | 8 | 3.1, 3.0, 2.9 |

**Consequences.** Typical presentations scan in 1 to 2.5 seconds; the worst-case inline presentation (23 payload frames, 31 per cycle) is predicted at about 3.9 seconds. Both test phones are flagships, so timing must be confirmed on a budget Android phone (checklist 3.7). Frame rates above 8 fps were not tested.

---

## Open questions

| Id | Question | Owner | Status |
|---|---|---|---|
| Q-1 | The stubbed badge flow has citizens scan officials, contradicting D-001. Drop it, or keep it as a separate step? | Team | Open |
| Q-2 | `QrFieldDefinitions.cs` marks fewer fields mandatory than R3.4.2. Which is authoritative? | SRS owner | Open |
| Q-3 | Shape of the widened signing interface | Nathan and the rolling-keys owner | Open |
| Q-4 | Image library licence: ImageSharp or SkiaSharp | Nathan | Closed by D-017 |
