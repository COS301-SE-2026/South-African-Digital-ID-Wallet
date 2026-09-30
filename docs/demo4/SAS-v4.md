# Software Architecture Specification (SAS)
## FlashID - South African Digital ID Wallet

> COS 301 Capstone Project 2026  
> Team: Tech Titans  
> Client: Agile Bridge (Pty) Ltd  
> Version: 0.1

## Table of Contents

1. [Introduction](#1-introduction)
2. [Architectural Requirements](#2-architectural-requirements)
    - [2.1 Architectural Patterns](#21-architectural-patterns)
    - [2.2 Design Patterns](#22-design-patterns)
    - [2.3 Constraints](#23-constraints)
    - [2.4 Architectural Diagram](#24-architectural-diagram)
    - [2.5 Mapping Quality Requirements to Architectural Decisions](#25-mapping-quality-requirements-to-architechtural-decisions)
3. [Technology Requirements](#3-technology-requirements)
4. [API Contracts](#4-api-contracts)
    - [Auth](#auth)
    - [Citizens](#citizens)
    - [Credentials](#credentials)
    - [Credential Activation](#credential-activation)
    - [Citizen Verification](#citizen-verification)
    - [Institutions](#institutions)
    - [Onboarding](#onboarding)
    - [Activity](#activity)
    - [Dashboard](#dashboard)
    - [Account Management](#account-management)
    - [Notifications](#notifications)
    - [Officials](#officials)
    - [Trusted Devices](#trusted-devices)
    - [Government Registry Service](#government-registry-service)
5. [Deployment](#5-deployment)
    - [5.1 Live System](#51-live-system)
    - [5.2 Environment Parity](#52-environment-parity)
    - [5.3 Infrastructure as Code / Containerisation](#53-infrastructure-as-code--containerisation)
    - [5.4 Secrets Management](#54-secrets-management)
    - [5.5 Rollback Strategy](#55-rollback-strategy)
    - [5.6 Deployment Diagram](#56-deployment-diagram)
    - [5.7 CI/CD Pipeline Diagram](#57-cicd-pipeline-diagram)
6. [Non-Functional Requirement (NFR) Testing](#6-non-functional-requirement-nfr-testing)

## 1. Introduction

This Software Architecture Specification (SAS) describes the technical structure of FlashID (South African Digital ID Wallet). The architectural decisions made to satisfy the requirements defined in the SRS. The SRS specifies *what* the system must do, where as this document *how* the system is built, deployed and operated to meet those requirements.

FlashID is composed of four subsystems: Next.js for web portal for citizens, administrators and officials. React Native for mobile app wallet for citizens and ASP.NET Core for backend API that owns identity, credential, authentication logic and a separate government-registry service that simulates the external national ID authority from Home Affairs that FlashID integrates against. All components are containerised or published via GitHub Actions and deployed to Azure Web Apps, with SQL Server for persistence and Azure Blob Storage for credential photo storage.

## 2. Architectural Requirements

The full architectural requirements, including architectural patterns, design patterns, constraints and mapping can be found in:

 **[architecture-v2.md](../demo4/architecture-v4.md)**

### Architectural Diagram
![Architectural Diagram](../images/_architecture_diagram_final.drawio.svg)
  

## 3. Technology Requirements
| Area | Framework | Why
|---|---|---|
| Web Frontend | Next.js 16, React 19, Typescript | Type-safe, React is server-rendered for admin portal |
| Web UI | Tailwind CSS, Radix UI and shadcn/ui | Accessible, Better Readability, Reuable components without rebuilding from scratch |
| Mobile | Expo React Native | Single codebase for IOS and Android mobile app |
| Client data | TanStack Query, Zustand | Server-state caching and lightweight local UI state |
| Backend API | ASP.NET Core - .NET 10 - C# | Strongly-types, high-performance API layer |
| Authentication | JWT via HttpOnly cookies | Stateless auth by using tokens which are hidden and reduce XSS risk |
| Database | Microsoft SQL Server | Relational integrity for identity and credential records |
| File storage | Azure Blob Storage | Stores citizen photos separately from relational data |
| CI/CD and Hosting | Github Actions, Docker, Azure Web Apps | Automated build/test/deploy on every push |
| Code quality | ESLint, Prettier, SonarCloud, Codecov | Enforces consistent style and catches issues before merge |

## 4. API Contracts
> Base URL: `http://localhost:5118` (DEV)
> All endpoints return JSON. All protected endpoints require a valid JWT token transmitted via HttpOnly cookie.

### Auth

#### GET /api/auth/me
Returns the currently authenticated user's profile and citizen identity-linking state.

**Authentication:** Required

**Response 200:**
```json
{
    "id": "string",
    "names": "string",
    "surname": "string",
    "saId": "string",
    "email": "string",
    "role": "string",
    "isIdentityVerified": true
}
```

#### POST /api/auth/login
Authenticates a user. If the device is already trusted, authentication completes immediately and an access token is issued through an HttpOnly cookie. If the device is not trusted, a device verification request is created and OTP verification is required before authentication can complete.

**Authentication:** None

**Cookies:**
- `flashid_device` - optional HttpOnly cookie containing the existing trusted-device token.
- `access_token` - set by the server after successful authentication from a trusted device.

**Request Body:**
```json
{
    "email": "string",
    "password": "string",
    "rememberMe": false
}
```

**Response 200 — Trusted Device:**
```json
{
    "token": "",
    "expiresAt": "2026-08-16T21:30:00Z",
    "userId": "00000000-0000-0000-0000-000000000000",
    "role": "Citizen",
    "requiresDeviceVerification": false,
    "deviceVerificationId": null,
    "deviceToken": null
}
```

The JWT access token is returned through the `access_token` HttpOnly cookie and is therefore not exposed in the response body.

**Response 200 — Untrusted Device:**
```json
{
    "token": "",
    "userId": "00000000-0000-0000-0000-000000000000",
    "role": "Citizen",
    "requiresDeviceVerification": true,
    "deviceVerificationId": "00000000-0000-0000-0000-000000000000"
}
```

When `requiresDeviceVerification` is `true`, the client must continue authentication using `POST /api/auth/verify-device`.

**Response 401:** Invalid credentials, deleted account, or locked account  
**Response 403:** Email address has not been verified  
**Response 500:** Authentication could not be completed

#### POST /api/auth/verify-device
Verifies the OTP issued during login for an untrusted device. Successful verification marks the device as trusted and completes authentication.

**Authentication:** None

**Cookies:**
- `flashid_device` - optional. If an existing device token is supplied, the corresponding trusted-device record is updated. If no device token exists, a new trusted-device token is generated and returned through an HttpOnly cookie.
- `access_token` - set after successful device verification.

**Request Body:**
```json
{
    "deviceVerificationId": "00000000-0000-0000-0000-000000000000",
    "otp": "123456",
    "rememberMe": false,
    "deviceType": "Desktop",
    "operatingSystem": "Windows",
    "browser": "Chrome"
}
```

**Request Fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `deviceVerificationId` | UUID | Yes | Identifier returned by `POST /api/auth/login` when device verification is required |
| `otp` | string | Yes | One-time verification code sent to the user's email |
| `rememberMe` | boolean | Yes | Determines the JWT expiry behaviour |
| `deviceType` | enum | Yes | Type of device being verified |
| `operatingSystem` | string | Yes | Client operating system |
| `browser` | string | Yes | Client browser |

**Device Types:**
- `Desktop`
- `Mobile`
- `Tablet`
- `Laptop`
- `Unknown`

**Response 200:**
```json
{
    "token": "",
    "expiresAt": "2026-08-16T21:30:00Z",
    "userId": "00000000-0000-0000-0000-000000000000",
    "role": "Citizen",
    "requiresDeviceVerification": false,
    "deviceVerificationId": null,
    "deviceToken": null
}
```

On success:
- The OTP verification is marked as used.
- The device is stored or updated as a trusted device.
- The device's last active time is updated.
- The approximate city and country associated with the request IP address are stored where available.
- An `access_token` HttpOnly cookie is set.
- If the client did not already have a device token, a `flashid_device` HttpOnly cookie is set.
- Device verification is recorded in the audit log.

Sensitive access and device tokens are not returned to frontend JavaScript in the response body.

**Response 401:** Device verification failed. This includes:
- Missing device verification ID
- Missing OTP
- Verification request not found
- Verification request already used
- Verification code expired
- Maximum verification attempts exceeded
- Invalid verification code
- Associated user account no longer exists

**Response 500:** Device verification completed without an access token or an unexpected server error occurred.

#### POST /api/auth/resend-device-verification

Generates and sends a new OTP for an existing device verification request.

**Authentication:** None

**Rate Limit:** `resend-device-verification`

**Request Body:**

```json
{
    "deviceVerificationId": "00000000-0000-0000-0000-000000000000"
}
```

**Request Fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `deviceVerificationId` | string (UUID) | Yes | Identifier returned by `POST /api/auth/login` when device verification is required |

**Response 200:**

```json
{
    "message": "Verification code has been resent to your email."
}
```

On success:

- A new six-digit OTP is generated.
- The previous OTP is replaced with the newly generated OTP.
- The OTP expiry period is refreshed.
- The new OTP is sent to the User's registered email address.
- The resend action is recorded in the audit log.

**Response 400:** Invalid request. This includes:
- Missing `deviceVerificationId`
- Invalid `deviceVerificationId` format

**Response 401:** Device verification resend failed. This includes:
- Device verification request not found
- Device verification has already been completed
- Device verification request has expired
- Associated user account does not exist or has been deleted

**Response 429:** Too many resend requests. The configured resend rate limit has been exceeded.

**Response 500:** An unexpected server error occurred while attempting to resend the verification OTP.

#### Post /api/auth/logout
Clears the JWT cookie and ends the user session.

**Authentication:** Required

**Response 200:** Session ended, cookie cleared

### Citizens

#### POST /api/citizens/register
Registers a new citizen account using a SA ID number and activation code.

**Authentication:** None
**Rate Limit:** 5 requests per minute per client

**Request Body:**
```json
{
    "saId": "string",
    "username": "string",
    "password": "string",
    "activationCode": "string"
}
```

**Validation Rules:**
- `saId` - exact 13 num digits
- `username` - min 8 char, no spaces
- `password` - min 10 char, must have uppercase, lowercase, digit and special char
- `activationCode` - non-empty

**Response 201:** Citizen acc created
**Response 400:** Validation error
**Response 409:** Email already taken
**Response 429:** Rate limit exceeded

#### POST /api/citizen/verify-email
Verifies a citizen's email using OTP sent at registeration.

**Authentication:** None

**Request Body:**
```json
{
    "email": "string",
    "otp": "string"
}
```

**Response 200:** Email verified
**Response 400:** Invalid OTP, expired OTP, too many attempts, or already verified

#### POST /api/citizens/resend-otp
Resends the email verification OTP.

**Authentication:** None

**Response 200:** OTP resent
**Response 400:** Already verified or invalid request

### Credentials 

#### GET /api/credentials/me
Returns authenticated citizen's full creds set.

**Authentication:** Required for Citizen

#### GET /api/credentials/mine
Returns cred summary for QR.

**Authentication:** Required

#### POST /api/credentials/{credentialId}/qr-token
Generate the time-limited QR for scan creds.

**Authentication:** Required

**Path Parameter:** `credentialId` - UUID

**Request Body:**
```json
{
    "disclosedFields": ["string"]
}
```

**Response 200:** QR token issued
**Response 400:** Credential not active or invalid
**Response 403:** Access denied
**Response 404:** Credential not found

#### POST /api/credentials/resolve
Resolves a scanned QR token into disclosed credential data.

**Authentication:** Required

**Request Body:** 
```json
{ "token": "string" }
```

**Response 200:** Disclosed credential data
**Response 400:** Invalid or expired disclosure token

#### POST /api/credentials/{credentialId}/revoke
Admin marks a credential as revoked or under investigation.
**Authentication:** Required for GovernmentAdministrator
**Path Parameter:** `credentialId` - UUID
**Request Body:**
```json
{
    "newStatus": "string",
    "reason": "string"
}
```
**Response 200:** Status updated
**Response 400:** Invalid status transition
**Response 403:** Access denied
**Response 404:** Credential not found

#### POST /api/credentials/{credentialId}/reinstate
Admin reinstates a revoked or under-investigation credential back to active.
**Authentication:** Required for GovernmentAdministrator
**Path Parameter:** `credentialId` - UUID
**Request Body:**
```json
{
    "reason": "string"
}
```
**Response 200:** Status updated to Active
**Response 400:** Credential is not currently Revoked or Investigation
**Response 403:** Access denied
**Response 404:** Credential not found

#### GET /api/credentials/search
Admin searches for citizens by name, surname, or ID number. Empty query returns all citizens, paginated.
**Authentication:** Required for GovernmentAdministrator
**Query Parameters:** `query` - string (optional), `page` - int (default 1), `pageSize` - int (default 15)
**Response 200:** Paginated list of matching citizens. Note: `expiresOn` is only populated if the citizen has a driver's license credential; it is null otherwise.

#### GET /api/credentials/citizen/{citizenId}
Admin retrieves a specific citizen's full credential list.
**Authentication:** Required for GovernmentAdministrator
**Path Parameter:** `citizenId` - UUID
**Response 200:** List of the citizen's credentials
**Response 404:** Citizen not found

### Credential Activation

#### POST /api/activate-credentials
Activates one or more government-issued credentials for the authenticated citizen after their identity has been verified.

The citizen must already be linked to a verified FlashID citizen record. FlashID retrieves the selected credential records from the Government Registry and stores them in the citizen's wallet.

**Authentication:** Required for Citizen

**Request Body:**
json
{
    "credentialTypes": [
        "IdentityDocument",
        "DriversLicense"
    ]
}
`

**Credential Types:**

| Value            | Description                     |
| ---------------- | ------------------------------- |
| IdentityDocument | South African identity document |
| DriversLicense   | South African driver's licence  |

At least one credential type must be selected.

**Response 200:**

json
{
    "status": "string",
    "message": "string"
}


**Response 400:** Invalid request or unsupported credential type
**Response 401:** Authenticated account could not be identified
**Response 404:** Citizen or requested credential could not be found in the Government Registry
**Response 409:** Citizen is not verified, or the requested credential is already active
**Response 500:** Unexpected credential persistence failure

### Credential Expiry Check

#### POST /api/credentials/expiry-check
Manually runs the daily credential-expiry check. Idempotent per SAST calendar date (If today's check already completed, returns that result without reprocessing. If another instance is currently running today's check, returns `409`.)

**Authentication:** Required for Government Administrator

**Request Body:** None

**Response 200:**
```json
{
    "runDate": "date",
    "status": "string",
    "processedCount": 0,
    "startedAt": "date",
    "completedAt": "date",
    "errorMessage": "string"
}
```

**Response 403:** Caller is not a Government Administrator
**Response 409:** Another expiry check is currently running for today

### Credential Update Check

#### POST /api/credentials/update-check
Manually runs the daily citizen-credential update check. Idempotent per SAST calendar date (if today's check already completed, returns that result without reprocessing, or if another instance is currently running today's check it returns 409.). Re-fetches each citizen with at least one Active credential from the Government Registry and applies any changed personal details or credential fields, re-signing Credential.Signature and notifying the citizen only where a difference was found.

**Authentication:** Required for Government Administrator

**Request Body:** None

**Response 200:**
```json
{
    "runDate": "date",
    "status": "string",
    "processedCount": 0,
    "startedAt": "date",
    "completedAt": "date",
    "errorMessage": "string",
}
```

**Response 403:** Caller is not a Government Administrator
**Response 409:** Another update check is currently running for today

### Citizen Verification

Citizen verification supports two identity-proofing methods:

1. Activation token verification for citizens previously onboarded by an official.
2. Physical identity verification using Government Registry identity data and Azure Face liveness-with-verification.

Physical identity verification is performed against the authenticated citizen account. The ID entered by the user is treated as a claim and is validated against the Government Registry before biometric verification.

---

#### POST /api/citizen-verification/activate-token
Verifies an activation token and PIN issued during official assisted citizen onboarding.

**Authentication:** Required for Citizen

**Request Body:**
```json
{
    "token": "string",
    "saId": "string",
    "pin": "string"
}
```

**Validation Rules:**
- `saId` must contain exactly 13 numeric digits.
- `token` must be valid and unexpired.
- `pin` must match the issued activation PIN.

**Response 200:** Citizen identity verified and account linked

**Response 400:** Invalid request
**Response 404:** Activation record or citizen not found
**Response 409:** Activation state is invalid or citizen is already linked to another account
**Response 410:** Activation token has expired

---

#### POST /api/citizen-verification/physical

Starts a new physical identity verification session for the authenticated citizen.

If the citizen already has an active, non expired physical verification session, the existing session may be returned instead of creating another one.

**Authentication:** Required for Citizen

**Request Body:** None

**Response 200:**
```json
{
    "verificationId": "string",
    "status": "AwaitingConsent",
    "expiresAt": "date"
}
```

**Physical Verification Status Values:**

| Status                       | Meaning                                                    |
| ----------------------------- | ---------------------------------------------------------- |
| AwaitingConsent               | Waiting for citizen biometric consent                      |
| AwaitingDocument              | Consent granted; identity information may now be submitted |
| DocumentProcessing            | Reserved for document-processing flow                      |
| AwaitingIdConfirmation        | Reserved for ID confirmation flow                          |
| AwaitingLiveness              | Ready for biometric liveness verification                  |
| LivenessProcessing            | Liveness verification is being processed                   |
| AwaitingRegistryVerification  | Waiting for authoritative registry verification            |
| Verified                      | Identity verification succeeded                            |
| Failed                        | Identity verification failed                               |
| Expired                       | Verification session expired                               |



---

#### POST /api/citizen-verification/physical/{verificationId}/consent

Records explicit citizen consent before biometric identity verification is performed.

Consent must be granted before a liveness session can be created.

**Authentication:** Required for Citizen

**Path Parameter:**
- verificationId - UUID of the physical identity verification session

**Request Body:** None

**Response 200:**
```json
{
    "verificationId": "string",
    "status": "AwaitingDocument",
    "registryIdentityMatched": null,
    "livenessPassed": null,
    "registryFaceMatched": null,
    "expiresAt": "date",
    "verifiedAt": null,
    "failureReason": null
}
```

**Response 404:** Verification session not found or does not belong to authenticated citizen
**Response 409:** Consent cannot be granted from the current verification state
**Response 410:** Verification session expired

---

#### POST /api/citizen-verification/physical/liveness-session

Validates the submitted SA ID against the Government Registry and creates an Azure Face liveness with verification session.

FlashID retrieves the authoritative citizen portrait from private backend storage and supplies it directly to Azure Face as the verification image. The reference portrait is never returned to the frontend.

The frontend receives only the short lived Azure session credentials required to run the liveness capture.

**Authentication:** Required for Citizen

**Request Body:**
```json
{
    "verificationId": "string",
    "saId": "string"
}
```

**Validation Rules:**
- verificationId must identify a verification owned by the authenticated citizen.
- Consent must already have been granted.
- saId must contain exactly 13 numeric digits.
- If an SA ID has already been associated with the verification session, a different SA ID cannot later be submitted.
- The citizen must exist in the Government Registry.
- The Government Registry citizen must have an authoritative portrait available.

**Response 200:**
```json
{
    "sessionId": "string",
    "authToken": "string",
    "status": "string"
}
```

authToken is short-lived and is used only by the Azure Face web component. It must not be persisted or logged by the client.

**Response 400:** Invalid SA ID format
**Response 404:** Verification session or Government Registry citizen not found
**Response 409:** Invalid verification state or SA ID conflicts with the current verification session
**Response 410:** Verification session expired
**Response 502:** Azure Face or Government Registry integration failure

---

#### POST /api/citizen-verification/physical/{verificationId}/liveness-result

Retrieves the authoritative liveness with verification result from Azure Face and completes the physical identity verification.

The browser does not determine whether verification succeeded. FlashID independently retrieves the result from Azure Face and makes the final decision on the server.

Verification succeeds only when:
```text
RegistryIdentityMatched == true
AND
LivenessPassed == true
AND
RegistryFaceMatched == true
```

If successful, FlashID creates or links the citizen record to the authenticated user and marks the citizen as verified.

**Authentication:** Required for Citizen

**Path Parameter:**
- verificationId - UUID of the physical identity verification session

**Request Body:** None

**Response 200:**
```json
{
    "verificationId": "string",
    "status": "Verified",
    "registryIdentityMatched": true,
    "livenessPassed": true,
    "registryFaceMatched": true,
    "expiresAt": "date",
    "verifiedAt": "date",
    "failureReason": null
}
```

If Azure has not yet completed processing, the endpoint may return the current verification state without marking the verification as complete.

If verification fails:
```json
{
    "verificationId": "string",
    "status": "Failed",
    "registryIdentityMatched": true,
    "livenessPassed": false,
    "registryFaceMatched": false,
    "expiresAt": "date",
    "verifiedAt": null,
    "failureReason": "string"
}
```

**Response 404:** Verification session not found or does not belong to authenticated citizen
**Response 409:** Verification cannot be completed from the current state
**Response 410:** Verification session expired
**Response 502:** Azure Face result could not be retrieved

---

#### GET /api/citizen-verification/physical/{verificationId}

Returns the current state of a physical identity verification session.

This endpoint may be used by the frontend to restore or refresh the current verification state.

**Authentication:** Required for Citizen

**Path Parameter:**
- verificationId - UUID of the physical identity verification session

**Response 200:**
```json
{
    "verificationId": "string",
    "status": "AwaitingLiveness",
    "registryIdentityMatched": true,
    "livenessPassed": null,
    "registryFaceMatched": null,
    "expiresAt": "date",
    "verifiedAt": null,
    "failureReason": null
}
```

**Response 404:** Verification session not found or does not belong to authenticated citizen
**Response 410:** Verification session expired

---

### Offline Verification Service Contract

Byte-level definitions of the values returned here are in [wire-format.md](wire-format.md).

### Offline Verification

#### POST /api/credentials/{credentialId}/offline-package

Returns the citizen's offline credential package, minting it if none is stored or the stored one is stale. Re-minting happens when the package has expired, is older than 7 days, was signed by a key that is no longer active, is bound to a different device key, or the credential has been updated since it was signed (D-007).

**Authentication:** Required, role `Citizen`. The credential must belong to the caller.

**Path parameters:**
- `credentialId` - the credential to prepare for offline presentation.

**Request body:** required (D-022).
```json
{ "deviceKey": { "kty": "EC", "crv": "P-256", "x": "qdHQBxh_no3hO8faJ-QU9bguirYPb6hDoEZTq3rWbkg", "y": "dDlHz1bvfdVFBt-vfyZVnxmCxuS3-MPduE49uAt9znU" } }
```

The public half of the key the wallet created on the phone. It is embedded in the credential as `cnf`, and a change of key re-mints the package.

**Response 200:**
```json
{
    "issuerSignedCredential": "eyJhbGciOiJFUzI1NiIsInR5cCI6ImRjK3NkLWp3dCIsImtpZCI6ImZsYXNoaWQtY3JlZC1kZXYtMjAyNi0wOSJ9.eyJpc3MiOiJ1cm46Zmxhc2hpZDppc3N1ZXIiLCJ2Y3QiOiJ1cm46Zmxhc2hpZDpkcml2ZXJzLWxpY2Vuc2U6MSIsImlhdCI6MTc5MDAwMDUyMCwiZXhwIjoxNzkyNTkyNTIwLCJyaSI6MSwiX3NkX2FsZyI6InNoYS0yNTYiLCJfc2QiOlsiLi4uIl19.ZeyrzG0K2jQVOZOK23mtshDkP",
    "disclosures": {
        "portrait": "WyJqQjJHSW5pbGllNzlacWZLek9vQm5nIiwicG9ydHJhaXQiLCJVa2xHUnBvUSJd",
        "expiry_date": "WyJVWDcxYVM5dmh0OXp2LXc5T1lxdnd3IiwiZXhwaXJ5X2RhdGUiLCIyMDI5LTA2LTAxIl0",
        "date_of_birth": "WyItVERRbWVfTEQwbmNXcDhCdnNHVVRRIiwiZGF0ZV9vZl9iaXJ0aCIsIjE5OTMtMDItMTIiXQ"
    },
    "signedAt": "2026-09-21T16:22:00.2243506+02:00",
    "expiresAt": "2026-10-21T16:22:00.2243506+02:00"
}
```

`disclosures` is keyed by claim name so the wallet can offer the citizen a choice without decoding each disclosure first. Every value is the base64url of `[salt, claim_name, claim_value]`.

**Response 400:** the credential is not active, or the device key is missing or not a valid P-256 public key.

**Response 403:** the credential belongs to another citizen.

**Response 404:** no credential with that id.

**Response 409:** the credential can't produce a presentation: it is missing data every offline presentation needs, such as a photograph, or the document behind it has expired.

```json
{ "error": "The credential is missing 'portrait', which every offline presentation must include." }
```

**Response 503:** the package could not be prepared right now; the wallet should retry later.

#### GET /api/credentials/issuer-keys

Returns the public keys that verify offline credentials, for a verifier to cache before going offline. Verifiers warn when this data is over 24 hours old and refuse to verify when it is over 7 days old (D-009).

**Authentication:** Required, any role. Citizens verify citizens, so verifiers are not limited to
officials (D-001).

**Response 200:**
```json
{
    "keys": [
        {
            "kid": "flashid-cred-dev-2026-09",
            "kty": "EC",
            "crv": "P-256",
            "x": "qdHQBxh_no3hO8faJ-QU9bguirYPb6hDoEZTq3rWbkg",
            "y": "dDlHz1bvfdVFBt-vfyZVnxmCxuS3-MPduE49uAt9znU",
            "status": "active"
        }
    ],
    "retrievedAt": "2026-09-21T16:20:51.6321052+02:00"
}
```

`status` is `active` for the key signing now, or `retired` for a key whose private half is disabled but whose existing signatures must still verify for up to 45 days (D-008).

---

#### GET /api/credentials/revocation-list

Returns the signed list of revocation indexes that must no longer verify offline, for a verifier to cache before going offline (D-025). The list follows wire-format section 13.

**Authentication:** Required, any role.

**Response 200:**
```json
{
    "revocationList": "eyJhbGciOiJFUzI1NiIsInR5cCI6InJldm9jYXRpb24tbGlzdCtqd3QiLCJraWQiOiJmbGFzaGlkLWNyZWQtZGV2LTIwMjYtMDkifQ.eyJpc3MiOiJ1cm46Zmxhc2hpZDppc3N1ZXIiLCJpYXQiOjE3OTAwMDAwMDAsIm5leHRfdXBkYXRlIjoxNzkwMDg2NDAwLCJyZXZva2VkIjpbN119.signature",
    "retrievedAt": "2026-09-26T10:00:00+02:00"
}
```

The payload holds `iss`, `iat`, `next_update` (24 hours later) and `revoked`, the revocation index of every credential that is not `Active`. The verifier stores the list only if its signature verifies against the cached issuer keys.

#### POST /api/credentials/offline-verifications

Records scans a verifier's phone made while offline, once it has signal again (D-026). Each entry's `id` is generated on the phone and becomes the audit row's id, so a retried upload is recorded once.

**Authentication:** Required, any role. Every row records the caller as the actor.

**Request body:**
```json
{
    "entries": [
        { "id": "3f0e8a52-4c1d-4b8e-9d2a-6f1b7c9e0a11", "revocationIndex": 7, "result": "VERIFIED", "verifiedAt": 1790000000 }
    ]
}
```

`revocationIndex` is sent only when `result` is `VERIFIED`; failed scans are recorded against the verifier and never linked to a citizen. `verifiedAt` is Unix seconds by the phone's clock.

**Response 200:**
```json
{ "recorded": 1, "duplicates": 0 }
```

**Response 400:** more than 100 entries, a missing id, an unknown result or a time out of range.

#### Physical Identity Account Linking Rules

Physical identity verification is an alternative identity proofing mechanism and does not require the citizen to have previously been onboarded by an official.

A FlashID Citizen record is only created or linked after successful Government Registry and biometric verification.

On successful verification:

1. If the SA ID belongs to a Citizen already linked to another user, the request is rejected.
2. If the authenticated user is already linked to a different Citizen, the request is rejected.
3. If the Citizen exists but is not linked to a user, it is linked to the authenticated user.
4. If no FlashID Citizen exists for the verified SA ID, one is created using authoritative Government Registry data and linked to the authenticated user.
5. If the Citizen is already linked to the same user, the operation is treated idempotently.

The citizen is marked Verified only after identity, liveness and registry face verification have all succeeded.

---

#### Physical Verification Security Rules

- The Government Registry is the authoritative source for citizen identity data.
- A citizen-entered SA ID is treated only as an identity claim until confirmed by the Government Registry.
- The Government Registry portrait is retrieved server-to-server and is never exposed to the browser.
- Azure Face API credentials remain server-side.
- The frontend receives only a short-lived Azure Face session authentication token.
- FlashID does not persist raw liveness images or biometric captures.
- Azure liveness session images are disabled.
- SA IDs, biometric data, Azure authentication tokens and raw Azure Face responses must not be written to application logs.
- Explicit citizen consent is required before biometric processing.
- The final verification decision is made by the FlashID backend, not by the browser.

### Institutions

#### POST /api/institutions/register
Registers a new institution and returns a one-time API key.

**Authentication:** Required for Gov Admin

**Request Body:**
```json
{
    "name": "string",
    "type": 0,
    "verificationNumber": "string",
    "adminId": "string",
}
```

**Institution Types:**
| Value | Type |
|---|---|
| 0 | HomeAffairs |
| 1 | LicensingDepartment |

**Validation Rules:**
- `name` - required
- `verificationNumber` - required
- `adminId` - non-empty

**Response 200:**
```json
{
    "institutionId": "string",
    "name": "string",
    "type": "string",
    "apiKey": "string",
    "apiKeyReference": "string",
    "verificationNumber": "string",
    "createdAt": "date"
}
```

**Response 400:** Validation error
**Response 404:** Admin not found
**Response 409:** Verification number already exists

#### GET /api/institutions
Returns all registered institutions.

**Authentication:** Required for Gov Admin

**Response 200:**
```json
[
    {
        "institutionId": "string",
        "name": "string",
        "type": "string",
        "verificationNumber": "string",
        "registeredById": "string",
        "createdAt": "date"
    }
]
```

#### GET /api/institutions/{institutionId}
Returns single institution by ID.

**Authentication:** Required

**Path Parameter:**
- `institutionId` - UUID of the institution

**Response 200:** Institution object
**Response 404:** Institution not found

### Onboarding

#### GET /api/onboarding/verify/{idNumber}
Looks up a citizen's identity record from the mock gov register.

**Authentication:** Required for Officials

**Path Parameter:**
- `idNumber` - SA ID number

**Response 200:**
```json
{
    "saId": "string",
    "names": "string",
    "surname": "string",
    "dateOfBirth": "string",
    "gender": "string"
}
```

**Response 404:** Identity record not found

#### POST /api/onboarding/citizen
Onboards a citizen after identity verification and generate an activation code.

**Authentication:** Required for Officials

**Request Body:**
```json
{
    "saId" : "string",
    "phoneNumber": "string",
    "email": "string",
    "consentGiven": true
}
```

**Response 200:**
```json
{
    "activationCode": "string",
    "citizenId" : "string",
    "message" : "string"
}
```

**Response 400:** Validation error or consent not given
**Response 409:** Citizen already onboarded

### Issue Credentials

#### GET /api/credentials/citizens/{saId}/status
Looks up a citizen already known to FlashID (via SA ID) and returns their onboarding status and any credentials already issued, so the admin portal can decide whether to enable "Issue Driver's License" or route to onboarding.

**Authentication:** Required for Officials

**Path Parameter:**
- `saId` - SA ID number, 13 digits

**Response 200:**
```json
{
    "saId": "string",
    "names": "string",
    "surname": "string",
    "dateOfBirth": "date",
    "status": "string",
    "activatedAt": "date",
    "phoneNumber": "string",
    "email": "string",
    "existingCredentials": [
        { 
            "type": "string",
            "status": "string",
            "issueDate": "date"
        }
    ]
}
```

Citizen Status Values: Pending | Activated | Deactivated | Suspended | Verified
Credential Status Values (existingCredentials[].status): Active | Inactive | Investigation | Revoked | Expired

`phoneNumber` and `email` are null unless status is Activated. They belong to the citizen's FlashID user account, which only exists after activation.

**Response 400:** Invalid SA ID format
**Response 404:** No FlashID citizen record found for this SA ID. Official should route to onboarding

#### POST /api/credentials/issue
Fetches a citizen's credential from the government registry and issue it into FlashID, after recording POPIA consent for this specific issuance.

**Authentication:** Required for Officials

**Request Body:**
```json
{
    "saId": "string",
    "credentialType": "string",
    "consentGiven": true
}
```

**Credential Types:**
| Value | Type |
|---|---|
| IdentityDocument | Identity document |
| DriversLicense | Driver's license |

**Response 201:**
```json
{
    "id": "string",
    "type": "string",
    "title": "string",
    "issuedBy": "string",
    "status": "string",
    "issueDate": "date",
    "driversLicense": {
            "licenseNumber": "string",
            "licenseCode": "string",
            "restrictions": "string",
            "expiryDate": "date"
    }
}
```

`issuedBy` is the government issuing authority (e.g. "Licensing Department"), taken from the government registry record, not the FlashID official who performed the action. `driversLicense` is present when `credentialType` is "DriversLicense". An equivalent `identityDocument` object is present when `credentialType` is "IdentityDocument".

**Response 400:** Validation error, or consent not given
**Response 404:** Citizen not found in FlashID, or no matching record at the government registry
**Response 409:** Citizen is not `Activated` in FlashID, or already has an `Active` credential of that type

### Activity

#### GET api/activity/me
Returns the authenticated citizen's activity history

**Authentication:** Required for Citizen

### Citizen Dashboard

#### GET /api/dashboard-account-card/me
Returns summary account data shown on the citizen's dashboard card.

**Authentication:** Required for Citizen

**Response 200:** Account Summary
**Response 404:** No account found

### Account Management

#### DELETE /api/account

**Authentication:** Required

**Response 204:** Account deleted
**Response 401:** Unauthenticated

#### GET /api/manage-user-account/me
Returns the authenticated user's acc details.

**Authentication:** Required

#### POST /api/manage-user-account/email/verify-password
Verify the user current password before allowing them to update email.

**Authentication:** Required
**Rate Limit:** YES

**Request Body:** 
```json
{
    "password": "string"
}
```

**Response 200:** Password verified
**Response 422:** Incorrect Password
**Response 423:** Account locked

#### POST /api/manage-user-account/email/request-change
Request change of account email address and send OTP to new address.

**Authentication:** Required
**Rate Limit:** YES

**Request Body:**
```json
{
    "newEmail": "string"
}
```

**Response 200:** Verification code sent
**Response 400:** Invalid email
**Response 403:** Re-authentication required
**Response 409:** New email already taken

#### POST /api/manage-user-account/email/resend-otp
Resends the OTP for pending email change.

**Authentication:** Required
**Rate Limit:** YES

**Response 200:** OTP resent
**Response 400:** No pending email change

#### POST /api/manage-user-account/email/confirm
Confirms the pending email change using the OTP.

**Authentication:** Required

**Request Body:**
```json
{
    "otp": "string"
}
```

**Response 200:** Email updated
**Response 400:** No pending change, OTP expired, too many attempts, invalid OTP
**Response 409:** New email taken

#### PUT /api/UpdatePassword
Updates the authenticated user's password

**Authentication:** Required

**Response 200:** Password updated
**Response 400:** Update failed

### Notifications

#### GET /api/notifications/me
Returns the authenticated citizen's notifications.

**Authentication:** Required for Citizen

### Officials

#### POST /api/officials/badge-token
Generate a badge token for an authenticated official

**Authentication:** Required for Officials

**Response 200:** Badge token issued
**Response 404:** Officials not found

#### POST /api/officials/verify-badge
Verifies an official's badge token.

**Authentication:** None

**Request Body:**
```json
{
    { "token": "string" }
}
```

**Response 200:** Badge verified
**Response 400:** Invalid badge token

#### GET /api/officials/activity/me
Returns the authenticated official's own recent activity, most recent first.

**Authentication:** Required for Officials

**Query Parameters:** limit (clamped to 1-20, default 5)

**Response 200:**
```json
{
    "items": [
        {
            "id": "string",
            "eventType": "string",
            "details": "string",
            "createdAt": "date"
        }
    ]
}
```

#### GET /api/officials/history
Returns a paginated, filterable audit history for every official at the caller's own institution. The institution is always resolved server side from the caller's Official record, never accepted as a parameter. Each call is itself audit logged.

**Authentication:** Required for Officials

**Query Parameters:** 
- `search` - matches action, citizen name, performing official's name, or outcome
- `action` - filters to a specific audit event type
- `dateFrom` - inclusive lower bound
- `dateTo` - inclusive upper bound on timestamp
- `type` - filters by outcome, "Success" or "Failed"
- `page` - 1 based page number, clamped to >= 1
- `pageSize` - clamped to 1-100, default 7

**Response 200:**
```json
{
    "items": [
        {
            "id": "string",
            "createdAt": "date",
            "action": "string",
            "citizenName": "string",
            "citizenIdMasked": "string",
            "performedBy": "string",
            "outcome": "string"
        }
    ],
    "page": 0,
    "pageSize": 0,
    "totalCount": 0
}
```
`citizenName` and `citizenIdMasked` are null for audit entries that predate the citizen linkage, or that are not tied to a specific citizen. The unmasked citizen ID is never returned by this endpoint.

### Trusted Devices

#### GET /api/trusted-devices/me
Returns the citizen's list of trusted devices.

**Authentication:** Required for Citizen

#### DELETE /api/trusted-devices/{deviceId}
Unlinks a trusted device from the citizen's account.

**Authentication:** Required for Citizen

**Path Parameter:** `deviceId` - UUID

**Response 204:** Device unlink
**Response 404:** Device not 

### Admin Dashboard

#### GET /api/admin/dashboard-summary
Returns the admin dashboard landing page summary: system status, headline counts, and a system-wide recent activity feed.

**Authentication:** Required for Government Administrator

**Response 200:**
```json
{
    "systemStatus": {
        "operational": true,
        "lastUpdatedAt": "date"
    },
    "counts": {
        "users": 0,
        "institutions": 0,
        "credentialsIssued": 0
    },
    "activityFeed": [
        {
            "id": "string",
            "eventType": "string",
            "details": "string",
            "createdAt": "date"
        }
    ]
}
```
`activityFeed` is restricted to an allow-list of institution/system-level event types (`UserRegistered`, `AccountDeleted`, `CredentialIssued`, `CredentialRevoked`, `EmailAddressChanged`, `InstitutionRegistered`, `OfficialVerified`,) so it never surfaces citizen-level data across institution boundaries. Capped at the 10 most recent, not configurable. `systemStatus.operational` is currently a static `true`, not a real health check.

#### GET /api/admin/analytics
Returns system-wide analytics for the requested data range: verifications, credentials issued, active officials, and active institutions, each with a value, a percentage change against the immediately preceding period of equal length, and a daily bucketed series. Computed live with no pre-aggregation.

**Authentication:** required for Government Admininstrator

**Query Parameter:** range (one of 7d, 30d, 90d. Defaults to 30d if omitted)

**Response 200:**
```json
{
    "verifications": {
        "value": 0,
        "changePct": 0,
        "series": [
            { "date": "date", "count": 0 }
        ]
    },
    "credentialsIssued": { "value": 0, "changePct": 0, "series": [] },
    "activeOfficials": { "value": 0, "changePct": 0, "series": [] },
    "activeInstitutions": { "value": 0, "changePct": 0, "series": [] }
}
```

**Response 400:** Invalid `range` value

### Government Registry Service

#### GET /api/citizens/{saId}
Looks up a citizen's gov-held Id record by SA ID number

**Path Parameter:** `saId` - SA ID number

**Response 200:** Citizen record
**Response 404:** Not found

#### GET /api/credentials/{saId}/identity-document
Returns the gov-held ID doc record for a citizen.

**Response 200:** ID doc data
**Response 404:** Not found

#### GET /api/credentials/{saId}/drivers-license
Return gov-held driver license record for citizen.

**Response 200:** Driver's license data
**Response 404:** Not found

## 5. Deployment

### 5.1 Live System

| Environment | Service | URL |
|---|---|---|
| Production | WEB | https://flashid.co.za |
| Production | Backend API | https://api-flashid-prod-behwhegmcshsb6dg.southafricanorth-01.azurewebsites.net |
| Production | Government Registry API | https://api-government-registry-prod-ajavcaate3e5fecb.southafricanorth-01.azurewebsites.net |
| Development | WEB | https://web-flashid-dev-c5f2gbd8hbcqf8h2.southafricanorth-01.azurewebsites.net |
| Development | Backend API | https://api-flashid-dev-bjgng2dxd6hrgbca.southafricanorth-01.azurewebsites.net |
| Development | Government Registry API | https://api-government-registry-dev-g4hsdee5cre9ghcx.southafricanorth-01.azurewebsites.net |

### 5.2 Environment Parity

FlashID distinguishes two environments: **development** and **production**. Both are deployed automatically via GitHub Actions. For now there is no staging environment due to budget issues.

| | Development | Production |
|---|---|---|
| Trigger branch | `dev` | `main` |
| Web | web-flashid-dev | web-flashid-prod |
| Backend API | api-flashid-dev | api-flashid-prod |
| Government Registry | api-government-registry-dev | api-government-registry-prod |
| Purpose | Integration testing of merged features before release | Demo, Stable Release |

All three services deploy automatically on push to their respective branches. There is no manual deployment step for now. Local development is a third, non-deployable environment. Developers will run the stack `pnpm dev` on web, backend and government-registry concurrently. This is with a local SQL Server instance.

### 5.3 Infrastructure as Code / Containerisation

FlashID's Azure infrastructure (App Services, SQL Server and databases, Cosmos DB, Blob Storage, Key Vault, and their configuration) is defined declaratively using Azure Bicep templates (`infra/main.bicep` and per-resource modules under `infra/modules/`), version-controlled alongside the application code. This replaces what was originally manual Portal provisioning with a reproducible definition of the infrastructure: any change to the templates can be previewed with `az deployment group what-if` before being applied with `az deployment group create`, and the templates converge the environment to match what is declared rather than requiring manual reconfiguration.

The web application is containerised: its Dockerfile defines the build and runtime environment, and GitHub Actions builds and publishes an image to Azure Container Registry on every push, which the corresponding Azure App Service is then pointed at. The two backend APIs (FlashID and Government Registry) are deployed using Azure App Service's Code publishing model, where GitHub Actions runs `dotnet publish` and deploys the build directly, rather than containers. This was a deliberate scope decision made under the project timeline, to reuse already-working infrastructure rather than introduce a new container runtime for both services under time pressure.

Application deployment itself (on every push to `dev`/`main`) continues to run automatically via GitHub Actions with no manual step, independent of the Bicep templates. Infrastructure changes described in Bicep are applied deliberately, by a team member, rather than on every push. This is a scope reduction made to fit the project timeline while still meeting the requirement for the infrastructure to be defined as reproducible code rather than manual Portal configuration.

### 5.4 Secrets Management

Secrets and environment-specific configuration are not committed to the Git repository.

In deployed environments, secrets are Azure App Service application settings, configured outside source control. Most of them are Key Vault references: the setting points at a secret in `kv-flashid-dev` or `kv-flashid-prod`, and the app reads it through its managed identity, so the value never appears in App Service configuration. On the dev API, 11 secrets are served this way, including the JWT signing key and every connection string (checked with the az CLI on 2026-09-29). The QR and credential signing keys are Key Vault keys and never leave the vault. One secret, the email app password, is still a plain application setting and is the next to move.

Local development uses `.NET User Secrets`, local environment variables, and development configuration files excluded from source control. Public configuration templates (`.env.example` files) are included in the repository to document required variable names without real values.

### 5.5 Rollback Strategy

FlashID uses a redeploy-previous-version strategy for rollback, with the specific mechanism depending on how each service is deployed.

For the web application (containerised), every build is pushed to Azure Container Registry tagged with its Git commit SHA. A rollback repoints the affected App Service at the previous tag (`az webapp config container set`) and restarts it. Every previously built image remains available in the registry.

For the two backend APIs (Code publishing), a rollback re-publishes the previous known-good commit: checking out that commit, running `dotnet publish`, and redeploying the resulting build to the affected App Service.

Either path takes a few minutes, with a brief restart window (no deployment slots on the current subscription tier). Where a failure is caused by application code rather than a bad deploy, the responsible commit may also be reverted through a new pull request. Force-pushing or resetting the shared `main` or `dev` branches is not used.

Database schema changes are a known exception: both APIs apply Entity Framework Core migrations automatically on startup, and rolling back the application does not roll back an already-applied migration. A schema-breaking deploy would require a manual, targeted migration rollback in addition to the application rollback described above.

### 5.6 Deployment Diagram
![Deploymnet Diagram](../images/Deployment_diagram.drawio.svg)
### 5.7 CI/CD Pipeline Diagram

![CI/CD Pipeline Diagram](../images/CICDdiagram.svg)

## 6. Non-Functional Requirement (NFR) Testing

Each NFR from SRS-v4 section 5 is listed below with the architectural tactic that addresses it, how it was tested, the target, the measured result and a status. Where a target cannot be met or proven on the current infrastructure, the row says so and gives the reason instead of reporting a pass.

**Infrastructure the results were measured on** (read from Azure with the az CLI on 2026-09-29): one App Service plan, `asp-flashid`, Basic B2 tier with a single instance, shared by all six web apps (web, API and government registry, for both dev and production). Always On is off and no App Service health check path is configured. Performance figures come from the deployed dev API unless the row says otherwise.

**Status key**

| Status | Meaning |
|---|---|
| Pass | Target met; the evidence is named in the row |
| Pass (limited) | Target met, but the evidence has a stated limit (single run, lab measurement or narrower scope) |
| Partial | Part of the requirement is met; the missing part is stated |
| Gap | Cannot be met or proven on the current infrastructure; the reason is stated |
| Not yet tested | The test is designed (see 6.5) but has not been run |

**Summary:** 22 Pass, 5 Pass (limited), 2 Partial, 2 Gap, 3 Not yet tested (34 NFRs).

#### Security

| ID | Requirement | Tactic | Test / tool | Target | Result | Status |
|---|---|---|---|---|---|---|
| NFR1.1 | Protected resources require a valid JWT | JWT bearer authentication with role-based authorisation policies on controllers | xUnit integration: `CredentialControllerIntegrationTests` | 401 without a token, 403 for the wrong role | 6 tests pass, including `ExpiryCheck_Unauthenticated_ReturnsUnauthorized` and `IssueCredential_AsCitizen_ReturnsForbidden` | Pass |
| NFR1.2 | HTTPS with TLS 1.2 or later | `UseHttpsRedirection` sends plain HTTP to HTTPS; `UseHsts` (outside Development) sends `Strict-Transport-Security`; Azure terminates TLS with a 1.2 minimum on every service | xUnit integration: `HttpsEnforcementTests`; az CLI; `curl` | HTTP redirected, HSTS sent, TLS below 1.2 refused | `PlainHttpRequest_IsRedirectedToHttps` and `HttpsResponse_IncludesStrictTransportSecurityHeader` pass. Live Azure config (2026-09-29): HTTPS Only on and minimum TLS 1.2 for the dev API, dev web and production API; minimum TLS 1.2 on SQL (`sql-flashid`), Cosmos DB and both storage accounts. The dev API accepted a TLS 1.2-only connection (`curl --tlsv1.2 --tls-max 1.2`, HTTP 200, 2026-09-28) | Pass |
| NFR1.3 | Passwords hashed with BCrypt, work factor at least 12 | `PasswordHashingProvider` hashes with BCrypt at work factor 12 with a random salt per password; only the hash is stored | xUnit: `PasswordHashingProviderTests` | Work factor >= 12, hash never equals the password | 5 tests pass, including `HashPassword_UsesBcryptWorkFactorOfAtLeast12` (reads the cost from the stored hash) and `HashPassword_CalledTwiceForSamePassword_ProducesDifferentSaltedHashes` | Pass |
| NFR1.4 | OTP on administrative authentication | Emailed OTP on every untrusted device, capped attempts and expiry; skipped only for a device already trusted | xUnit: `AuthServiceTests` | OTP required on every untrusted device | 12 tests pass covering missing, invalid, expired, already-used and max-attempt OTPs | Pass |
| NFR1.5 | Secrets kept in environment variables or GitHub Secrets | Committed `appsettings.json` files hold blank placeholders only; deployed secrets are App Service settings, most of them Key Vault references; CI secrets are GitHub Actions secrets; local `appsettings.Development.json` is git-ignored | xUnit: `ConfigurationSecretsTests`; `git check-ignore`; az CLI | No secret value committed; deployed secrets outside the code | 3 tests pass: both committed `appsettings.json` files contain no value for any Key, ApiKey, Secret, Password, ConnectionString or HmacKey setting, and the 9 known backend secret keys are blank. On the dev API (2026-09-29) 11 secrets, including `Jwt__Key` and every connection string, are Key Vault references. `Email__AppPassword` is a plain App Service setting: still an environment variable, but not yet moved to Key Vault | Pass |
| NFR1.6 | Offline credentials encrypted, bound to the device key, refused without a fresh device signature | Per-device EC P-256 key in secure storage; offline cache encrypted and discarded if tampered with or if the key is missing; each presentation carries an ES256 key-binding JWT (`iat` + `sd_hash`) that the verifier checks | Jest (`device-key`, `key-binding`, `offline-cache`, `verify`, `offline-flow`), Mobile CI run [#122](https://github.com/COS301-SE-2026/South-African-Digital-ID-Wallet/actions/runs/36317467804); device protocol step 5 | Encrypted at rest; stale or foreign signature refused | 35 tests pass, including `never writes the credential in plaintext`, `discards the cache when the key is gone`, `returns BAD_KEY_BINDING_SIGNATURE when another device signed it` and `returns STALE_PRESENTATION for a replayed key binding JWT`. On real phones a screen recording replayed after 2 minutes was rejected (2026-09-25) | Pass |
| NFR1.7 | Account locked for 30 minutes after 5 failed logins | Failed-attempt counter and `LockoutUntil` on the user, checked before the password | xUnit: `AuthServiceTests`, `AuthControllerIntegrationTests` | Locked on the 5th failure; rejected while locked | `LoginAsync_FifthConsecutiveFailure_LocksTheAccountForThirtyMinutes`, `LoginAsync_LockedOutAccount_ThrowsBeforeCheckingThePassword` and `Login_WithALockedAccount_ReturnsUnauthorized` pass | Pass |
| NFR1.8 | QR disclosure token usable exactly once | Single-use `Jti` claim marked through `TryMarkUsedAsync` in Cosmos DB; ES256 signature with the key held in Azure Key Vault | xUnit integration: `QrServiceIntegrationTests` | Second redemption rejected | `ResolveAlreadyUsed_TokenAlreadyUsed_ThrowsInvalidDisclosureTokenException` passes | Pass |
| NFR1.9 | Rate limits on abuse-prone endpoints (registration, issuance, OTP) | ASP.NET Core rate limiter, one-minute fixed windows. Anonymous endpoints are limited per IP address (register 5, resend OTP 3, verify email 5, login 10, verify device 5, password reset 5). Signed-in endpoints are limited per user (issue credential 5, email change OTP 3, and others). Every request also falls under a 300 per minute backstop | xUnit integration: `RateLimitingTests`; k6 `nfr-rate-limit.js` on the dev API, 2026-09-30 | HTTP 429 once the limit is passed | `AbuseProneEndpoint_PastItsLimit_Returns429` passes for register (6th request), resend OTP (4th) and login (11th). On the deployed dev API the 4th resend-OTP request within a minute returned 429 (`nfr-evidence/ nfr-rate-limit-2026-09-30.json`) | Pass |
| NFR1.10 | POPIA erasure on account deletion | Cascading removal of citizen, credential, audit and user records in a fixed order | xUnit: `DeleteAccountServiceTests` | All personal data removed | 5 tests pass, including `DeleteAccountAsync_CallsRepositoryMethodsInExpectedOrder` and `DeleteAccountAsync_CitizenExists_AlsoDeletesAuditLogsUserAndSaves` | Pass |

#### Performance

| ID | Requirement | Tactic | Test / tool | Target | Result | Status |
|---|---|---|---|---|---|---|
| NFR2.1 | Dashboard interactive in under 2 s for 95% of requests | Next.js code-split routing and static asset optimisation | Lighthouse 13.4.1, desktop, one run per page (see 6.1) | < 2 s | Slowest of 19 pages: LCP 1.2 s, FCP 0.5 s, TBT 10 ms. One lab sample per page, not a 95th percentile over real traffic | Pass (limited) |
| NFR2.2 | Authentication in under 2 s for 95% of requests | JWT bearer auth; BCrypt hashing; trusted-device check skips the OTP round trip | k6 `nfr2-2-auth.js` on the dev API, 2026-09-30: 8 logins a minute for 3 minutes, which stays under the NFR1.9 login limit of 10 per minute per IP | p95 < 2 s | p95 1.19 s (median 756 ms); 0 of 24 logins failed (`nfr-evidence/nfr2-2-auth-2026-09-30.json`). Measures latency at a steady low rate, not under heavy load | Pass |
| NFR2.3 | Credential retrieval in under 2 s for 95% of requests | Indexed lookup by UserId and CitizenId | k6 `nfr2-3-credentials-and-qr.js` (up to 5 virtual users for 55 s, one login each) on the dev API, 2026-09-30 | p95 < 2 s | p95 122.73 ms; 0 of 175 requests failed (`nfr-evidence/nfr2-3-credentials-and-qr-2026-09-30.json`) | Pass |
| NFR2.3 | QR generation in under 2 s for 95% of requests | ES256-signed disclosure token; the signing key never leaves Azure Key Vault, so each signature is one Key Vault call | Same k6 run | p95 < 2 s | p95 552.08 ms (median 382 ms). Slower than the earlier in-memory signing (94 ms) because every signature is a Key Vault call: a deliberate trade of latency for key protection, well inside the target | Pass |
| NFR2.4 | QR verification in under 3 s | Single-use `Jti` check plus ES256 signature verification | k6 `nfr2-4-qr-verification.js` (up to 5 virtual users for 55 s, one login each) on the dev API, 2026-09-30 | p95 < 3 s | p95 270.76 ms (median 144.57 ms) over 75 verifications; 0 of 230 requests failed (`nfr-evidence/nfr2-4-qr-verification-2026-09-30.json`) | Pass |
| NFR2.5 | 500 concurrent authenticated users without slower responses | None available on this tier: one B2 instance, no autoscaling | k6 ramp on the dev API | 500 virtual users, p95 still within NFR2.2 and NFR2.3 | [ramp result: the number of users at which p95 passed 2 s]. 500 users was not attempted: one Basic B2 instance, shared by six apps, cannot scale out. Meeting this needs a Standard or Premium plan with autoscale | Gap |
| NFR2.6 | Offline licence presentation scans in under 5 s on the reference phones | Presentation split into an animated multi-frame QR that the verifier reassembles in any order | Manual device test (`docs/demo4/offline-verification/device-test-protocol.md`, step 5), Samsung Galaxy S23 to S24 | < 5 s | About 4.2 s for 28 frames (2026-09-25). One measured run on one phone pair | Pass (limited) |
| NFR2.7 | First request after idle completes in under 5 s | None configured: Always On is off (az CLI, 2026-09-29), so the app can be unloaded when idle | k6 `nfr-cold-start.js`: one login after about 24 min with no traffic, dev API, 2026-09-28 | < 5 s | 1.36 s after idle (warm repeat 0.78 s). A start from a fully stopped App Service took 45.7 s to the first `/health` 200 on the same day; that is a platform restart, covered under NFR3.4 | Pass |

#### Reliability and availability

| ID | Requirement | Tactic | Test / tool | Target | Result | Status |
|---|---|---|---|---|---|---|
| NFR3.1 | 99.9% availability, excluding scheduled maintenance | Managed App Service hosting; `/health` liveness endpoint that stays up when a dependency is misconfigured; `/health/ready` returns 503 when the signing key cannot load | xUnit integration: `HealthEndpointTests`; unit: `CredentialSigningKeyHealthCheckTests`; Azure Monitor metrics | 99.9% | Not measured over time. 3 health tests pass: `/health` returns 200 without login even when the signing key is broken; `/health/ready` returns 200 when the key loads and 503 without leaking detail when it cannot. [30-day dev API figures: total requests and 5xx responses]. Basic B2 carries Microsoft's 99.95% SLA, but there is one instance, no redundancy and no App Service health check path configured, so a hung process is not detected automatically | Gap |
| NFR3.2 | Unexpected errors show a friendly message within 2 s without crashing | Controller catch blocks and `GlobalExceptionHandler` return a generic JSON error; outside Development the exception detail stays in the server log, linked by `traceId` | xUnit: `AuthControllerTests`, `GlobalExceptionHandlerTests` | Friendly 500 in < 2 s; next request still served | `Login_WhenAnUnexpectedErrorOccurs_ReturnsFriendlyErrorWithinTwoSecondsAndKeepsServing` passes, plus handler tests for production and development detail | Pass |
| NFR3.3 | Users carry on once connectivity returns, with no reinstall or data recovery | Offline scans are queued on the device and uploaded when signal returns or the app comes back to the foreground, while a user is signed in | Jest `offline-verification-sync`, Mobile CI run [#122](https://github.com/COS301-SE-2026/South-African-Digital-ID-Wallet/actions/runs/36317467804); device protocol step 7 | Queued data syncs with no user action | 5 tests pass, including `Should upload once signal returns` and `Should not upload while offline`. On real phones the offline scan appeared as an `OfflineCredentialVerified` audit row after reconnecting (2026-09-27). Covers the offline-verification path only | Pass (limited) |
| NFR3.4 | Recovery from a critical service failure within 5 minutes | App Service restarts the process; EF Core migrations and signing key load on startup; `/health/ready` reports when the API can sign again | Restart of the dev API (`az webapp restart`) while polling `/health/ready` (script in 6.5) | < 5 min to ready | [restart result and date]. Supporting measurement: after a full stop, the first `/health` 200 came 45.7 s after start (2026-09-28) | Not yet tested |
| NFR3.5 | Credential and account data stay consistent | EF Core transactional writes; a job-run claim table so only one expiry sweep runs per day; failed sweeps are marked failed, not left half done | xUnit: `CredentialExpiryServiceTests`, `CredentialExpiryRepositoryIntegrationTests`, `DeleteAccountServiceTests` | No partial or duplicate writes | `SaveChangesFails_MarksJobRunFailedInsteadOfThrowingPastTheService`, `TryClaimJobRunAsync_SecondClaimForSameDate_Fails` and `DeleteAccountAsync_CallsRepositoryMethodsInExpectedOrder` pass. These cover the expiry sweep and account deletion, not every write path | Pass (limited) |
| NFR3.6 | Presentation and verification work with no network on either phone | Credential package, trusted issuer keys and signed revocation list cached while online; verification runs on the verifier's phone; trust data older than 7 days is refused | Jest (`offline-flow`, `verify`), Mobile CI run [#122](https://github.com/COS301-SE-2026/South-African-Digital-ID-Wallet/actions/runs/36317467804); device protocol steps 2, 4 and 6 | Verifies with both phones offline | 9 end-to-end flow tests (built, split, scanned out of order, reassembled, verified) and 37 verifier tests pass. On real phones in aeroplane mode the licence verified with its portrait, and a revoked licence was rejected offline (2026-09-24, 2026-09-27) | Pass |
| NFR3.7 | Batch jobs finish in bounded time and can be safely re-run | Daily expiry sweep with keyset pagination; a per-day claim so a second run returns the first result instead of reprocessing; a failed or stale run can be reclaimed | k6 `nfr-expiry-batch-timing.js` on the dev API, 2026-09-30; xUnit: `CredentialExpiryServiceTests`, `CredentialExpiryRepositoryIntegrationTests` | Bounded time; safe to re-run | 619.5 ms at the dev data volume (`nfr-evidence/nfr-expiry-batch-timing-2026-09-30.json`). `AlreadyCompletedToday_ReturnsExistingResultWithoutReprocessing`, `TryClaimJobRunAsync_ReclaimsRowLeftAsFailed` and `TryClaimJobRunAsync_ReclaimsStaleRunningRow` pass | Pass |

#### Usability

| ID | Requirement | Tactic | Test / tool | Target | Result | Status |
|---|---|---|---|---|---|---|
| NFR4.1 | First-time citizen registers, verifies email and reaches the wallet within 5 minutes without help | Short registration form, emailed OTP, direct redirect to the wallet | Timed session with people who had not used FlashID (see 6.4) | < 5 min | [time per person, device, sample size] | Not yet tested |
| NFR4.2 | Frequent tasks within 3 interactions from the dashboard | Sidebar entry for every frequent task; share and update password open in place | Manual interaction count (see 6.2) | <= 3 | All 5 frequent tasks take 3 or fewer on desktop and tablet. On a phone the sidebar sits behind a menu button, which adds one tap | Pass |
| NFR4.3 | WCAG 2.1 AA on public-facing web pages | Semantic HTML, labelled controls, landmark regions | Lighthouse 13.4.1 accessibility audit, desktop (see 6.1.2) | No AA failures | Scores 90 to 96 on all 19 pages, but Lighthouse reports insufficient colour contrast (WCAG 1.4.3, a Level AA criterion) on all 19, unlabelled form controls on one page and a missing `<main>` landmark on four | Partial |
| NFR4.4 | Validation errors describe the problem and how to fix it | Validators throw typed exceptions with specific messages (for example which password rule failed and the allowed special characters); controllers return them as 400 `{ error }` | xUnit: `CitizenRegistrationValidatorTests`, `CitizensControllerTests` | Every rule names the problem and the fix | `Validate_InvalidInput_ReturnsMessageThatNamesTheProblemAndTheFix` (8 cases) and `Register_WithInvalidInput_Returns400WithTheSpecificGuidanceMessage` pass | Pass |
| NFR4.5 | Responsive web interface with no loss of functionality | Tailwind breakpoints; below 1024 px the sidebar becomes a slide-out menu | Playwright `responsive.spec.ts` at 375, 768 and 1440 px (see 6.3) | No sideways scrolling; navigation and main actions work at every width | [results from 6.3] | Not yet tested |

#### Maintainability

| ID | Requirement | Tactic | Test / tool | Target | Result | Status |
|---|---|---|---|---|---|---|
| NFR5.1 | Modular Clean Architecture | Domain, Application, Infrastructure and Presentation layers; dependencies inverted through interfaces registered at the composition root | xUnit: `DependencyInjectionTests` | Every Application interface resolves to its Infrastructure implementation | Passes | Pass |
| NFR5.2 | Code merged to main passes build, lint, formatting and CI checks | GitHub Actions runs build, lint, format and tests on every pull request; branch protection on `main` | GitHub Actions; branch protection settings (`gh api`, 2026-09-29) | A merge cannot happen with failing checks | CI runs on every pull request ([example run](https://github.com/COS301-SE-2026/South-African-Digital-ID-Wallet/actions/runs/33838886255)) and `main` requires 2 approvals. No status checks are marked as required on `main`, so a pull request with failing CI could still be merged by its reviewers [update after the ruleset check] | Partial |
| NFR5.3 | At least 80% unit test coverage on critical business logic | Critical logic lives in the backend Application and Domain layers and the mobile offline-verification library, all covered by unit tests | Coverage measured locally (`dotnet test --coverage`, Jest `--coverage`), 2026-09-29; Codecov | >= 80% line coverage on critical logic | Backend Application 96.5%, Domain 87.1%; mobile `src/lib/offline` 97.2%. Across all code in all four projects Codecov reports 63% [link to Codecov critical-logic component once enabled] | Pass (limited) |
| NFR5.4 | Deploy to production within 30 minutes of merging to main | GitHub Actions deploys to Azure App Service on every push to `main` | GitHub Actions run durations | < 30 min | Production API: last 5 deploys took 2 min 17 s to 8 min 55 s ([latest, 2026-09-23](https://github.com/COS301-SE-2026/South-African-Digital-ID-Wallet/actions/runs/35923611440)). Government registry 5 min 35 s and web 2 min 8 s [add run links] | Pass |
| NFR5.5 | New departments and institutions can be onboarded | Institutions are data, not code: `POST /api/institutions/register` (GovernmentAdministrator only) creates the institution, issues its API key and writes an audit log, with no deployment | xUnit integration: `InstitutionsControllerTests`, `InstitutionServiceTests` | Every institution type onboarded through the API | `RegisterInstitution_ForEveryInstitutionType_OnboardsThroughTheApiWithoutCodeChanges` and `RegisterInstitution_AsCitizen_ReturnsForbidden` pass | Pass |

### 6.1 Lighthouse Audit Detail (supports NFR2.1, NFR4.3)

All runs used Lighthouse 13.4.1, emulated desktop, custom throttling, single page session,
initial page load, one run per page. Raw reports are in `docs/lighthouse-nf-testing/`.

**Production** (`flashid.co.za`)

| Page | Perf | A11y | BP | SEO | FCP | LCP | TBT | CLS | SI |
|---|---|---|---|---|---|---|---|---|---|
| Landing (`/`) | 99 | 96 | 100 | 100 | 0.4 s | 0.9 s | 0 ms | 0.004 | 0.4 s |
| Officials Dashboard (`/officials/officials-dashboard`) | 97 | 96 | 96 | 100 | 0.4 s | 0.9 s | 0 ms | 0.082 | 0.8 s |
| Onboard Citizen (`/officials/onboard-citizen`) | 99 | 96 | 96 | 100 | 0.4 s | 1.0 s | 10 ms | 0 | 0.7 s |
| Issue Driver's Licence (`/officials/issue-drivers-license`) | 99 | 96 | 96 | 100 | 0.4 s | 1.0 s | 0 ms | 0 | 0.4 s |
| Officials Verifications (`/officials/verifications`) | 100 | 93 | 96 | 100 | 0.4 s | 0.8 s | 0 ms | 0.001 | 0.6 s |
| Citizen Dashboard (`/citizen/citizen-dashboard`) | 99 | 96 | 96 | 100 | 0.4 s | 0.9 s | 0 ms | 0.022 | 0.4 s |
| View ID Credential (`/citizen/my-credentials`) | 98 | 95 | 96 | 100 | 0.5 s | 1.1 s | 0 ms | 0 | 0.5 s |
| View Licence Credential (`/citizen/my-credentials`) | 99 | 95 | 96 | 100 | 0.4 s | 1.0 s | 0 ms | 0 | 0.4 s |
| Share ID Credential (`/citizen/my-credentials`)* | 97 | 95 | 96 | 100 | 0.5 s | 1.2 s | 0 ms | 0 | 0.8 s |
| Share Licence Credential (`/citizen/my-credentials`)* | 99 | 95 | 96 | 100 | 0.4 s | 1.0 s | 0 ms | 0 | 0.4 s |
| Citizen Verifications (`/citizen/verifications`) | 96 | 93 | 96 | 100 | 0.5 s | 1.0 s | 0 ms | 0 ms | 0.5 s |
| Verify Identity (`/citizen/verify-identity`) | 99 | 96 | 96 | 100 | 0.4 s | 0.9 s | 0 ms | 0 | 0.4 s |
| Activate Credentials (`/citizen/activate-credentials`) | 99 | 94 | 100 | 100 | 0.4 s | 1.0 s | 0 ms | 0 | 0.4 s |
| Manage Account (`/citizen/manage-user-account`) | 97 | 96 | 100 | 100 | 0.5 s | 1.2 s | 0 ms | 0 | 0.5 s |
| Gov Admin Dashboard (`/gov-admin/gov-admin-dashboard`) | 97 | 96 | 96 | 100 | 0.5 s | 1.2 s | 0 ms | 0 | 1.1 s |
| Upload Institution (`/gov-admin/upload-institution`) | 98 | 90 | 100 | 100 | 0.5 s | 1.1 s | 0 ms | 0 | 0.7 s |
| View Institutions (`/gov-admin/view-institutions`) | 99 | 96 | 100 | 100 | 0.5 s | 1.0 s | 0 ms | 0 | 0.5 s |
| Manage Credentials (`/gov-admin/manage-credentials`) | 99 | 96 | 96 | 100 | 0.4 s | 0.9 s | 0 ms | 0 | 0.6 s |
| Audit Log (`/gov-admin/audit-log`) | 99 | 94 | 96 | 100 | 0.4 s | 0.9 s | 0 ms | 0 | 0.4 s |

\* Lighthouse navigation mode audits the initial page load only, so these two runs measure `/citizen/my-credentials` loading, not the share dialog or QR generation. QR generation latency is covered by k6 under NFR2.3.

#### 6.1.1 Performance findings (NFR2.1)

Across all 19 pages: FCP 0.4 s to 0.5 s, LCP 0.8 s to 1.2 s, TBT 0 ms to 10 ms, CLS 0 to 0.082. Every page is inside the 2 s NFR2.1 budget with roughly a 40% margin on the slowest LCP, and TBT at or near zero means no page blocks the main thread long enough to delay interaction.

The limits of this evidence are stated rather than glossed over:

- Lighthouse reports one simulated lab run per page. NFR2.1 is written as a 95th-percentile claim over real requests, which requires field data (Core Web Vitals / RUM) that the project does not collect. These results are consistent with the target, but do not on their own prove the percentile.
- The three highest Speed Index values (`/gov-admin/gov-admin-dashboard` at 1.1 s, `/citizen/my-credentials` (Share ID run) at 0.8 s, `/officials/officials-dashboard` at 0.8 s) are the data-heavy screens, which is the expected shape.
- `/officials/officials-dashboard` records the highest CLS in the set (0.082). This is inside Google's 0.1 "good" threshold but is the layout-shift outlier, consistent with its live activity feed.

Recurring optimisation opportunities flagged on nearly every page, none of which currently threaten the NFR2.1 target: HTTP/2 or HTTP/3 not in use (est. 270 ms to 570 ms), render-blocking requests (est. 130 ms to 240 ms), legacy JavaScript transpilation (est. 13 KiB), and unused JavaScript (est. 44 KiB to 203 KiB).

#### 6.1.2 Accessibility findings (NFR4.3)

NFR4.3 is **partially met**. Lighthouse scores range from 90 to 96, but a Lighthouse score is not a WCAG conformance level, and three failures remain. The first is a Level AA criterion, so the pages do not yet conform to WCAG 2.1 AA:

| Failure | WCAG criterion | Level | Affected pages |
|---|---|---|---|
| Background and foreground colours lack sufficient contrast | 1.4.3 Contrast (Minimum) | AA | All 19 |
| Form elements do not have associated labels | 1.3.1, 4.1.2 | A | `/gov-admin/upload-institution` |
| Document does not have a `<main>` landmark | 1.3.1 | A | `/officials/verifications`, `/citizen/verifications`, `/citizen/activate-credentials`, `/gov-admin/audit-log` |

The unlabelled form controls on `/gov-admin/upload-institution` are the most serious for a screen reader user, since they cannot tell what each input expects; that page also has the lowest score (90). The contrast failure affects every page, which points to one or two shared colour tokens rather than page-by-page problems.

#### 6.1.3 Other findings

- **Images with incorrect aspect ratio** on 12 of 19 pages, a rendering-quality issue under Best Practices.
- **Security headers on the web app are unverified.** On every page, CSP, HSTS, COOP, X-Frame-Options and Trusted Types appear under Trust and Safety without a pass. These runs audit the Next.js web app. The API now sends HSTS (see NFR1.2), but the web app's own headers have not been added.
- **SEO scored 100 on all 19 pages.** No SRS NFR depends on this; it is recorded for completeness.
- **NFR4.5 (responsive interface) is not covered by this batch**, since all 19 runs emulated a desktop. It is tested separately in 6.3.

### 6.2 Interaction Counts (NFR4.2)

Counted from the citizen dashboard on a desktop or tablet, where the sidebar is always visible. One interaction is one click, tap or form submission; typing into a field is not counted. The ID card is the first credential on My Credentials, so it is already selected when the page opens.

| Frequent task | Path | Interactions | Within 3 |
|---|---|---|---|
| View ID credential | My Credentials | 1 | Yes |
| Share ID credential via QR | My Credentials > Share Credential > Generate QR code | 3 | Yes |
| View verification history | Verifications | 1 | Yes |
| Activate a credential | Activate Credentials > select credential > Activate | 3 | Yes |
| Update password | Manage Account > Update Password > submit the form | 3 | Yes |

On a phone the sidebar sits behind the menu button, so each path takes one more tap. The driver's licence needs one extra tap to select it before viewing or sharing.





### 6.3 Responsive Interface (NFR4.5)

Tested with Playwright (`web/e2e/test/responsive.spec.ts`) at three widths: 375 px (phone), 768 px (tablet) and 1440 px (desktop). At each width the test checks that neither the page nor the portal's content area scrolls sideways, and that the main function of the page still works. For portal pages that means the sidebar link (or, below 1024 px, the menu button and its link) navigates; for the share dialog it means the Generate QR code button can be reached.

The architecture document (`a)
rchitecture-v4.md` commits to desktop and tablet. Phone results are reported here as well, and any phone problem is marked as outside that commitment rather than left out.

| Page | 375 px | 768 px | 1440 px |
|---|---|---|---|
| Landing | [ ] | [ ] | [ ] |
| Login | [ ] | [ ] | [ ] |
| Register | [ ] | [ ] | [ ] |
| Citizen dashboard | [ ] | [ ] | [ ] |
| My Credentials | [ ] | [ ] | [ ] |
| Share credential dialog | [ ] | [ ] | [ ] |
| Citizen verifications | [ ] | [ ] | [ ] |
| Officials dashboard | [ ] | [ ] | [ ] |
| Onboard citizen | [ ] | [ ] | [ ] |
| Gov admin dashboard | [ ] | [ ] | [ ] |

Known observation: below 1024 px the landing page hides its About, Features and Help links and has no menu to replace them. Those sections can still be reached by scrolling, so no function is lost, but the shortcuts are.

### 6.4 First-Time User Timing (NFR4.1)

People who had never used FlashID were asked to register, verify their email and open their wallet, with no help. The timer started when the site opened and stopped when the wallet showed.

| Participant | Device | Time | Where they hesitated |
|---|---|---|---|
| [ ] | [ ] | [ ] | [ ] |

Sample size: [n]. A small sample shows the flow can be completed in time; it does not show what share of all users would manage it.

### 6.5 How to Re-run the Evidence

| NFR | Command | Where |
|---|---|---|
| All xUnit rows | `dotnet test --solution ./backend/FlashIdBackend/FlashIdBackend.sln` | Repository root |
| NFR1.6, 3.3, 3.6 | `pnpm test` | `mobile/` |
| NFR4.5 | `pnpm exec playwright test e2e/test/responsive.spec.ts` (backend running locally) | `web/` |
| k6 rows | `k6 run --summary-export docs/demo4/nfr-evidence/<script>-<date>.json backend/FlashIdBackend/k6/<script>.js` | Repository root |
| NFR5.3 | `dotnet test --solution ./backend/FlashIdBackend/FlashIdBackend.sln --coverage --coverage-output-format cobertura` | Repository root |

Saved k6 results are in `docs/demo4/nfr-evidence/`.
