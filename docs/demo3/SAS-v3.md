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

 **[architecture-v2.md](../demo3/architecture-v3.md)**

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

In deployed environments, secrets are stored directly as Azure App Service Application Settings, configured outside of source control. `infra/main.bicep` additionally models an Azure Key Vault based secrets architecture (`kv-flashid-dev` / `kv-flashid-prod`, RBAC-authorised, referenced via managed identity) as the target design for secrets management, with `infra/seed-secrets.sh` provided to seed it. This is defined and validated but not yet the live mechanism serving the deployed applications, and represents a documented next step beyond the current project timeline.

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

Every quantified NFR from the SRS is mapped below to the architectural tactic claimed to satisfy it and the test that verifies that claim. Where a target could not be honestlty validated on the current infrastructure (Azure App Service Free/Basic tier 1), that is stated explicitly rather than reported as a pass.

| ID | Quantified requirement | Tactic in SAS | Test / tool | Target /  actual |
|---|---|---|---|---|
| NFR1.8 | Rate limiting on abuse-prone endpoints | ASP.NET Core rate limiting middleware, per-user partitioned policies | k6 | 429 past configured limit /  429 confirmed on request #4 |
| NFR2.2 | Auth ops <2s for 95% of requests | JWT bearer auth, BCrypt password hashing, trusted-device check to skip OTP round-trip | k6 | <2000 ms /  1.62 s |
| NFR2.3 | Credential retrieval <2s for 95% of requests | Indexed lookup via UserId/ CitizenId | k6 | <2000 ms /  508 ms |
| NFR2.3 | QR generation <2s for 95% of requests | Ed25519-signed disclosure token generation | k6 | <2000 ms /  94 ms |
| NFR2.4 | QR verification <3s | Single-use Jti claim (`TryMarkUsedAsync`) + Ed25519 signature verification | k6 | <3000 ms /  435.55 ms |
| NFR2.5 | 500 concurrent authenticated users, no degradation | - | k6 | 500 VUs /  **not attainable on current Basic tier** - requires Standard/ Premium plan with autoscaling |
| NFR2.6 | Cold-start latency <5s after idle | None - Free/ Basic tier has no "Always On"/ warm-up strategy configured | k6 | <5000 ms /  **not yet validated**, 667 ms measured while still warm |
| NFR3.6 | Expiry-check batch completes within bounded time at current volume | Idempotent daily sweep, single-flight 409 guard | k6 | documented, no hard target / 366 ms at ~150 citizens |
| NFR5.2 | CI passes build/lint/tests on main | GitHub Actions quality gates | Actions history | pass required / **pending** - grab a green `backend.yml` run link |
| NFR5.3 | >=80% unit test coverage on critical logic | - | Codecov | >=80% / 78% - **fail**, 2pts short |
| NFR5.4 | Deploy within 30 min of merge to main | GitHub Actions -> Azure Web Apps deploy | Actions run duration | <30 min / 5m36s (api-flashid), 5m35s (gov-registry), 2m8s (web) - **pass** |
