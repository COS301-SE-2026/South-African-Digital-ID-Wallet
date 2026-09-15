# FlashID Offline Presentation Wire Format

| | |
|---|---|
| Status | 1.0, frozen on 2026-09-15. A change needs a new version and a decision entry |
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
| `iss` | string | `flashid` |
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

## 8. Key Binding JWT (Phase 4)

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

- The device key is P-256; its public key is embedded as `cnf.jwk` at minting.
- The wallet re-signs the Key Binding JWT every 5 seconds while presenting.
- A verifier accepts it when `iat` is at most 30 seconds old, allowing 60 seconds of clock skew.

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
- One K frame is shown after every third P frame.
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
- Failure notifications are limited to one per credential per hour.

## 11. Deviations from the standards

- The Key Binding JWT has no `aud` or `nonce`, because a single scan gives the holder no verifier challenge. Mitigated by the 30-second freshness window and the portrait check.
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

## 13. Test vectors

The cross-stack fixture (checklist 1.11) contains a public key and a presentation only.
**Private keys are never committed.** The .NET test suite and the mobile Jest suite verify the same file.

## 14. Changelog

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-09-14 | Initial draft; Spike A result recorded in section 6 |
| 1.0 | 2026-09-15 | Frozen. Portrait recipe (D-018), frame size and rate (D-019) from Spikes B and C, with size budget measured |
