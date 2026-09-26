# FlashID Offline Presentation Wire Format

| | |
|---|---|
| Status | 1.2, updated on 2026-09-26. A change needs a new version and a decision entry |
| Owner | Nathan Chisadza |
| Used by | Backend offline package builder, mobile wallet, mobile verifier |
| Decisions | [decisions.md](decisions.md) |

## 1. Purpose

This document defines every byte of an offline credential presentation, so that the .NET issuer and the JavaScript verifier produce and check identical data. If the code and this document disagree, either the code is wrong or this document is changed first, with a changelog entry.

## 2. Standards basis

- IETF SD-JWT: selective disclosure and the Key Binding JWT
- RFC 7515 (JWS) compact serialisation, RFC 7518 (JWA) ES256, RFC 7517 (JWK)
- RFC 4648 section 5, base64url
- The selective-disclosure model of ISO/IEC 18013-5

Deliberate deviations are listed in section 11.

## 3. Encoding rules

- `b64u` means base64url **without padding**.
- JSON is serialised without escaping non-ASCII characters or `+`. `typ` travels as `dc+sd-jwt`, and aname such as `Zoë` travels as its UTF-8 bytes, not `Zo\u00EB` (D-021).
- Text is encoded as UTF-8. Every string that is hashed or signed contains only base64url characters, `.` and `~`, so its UTF-8 and ASCII bytes are identical.
- Receivers parse JSON but **never re-serialise JSON** to check a hash or a signature. Hashes and signatures are always checked over the exact text received.
- Timestamps are integer Unix seconds, UTC.
- Date values are ISO 8601 `YYYY-MM-DD`.
- All claim values are strings.

## 4. Disclosures

```
salt        = b64u(16 cryptographically random bytes)
disclosure  = b64u(UTF-8(JSON array [salt, claim_name, claim_value]))
digest      = b64u(SHA-256(ASCII(disclosure)))
```

- One disclosure per claim, with a fresh salt per claim every time a package is minted.
- The digest is computed over the base64url **string** of the disclosure, not over the decoded JSON.
- Digests are the full 32-byte SHA-256 output. Never truncate.

## 5. Claim names

Claim names are stable machine names mapped from the display labels in `QrFieldDefinitions.cs`.
Labels may change; claim names must not (D-010). "Mandatory" follows `QrFieldDefinitions.cs`;
see Q-2.

**Identity document**

| Display label | Claim name | Mandatory | In offline presentations |
|---|---|---|---|
| Date of birth | `date_of_birth` | yes | yes |
| Photograph | `portrait` | yes | yes |
| Identity number | `identity_number` | no | yes |
| Full surname | `surname` | no | yes |
| Full forenames | `forenames` | no | yes |
| Citizenship status | `citizenship_status` | no | yes |
| Gender | `gender` | no | yes |
| Country of birth | `country_of_birth` | no | yes |
| Card issue date and number | `card_issue_date_and_number` | no | yes |
| Signature | `signature_image` | no | no (D-011) |

**Driver's licence**

| Display label | Claim name | Mandatory | In offline presentations |
|---|---|---|---|
| Photo | `portrait` | yes | yes |
| Expiry date | `expiry_date` | yes | yes |
| Date of birth | `date_of_birth` | yes | yes |
| Full name | `full_name` | no | yes |
| SA ID number | `identity_number` | no | yes |
| License number | `license_number` | no | yes |
| License code | `license_code` | no | yes |
| Country of issue | `country_of_issue` | no | yes |
| Vehicle restrictions | `vehicle_restrictions` | no | yes |
| Date of issue | `issue_date` | no | yes |
| Signature | `signature_image` | no | no (D-011) |

`portrait` is the b64u of a colour WebP image (lossy, quality 40), 160 by 160 pixels, centre-cropped, with all metadata removed (D-018). Verifiers display it as a `data:image/webp;base64,` URI, after converting base64url to standard base64.

## 6. Issuer-signed JWT

**Header**

| Field | Value |
|---|---|
| `alg` | `ES256` |
| `typ` | `dc+sd-jwt` |
| `kid` | Signing key id, for example `flashid-cred-2026-09` |

**Payload**

| Claim | Type | Meaning |
|---|---|---|
| `iss` | string | `urn:flashid:issuer` |
| `vct` | string | `urn:flashid:identity-document:1` or `urn:flashid:drivers-license:1` |
| `iat` | integer | When the package was minted |
| `exp` | integer | The earlier of the document's expiry and `iat` plus 30 days (D-007) |
| `ri` | integer | Revocation index, the only credential identifier (D-012) |
| `_sd_alg` | string | `sha-256` |
| `_sd` | string array | Digests of **all** disclosures, randomly shuffled |
| `cnf` | object | `{"jwk": <device public key>}`, added in Phase 4 (D-005) |

**Signing**

```
signing_input   = b64u(UTF-8(header JSON)) + "." + b64u(UTF-8(payload JSON))
signature       = ECDSA P-256 over SHA-256(ASCII(signing_input))
issuer_jwt      = signing_input + "." + b64u(signature)
```

- The signature is IEEE P1363 format, raw r followed by s, **exactly 64 bytes**. Never DER. In .NET: `DSASignatureFormat.IeeeP1363FixedFieldConcatenation`.
- **Verifiers must accept high-S signatures** (D-014). .NET and Azure Key Vault do not normalise S. With `@noble/curves` version 2, verify with `{ lowS: false }`. Spike A (2026-09-14): with noble defaults only 21 and 24 of 50 .NET signatures verified across two batches; with `{ lowS: false }`, 50 of 50 in both.
- Never use signature bytes as an identifier or a deduplication key: accepting high-S means a second valid signature exists for the same data.

## 7. SD-JWT

```
sd_jwt = issuer_jwt + "~" + disclosure_1 + "~" + ... + "~" + disclosure_n + "~"
```

- The stored offline package holds all disclosures. A presentation holds every mandatory claim plus the optional claims the citizen chose.
- An SD-JWT always ends with `~`.

## 8. Key Binding JWT

| Header field | Value |
|---|---|
| `alg` | `ES256` |
| `typ` | `kb+jwt` |

| Payload claim | Meaning |
|---|---|
| `iat` | Signing time |
| `sd_hash` | `b64u(SHA-256(ASCII(sd_jwt)))`, including the final `~` |

```
kb_jwt       = JWS signed by the device private key, same signature rules as section 6
presentation = sd_jwt + kb_jwt
```

- The device key is P-256, generated on the phone and stored only there. Its public key is sent on every package request and embedded as `cnf.jwk` at minting; the request is refused without it (D-022).
- The wallet re-signs the Key Binding JWT every 5 seconds while presenting.
- A verifier accepts it when `iat` is at most 30 seconds old, allowing 60 seconds of clock skew either way (D-023).
- A verifier requires key binding whenever `cnf` is present, so a bound credential never verifies from its payload alone.

## 9. QR frames

```
FID1:P:<tid>:<idx>/<tot>:<chunk>
FID1:K:<tid>:<kb_jwt>
```

| Field | Rule |
|---|---|
| `FID1` | Format marker and version |
| `P`, `K` | Payload frame, key binding frame |
| `tid` | `b64u(4 random bytes)`, 6 characters, new for every presentation |
| `idx` | Zero-based frame index, decimal |
| `tot` | Total number of payload frames, decimal |
| `chunk` | Consecutive slice of `sd_jwt`, at most 450 characters (D-019) |

- Payload frames never change during a presentation; only K frames do.
- One K frame is shown after every third P frame and after the last one, so even a one-frame code carries one.
- A bound code waits at most 4 seconds for a K frame, then verifies without it (`MISSING_KEY_BINDING`) (D-023).
- Offline frames render at error correction level L, 280 px (D-024).
- Display rate is 8 frames per second (D-019).
- Scan time is about one display cycle: payload frames plus key binding frames, divided by 8.
- Reassembly joins chunks in `idx` order to recover `sd_jwt`, then appends the `kb_jwt` from the newest K frame.
- A new `tid` discards every frame collected so far.

## 10. Verification order and result codes

| Step | Check | Failure code | Citizen notified after sync |
|---|---|---|---|
| 1 | Frames and presentation parse | `MALFORMED` | no |
| 2 | `alg` is `ES256` | `UNSUPPORTED_ALG` | no |
| 3 | `kid` is in the cached key set and not revoked | `UNKNOWN_KEY`, `REVOKED_KEY` | no |
| 4 | Issuer signature is valid | `BAD_ISSUER_SIGNATURE` | no |
| 5 | `exp` is in the future | `EXPIRED` | yes |
| 6 | `ri` is not in the revocation list | `CREDENTIAL_REVOKED` | yes |
| 7 | Every disclosure digest is in `_sd`, none repeated | `DISCLOSURE_NOT_IN_SD`, `DUPLICATE_DISCLOSURE` | yes |
| 8 | Every mandatory claim for the `vct` is disclosed | `MISSING_MANDATORY_CLAIM` | yes |
| 9 | Key Binding JWT present and signed by `cnf.jwk` | `MISSING_KEY_BINDING`, `BAD_KEY_BINDING_SIGNATURE` | yes |
| 10 | `sd_hash` matches | `SD_HASH_MISMATCH` | yes |
| 11 | Key Binding `iat` is fresh | `STALE_PRESENTATION` | yes |
| 12 | Age of the key set and revocation list | Warning over 24 hours; `STALE_TRUST_DATA` over 7 days | no |

- Until step 4 passes, the credential identity is attacker-controlled, so those failures are logged but never notified.
- Failure notifications are limited to one per credential per hour. Notifications after sync are not implemented in this release. The column records the intended rule.

## 11. Deviations from the standards

- The Key Binding JWT has no `aud` or `nonce`, because a single scan gives the holder no verifier challenge. Mitigated by the 30-second freshness window and the portrait check.
- Because freshness is judged only from `iat`, a recording replayed within about 90 seconds (30 seconds plus 60 of skew) can still verify. Removing that window needs a verifier challenge over a two-way channel such as Bluetooth (D-023).
- The `FID1` QR frame transport is FlashID's own, not an ISO/IEC 18013-5 transport.
- Prototype trust anchor: the issuer key set is fetched over TLS rather than signed by an IACA root (D-009).

## 12. Size budget

A driver's licence presenting 5 of 11 claims, including the portrait. The portrait figures were measured on 10 test photos with the D-018 recipe. The other parts remain estimates until Phase 1.

| Part | Size | Source |
|---|---|---|
| Issuer JWT, 11 digests plus `cnf` | about 1,150 bytes | Estimate |
| 4 text disclosures | about 270 bytes | Estimate |
| Portrait, sent inline | WebP of 772 to 4814 bytes | Measured, Spike C |
| **Payload frames** | **7 to 14 typical, 23 worst case** | Measured, Spike C |
| **Scan time at 8 fps** | **1 to 2.5s typical, about 3.9s worst case** | Spike B. Worst case predicted |

## 13. Revocation list

`GET /api/credentials/revocation-list` returns `{ "revocationList": "<jws>", "retrievedAt": "<ISO 8601>" }`. The JWS follows the signature rules of section 6.

| Header field | Value |
|---|---|
| `alg` | `ES256` |
| `typ` | `revocation-list+jwt` |
| `kid` | Credential signing key |

| Payload claim | Meaning |
|---|---|
| `iss` | `urn:flashid:issuer` |
| `iat` | Signing time |
| `next_update` | `iat` plus 24 hours |
| `revoked` | Array of revocation indexes (`ri`) for every credential whose status is not `Active`, ascending |

- The verifier stores the list only if it verifies against its cached issuer keys: fixed `alg`, expected `typ` and `iss`, a known key that is not revoked, a valid signature and whole-number indexes (D-025).
- A list that fails is ignored and the last verified list stays.
- Its age counts in step 12 of section 10, using the phone's own clock at download.

## 14. Offline verification upload

`POST /api/credentials/offline-verifications` with:

```json
{ "entries": [ { "id": "<uuid>", "revocationIndex": 7, "result": "VERIFIED", "verifiedAt": 1790000000 } ] }
```

**d. Section 12, Size budget.** Replace everything from the line under `## 12. Size budget` down to the line above the next heading (the intro sentence and the whole table) with:

```markdown
Measured on 2026-09-21 and 2026-09-25 against the dev environment, using a real seeded driver's licence with its ID photo.
```

| Part | Size | Source |
|---|---|---|
| Issuer JWT | about 750 characters | Measured |
| Eight text disclosures | about 600 characters together | Measured |
| Portrait, sent inline | the rest of the package | Measured |
| Full package | 9,121 characters | Measured |
| **Payload frames** | **21** at 450 characters | Measured |
| **With key binding** | **28 frames** (21 payload, 7 K) | Measured |
| **Scan time at 8 fps** | **3.5 s per cycle; about 4.2 s observed**, S23 showing, S24 scanning | Measured |

- The portrait is almost the whole payload, so dropping optional claims saves about one frame. The portrait recipe is the only real lever (D-018).
- A budget phone as the scanner is still unmeasured.


## 15. Test vectors

The cross-stack fixture (checklist 1.11) contains a public key and a presentation only.
**Private keys are never committed.** The .NET test suite and the mobile Jest suite verify the same file.

## 16. Changelog

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-09-14 | Initial draft; Spike A result recorded in section 6 |
| 1.0 | 2026-09-15 | Frozen. Portrait recipe (D-018), frame size and rate (D-019) from Spikes B and C, with size budget measured |
| 1.1 | 2026-09-19 | `iss` becomes the URI `urn:flashid:issuer` (D-020); JSON escaping relaxed so `typ` and non-ASCII claim values travel unescaped (D-021) |
| 1.2 | 2026-09-26 | Device key required (D-022); key binding timing and scanner wait (D-023); offline frames at level L, 280 px (D-024); revocation list format (D-025) and offline verification upload (D-026) added as sections 13 and 14; size budget replaced with measured values |
