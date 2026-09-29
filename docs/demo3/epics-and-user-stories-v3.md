# Epics and User Stories — FlashID
**Tech Titans · COS 301 Capstone 2026**

> This document contains all epics and user stories for the FlashID system, including acceptance criteria and definition of done for each story.
> See [SRS](./SRS-v3.md) for the full Software Requirements Specification.

---
## 3.2 Epics and User Stories

---

## 3.2.1 Epic 1: Identity Onboarding & Citizen Registration

---

#### US-1.1
As a Home Affairs official, I want to retrieve a citizen's verified identity record from the government registry, so that I can onboard them into FlashID using authoritative data.

**Acceptance Criteria:**
- Official can search for a citizen by SA ID number
- System queries the MockGov registry and returns the identity record if found
- System displays the citizen's full name, date of birth, and address from the registry
- System shows a clear error if the SA ID is not found in the registry
- Official cannot proceed with onboarding until a Verified record is retrieved

**Definition of Done:**
- Identity retrieval queries MockGov registry and returns authoritative data
- All onboarding events are written to the audit log
- Duplicate SA ID numbers are rejected

---
#### US-1.2
As a Home Affairs official, I want to capture a citizen's explicit consent before creating their FlashID account, so that their data is processed lawfully under POPIA Section 11.

**Acceptance Criteria:**
- POPIA Section 11 notice is displayed to the official before consent is recorded
- Official must actively confirm consent — it cannot be pre-checked
- Consent record includes the official's ID, citizen's SA ID, and a precise timestamp
- System prevents onboarding from proceeding if consent has not been recorded
- Consent record is stored permanently and cannot be edited or deleted

**Definition of Done:**
- Explicit POPIA consent is captured and stored with timestamp
- Consent event is written to the audit log

---
#### US-1.3
As a Home Affairs official, I want to capture a citizen's contact details (phone and/or email) during onboarding, so that the citizen can receive their activation link and future notifications.

**Acceptance Criteria:**
- Official can enter a phone number and/or email address for the citizen
- Phone number is validated as a valid South African format
- Email is validated against standard email format rules
- System rejects an email that is already registered to another account
- Contact details are saved to the citizen record before the activation code is generated

**Definition of Done:**
- Contact details saved and associated with the citizen record
- Duplicate email addresses are rejected

---
#### US-1.4
As a Home Affairs official, I want to send an activation link or OTP to the citizen after onboarding, so that the citizen can securely activate their wallet at their own convenience before the activation code expires.

**Acceptance Criteria:**
- System generates a unique activation code after contact details are captured
- Activation code is sent to the citizen's captured phone and/or email
- Activation code expires after 7 days
- Official sees a confirmation that the code was successfully dispatched
- Dispatching the activation code is logged to the audit trail

**Definition of Done:**
- Activation code generation and dispatch works end-to-end
- Expired codes are rejected on activation attempt

---
#### US-1.5
As a citizen, I want to register on FlashID using my physical ID document and a selfie, so that I can activate my digital wallet without visiting a Home Affairs office.

**Acceptance Criteria:**
- Citizen can upload or capture an image of their SA ID document
- Citizen can take a selfie via the app for liveness verification
- System performs a liveness check (Azure Face API mock for Demo 1)
- System validates the ID document against the MockGov registry
- Citizen account is created on successful identity verification
- Registration is blocked if liveness check fails or ID is not found in the registry

**Definition of Done:**
- Self-registration liveness check integrated (mock for Demo 1)
- Identity matched against MockGov before account creation

---
#### US-1.6
As a citizen, I want to provide explicit consent before my identity data is processed during registration by physical ID (photo of back and front of the ID and the citizen's face), so that I understand and agree to how my personal information will be used.

**Acceptance Criteria:**
- POPIA consent notice is displayed before any identity data is processed
- Citizen must actively check the consent checkbox — it cannot be pre-checked
- Consent timestamp is stored with the citizen record
- Registration cannot proceed without consent being recorded

**Definition of Done:**
- Consent captured and stored with timestamp before any data processing
- Consent event written to audit log

---
#### US-1.7
As a citizen, I want to receive feedback when my identity verification fails during registration, so that I know what went wrong and can take corrective action.

**Acceptance Criteria:**
- System displays a specific reason for failure (e.g. ID not found, liveness check failed, document unclear)
- Error message is written in plain language and suggests a corrective action
- Citizen is offered an option to retry or contact Home Affairs
- Failed verification attempts are logged to the audit trail

**Definition of Done:**
- All failure paths return a descriptive, actionable error message
- Failed attempts are logged

---
#### US-1.8
As a citizen, I want to set up biometric authentication (fingerprint or face) when activating my wallet, so that I can log in securely without typing a password each time.

**Acceptance Criteria:**
- Citizen is offered the option to enable fingerprint authentication during activation
- Citizen is offered the option to enable facial recognition during activation
- Biometric setup is optional and can be skipped
- Device hardware-backed biometric is used — biometric data is never sent to the server
- Biometric can also be set up from account settings after activation

**Definition of Done:**
- Biometric login works on mobile via device hardware-backed authentication

---
#### US-1.9
As a citizen, I want to provide explicit consent before my identity data is processed during registration with an activation code, so that I understand and agree to how my personal information will be used.

**Acceptance Criteria:**
- POPIA consent notice is displayed before the activation code flow begins
- Citizen must actively accept consent before proceeding
- Consent timestamp is stored with the citizen record
- Activation cannot proceed without consent being recorded

**Definition of Done:**
- Consent captured and stored for activation code registration path
- Consent event written to audit log

---
#### US-1.10
As a citizen, I want to request a new activation link if mine has expired, so that I am not permanently locked out of activating my account.

**Acceptance Criteria:**
- Citizen can request a new activation code if the current one has expired
- Issuing a new code immediately invalidates all previous codes for that account
- Resend requests are rate-limited to prevent abuse
- New code is sent to the contact details already on file for the citizen

**Definition of Done:**
- Resend flow works end-to-end
- Previous codes invalidated on resend

---
## 3.2.2 Epic 2: Authentication & Role-Based Access Control (RBAC)

---

#### US-2.1
As a citizen, I want to log into my account and see the citizen portal, so that I have no access to another user's portal.

**Acceptance Criteria:**
- Citizen can log in using email/username and password
- JWT is issued with role claim = citizen on successful login
- Citizen is redirected to the citizen portal after login
- Citizen cannot access the official or government administrator portal
- Attempting to access a restricted portal returns an unauthorised error

**Definition of Done:**
- JWT issued with correct role claims for all three actor types
- Role-based routing enforced
- Session expires after configured inactivity period

---
#### US-2.2
As a citizen, I want to be able to register with a username, ID, and password, so that my account can be uniquely identified.

**Acceptance Criteria:**
- Citizen can register providing their SA ID number, chosen username, and password
- SA ID must be exactly 13 digits
- Username must be at least 8 characters with no spaces
- Password must meet complexity requirements (min 10 chars, uppercase, lowercase, digit, special character)
- System rejects registration if the SA ID is already activated
- System rejects registration if the username is already taken

**Definition of Done:**
- Registration validates all input fields before creating records
- Duplicate SA ID numbers and usernames are rejected

---
## 3.2.3 Epic 3: Institution Registration & API Key Management

---

#### US-3.1
As a government administrator, I want to register an institution (bank, hospital, police station, insurance agency) with the system, so that verified institutions can integrate with FlashID and perform credential verification.

**Acceptance Criteria:**
- Admin can select institution type from a predefined list
- Admin enters institution name and verification number
- System validates the verification number format for the selected institution type
- System rejects registration if the verification number already exists
- A cryptographically secure API key is generated on successful registration
- API key is displayed exactly once and is never retrievable again
- Only the SHA-256 hash of the key is stored in the database
- Registration is logged to the audit trail with the admin's ID and timestamp

**Definition of Done:**
- Institution record created with type, verification number, and status
- API key generated, displayed once, hash stored — never plaintext

---
#### US-3.2
As a government administrator, I want to view all registered institutions and their status, so that I can manage which institutions are authorised to access the system.

**Acceptance Criteria:**
- Admin can view a list of all registered institutions
- List displays institution name, type, status, and registration date
- Admin can filter by institution type and status
- Admin can view full institution details
- Deactivated institutions are visually distinct from active ones

**Definition of Done:**
- Institution list loads with all required fields and filtering works

---
#### US-3.3
As a government administrator, I want to regenerate an institution's API key, so that I can revoke access if a key is compromised without removing the institution.

**Acceptance Criteria:**
- Admin can trigger API key regeneration for any institution
- Previous key is immediately invalidated on regeneration
- New key is displayed exactly once and is never retrievable again
- Key regeneration is logged to the audit trail with the admin's ID and timestamp
- Institution's other details are unchanged by key regeneration

**Definition of Done:**
- Key regeneration immediately invalidates the previous key
- Regeneration event logged to audit trail

---
#### US-3.4
As a government administrator, I want to view and search for institutions that have been registered by institution name, institution type, institution verification number, or the government admin that registered the institution.

**Acceptance Criteria:**
- Admin can search by institution name (partial match supported)
- Admin can filter by institution type
- Admin can search by verification number (exact match)
- Admin can filter by the government admin who registered the institution
- Empty state shown when no results match the search criteria

**Definition of Done:**
- All four search/filter dimensions work correctly

---
## 3.2.4 Epic 4: Digital Credential Issuance

---

#### US-4.1
As an Official, I want to issue a digital National ID credential/Driver's License to a registered citizen, so that the citizen can use their digital credential for secure identity verification.

**Acceptance Criteria:**
- Official can search for a citizen by SA ID number before issuing
- Identity fields are sourced from the Government registry.
- System blocks issuance if an active National ID credential/Driver's License already exists for the citizen
- Credential is signed with Ed25519 at the point of issuance
- Citizen wallet is updated immediately after issuance
- Issuance is logged to the audit trail

**Definition of Done:**
- Credential created and signed with Ed25519 before being stored
- Duplicate active credentials of the same type per citizen are blocked

---
#### US-4.2
As an Official, I want to search for a citizen by SA ID number before issuing a credential, so that I can confirm I am issuing to the correct person.

**Acceptance Criteria:**
- Search supports full SA ID number
- Results display citizen name, SA ID, and account activation status
- Official sees a clear error if no matching citizen is found or the citizen is not activated
- Official must explicitly confirm the correct citizen before proceeding to issuance

**Definition of Done:**
- Search returns accurate results by SA ID

---
#### US-4.3
As a registered institution, I want to submit a credential issuance request via the API after a citizen passes their driving test, so that the citizen's digital driver's licence is automatically issued to their wallet.

**Acceptance Criteria:**
- Institution authenticates with a valid API key before any request is processed
- API accepts issuance request with citizen SA ID and required credential fields
- System validates the institution is authorised to issue the requested credential type
- Credential is created and signed on a successful request
- API returns 201 Created with the new credential ID
- Citizen wallet is updated immediately

**Definition of Done:**
- Institution API key validated before any API-initiated issuance
- Credential signed and issued correctly via API

---
#### US-4.4
As a citizen, I want to receive a push notification when a new credential is issued to my wallet, so that I am aware of all credentials issued in my name.

**Acceptance Criteria:**
- Push notification is sent to the citizen's device on credential issuance
- Notification clearly identifies the credential type that was issued
- Notification deep-links to the wallet view for that credential
- Notification is sent regardless of whether issuance was admin-initiated or API-initiated

**Definition of Done:**
- Push notification sent to citizen on successful issuance for all issuance paths

---
## 3.2.5 Epic 5: Credential Wallet & Viewing

---

#### US-5.1
As a citizen, I want to view all credentials stored in my digital wallet, so that I can see what digital documents I have and their current status.

**Acceptance Criteria:**
- Wallet displays all issued credentials with credential type, name, SA ID, issue date, expiry date, and status
- Status badge is colour-coded: green (Active), amber (Expired), red (Revoked)
- A helpful empty state is shown when no credentials have been issued
- The list updates in real time when a new credential is issued

**Definition of Done:**
- Credential list shows all six required fields per credential
- Status badge correctly reflects current credential status

---
#### US-5.2
As a citizen, I want to view the full details of an individual credential, so that I can confirm the information on my digital document is correct.

**Acceptance Criteria:**
- Full detail view requires biometric or PIN re-authentication before opening
- Detail view shows all credential fields, issuing authority, issue date, and expiry date
- Current status is clearly displayed
- Citizen can navigate back to the credential list

**Definition of Done:**
- Detail view secured behind biometric or PIN re-authentication
- All credential fields rendered correctly for National ID and Driver's Licence

---
#### US-5.3
As a citizen, I want to access my stored credentials when I have no internet connection, so that I can still present my identity in areas with poor connectivity.

**Acceptance Criteria:**
- Credentials are cached in encrypted local storage on the device
- An offline indicator is shown when the device has no internet connectivity
- Cached credentials are accessible without internet
- Cache is updated automatically when the device reconnects

**Definition of Done:**
- Offline access loads from encrypted local cache with an offline indicator

---
## 3.2.6 Epic 6: QR Code Generation & Selective Disclosure

---

#### US-6.1
As a citizen, I want to generate a one-time QR code for a selected credential, so that an official can verify my identity without seeing my raw personal data.

**Acceptance Criteria:**
- Citizen selects a credential to generate a QR code from
- QR payload is a signed JWT with a credential reference token — zero raw PII
- QR is displayed with a live expiry countdown timer
- One-time use is enforced — scanning the same QR twice returns INVALID on the second scan
- QR cannot be generated from a credential with status Expired or Revoked

**Definition of Done:**
- QR payload contains only a credential reference token — zero raw PII
- One-time use enforced

---
#### US-6.2
As a citizen, I want to see a clear expiry countdown and be notified when my QR code expires, so that I know when to regenerate it during a verification interaction.

**Acceptance Criteria:**
- Countdown timer is visible on the QR screen from the moment of generation
- A visual warning is shown when less than 60 seconds remain
- QR is visually replaced with an expired state when the timer reaches zero
- An expired QR returns INVALID with reason qr_expired on scan
- Citizen can generate a new QR immediately after expiry

**Definition of Done:**
- QR expires after configurable period with live countdown timer
- Expired QR visually replaced and returns INVALID on scan

---
#### US-6.3
As a citizen, I want to choose which fields from my credential are disclosed when I generate a QR code, so that I share only the minimum personal information needed for each verification.

**Acceptance Criteria:**
- Citizen can toggle optional credential fields on or off before generating the QR
- Mandatory minimum fields (e.g. name, ID number) cannot be deselected
- The QR payload reflects only the fields the citizen has selected to disclose
- Verifier receives only the disclosed fields when scanning

**Definition of Done:**
- Selective disclosure enforces mandatory minimum fields

---
#### US-6.4
As a citizen, I want to see exactly which of my fields will be visible to the verifier before confirming QR generation, so that I can make an informed disclosure decision.

**Acceptance Criteria:**
- A preview screen is shown before the QR is generated listing every field that will be disclosed
- Citizen must confirm the preview before the QR is generated
- A cancel option returns the citizen to the field selection screen
- Preview accurately reflects the exact fields the verifier will receive

**Definition of Done:**
- Pre-generation preview screen lists all fields that will be disclosed

---
#### US-6.5
As a citizen, I want to save my preferred disclosure settings per credential type, so that I don't have to manually select fields every time I generate a QR code.

**Acceptance Criteria:**
- Citizen can save the current field selection as default for a given credential type
- Saved preferences are applied automatically on next QR generation for that credential type
- Citizen can modify or clear saved preferences at any time

**Definition of Done:**
- Saved disclosure preferences applied automatically on next QR generation

---
#### US-6.6
As a citizen, I want to save my preferred disclosure settings per verifier type (hospital, police, home affairs, DLTC), so that I don't have to manually select fields every time I generate a QR code.

**Acceptance Criteria:**
- Citizen can save different disclosure settings for each verifier type
- System applies the correct preference when the citizen selects a verifier context
- Citizen can modify preferences per verifier type independently
- If no preference is saved for a verifier type, the default credential type preference is used

**Definition of Done:**
- Per-verifier-type disclosure preferences saved and applied correctly

---
## 3.2.7 Epic 7: Cryptographic Security & Key Management

---

#### US-7.1
As a government administrator, issuing a credential must result in it being signed with Ed25519 at the point of issuance, so that any tampering is mathematically detectable.

**Acceptance Criteria:**
- Every credential has an Ed25519 signature stored at the point of issuance
- The signature covers all credential fields
- Private key is stored in Azure Key Vault (LocalSigningStrategy for Demo 1)
- The private key is never stored in the application database
- Signing failure prevents the credential from being saved

**Definition of Done:**
- Every credential has an Ed25519 signature stored at issuance
- Private keys never stored in the database

---
#### US-7.2
As a registered institution, an API key credential must be cryptographically signed on creation, so that the authenticity and integrity of the API key is guaranteed.

**Acceptance Criteria:**
- API keys are generated as cryptographically signed JWTs
- Signing is always performed server-side
- Only the SHA-256 hash of the signed JWT is stored in the database
- A compromised key can be invalidated by regeneration without affecting the institution record

**Definition of Done:**
- API keys generated as signed JWTs with hash-only storage

---
#### US-7.3
As an official, the system must perform a live signature verification on every QR scan, so that I can trust the result is based on the current state of the credential.

**Acceptance Criteria:**
- Signature verification is performed on every QR scan — results are never cached
- A credential whose fields have been tampered with fails signature verification
- Tampered credentials return INVALID with reason tampered
- Verification result is returned within 2 seconds including the signature check

**Definition of Done:**
- Signature verification runs on every QR scan via live backend call

---
#### US-7.4
As a government administrator, a credential must be re-signed after every update, so that the updated credential carries a fresh, valid signature.

**Acceptance Criteria:**
- Every credential update triggers a fresh Ed25519 signature
- The previous version of the credential is archived before the update is applied
- The new signature is timestamped with the time of the update
- Update and re-signing fail atomically

**Definition of Done:**
- Credential re-signed after every update; previous version archived for audit

---
## 3.2.8 Epic 8: Credential Verification

---

#### US-8.1
As an official, I want to scan a citizen's QR code to verify their credential in real time, so that I can confirm their identity instantly without requiring a physical document.

**Acceptance Criteria:**
- Official can scan a QR code using the device camera
- Verification result is returned within 2 seconds of scanning
- Result clearly shows VALID or INVALID
- No citizen PII is included in the verification response
- Every scan attempt is logged to the audit trail regardless of result

**Definition of Done:**
- Verification result returned within 2 seconds
- No citizen PII included in verification response
- Every scan attempt logged

---
#### US-8.2
As an official, I want to manually enter a credential token when QR scanning is not possible, so that I can still verify credentials if the camera is unavailable.

**Acceptance Criteria:**
- Official can type or paste a credential token as an alternative to scanning
- The same verification logic applies to manual entry as to QR scanning
- Token input is validated for format before the verification request is submitted
- Manual entry attempts are logged to the audit trail

**Definition of Done:**
- Manual token entry produces the same verification result as QR scanning

---
#### US-8.3
As an official, I want to see a clear VALID or INVALID result with the reason for failure, so that I can take the correct action and inform the citizen appropriately.

**Acceptance Criteria:**
- VALID result shows a green indicator with credential type and verification timestamp
- INVALID result shows a red indicator with one of four reasons: revoked, expired, qr_expired, tampered
- Each failure reason has a plain-language description
- Attempting to scan the same QR twice returns INVALID with reason already_used

**Definition of Done:**
- All four failure reasons produce distinct, actionable messages

---
#### US-8.4
As an official, I want to request additional credential fields from a citizen during verification, so that I can access information needed for my specific use case beyond the default disclosure.

**Acceptance Criteria:**
- Official can select specific additional fields to request after an initial VALID result
- Request is sent to the citizen in real time via push notification
- Official's view shows a pending state while awaiting citizen approval
- Request times out after a configurable period if the citizen does not respond

**Definition of Done:**
- Additional disclosure request sent to citizen in real time

---
#### US-8.5
As a citizen, I want to approve or deny an official's request for additional credential information, so that I remain in control of what personal data I share during verification.

**Acceptance Criteria:**
- Citizen receives a real-time push notification describing the request
- Citizen can approve or deny each requested field individually
- Official receives only the fields the citizen approved
- A denial returns a not_disclosed indicator to the official for denied fields
- The disclosure decision is logged to the audit trail

**Definition of Done:**
- Additional disclosure requires citizen real-time approval before any extra fields are shared
- Disclosure decision logged to audit trail

---
## 3.2.9 Epic 9: Credential Lifecycle Management

---

#### US-9.1
As a citizen, I want my digital credential to automatically update when my ID details change, so that my digital credential remains accurate and legally valid at all times.

**Acceptance Criteria:**
- When authoritative source data changes, the credential is updated automatically
- Updated credential is re-signed with a fresh Ed25519 signature after every change
- The previous version of the credential is archived before the update is applied
- Citizen is notified when their credential is updated

**Definition of Done:**
- Credential updates trigger re-signing and version archiving
- Citizen notified on update

---
#### US-9.2
As a registered institution, I want the system to update the credential via the API when relevant information changes, so that citizen credentials reflect up-to-date, authoritative data.

**Acceptance Criteria:**
- Institution authenticates with a valid API key before submitting an update
- Institution can only update credential fields within its authorised scope
- Update triggers a re-signing of the credential
- Update is logged to the audit trail

**Definition of Done:**
- Institution can only update fields within its authorised scope
- Update triggers re-signing and is logged

---
#### US-9.3
As a citizen, I want the system to automatically update the status of my driver's license credential to Expired once it reaches its expiry date, so that expired credentials can no longer be used for verification.

**Acceptance Criteria:**
- A background job runs daily at 00:00 SAST to check expiry dates on Active driver's license credentials
- Credentials past their expiry date are set to status Expired
- Qr verification returns INVALID with reason expired immediately after status update
- Expiry update is logged as a system event
- Citizen is notified in-app when their credential expires
- If the daily run is missed (e.g. the service was down at midnight), the check runs automatically on the next service startup

**Definition of Done:**
- Automatic expiry job runs on schedule (with startup catch-up) and updates all due driver's license credentials
- Citizen receives an in-app notification on expiry

---
#### US-9.4
As the government admin, I want the system to send advance expiry warning notifications to citizens before their credential expires, so that citizens can take action before losing access to a valid credential.

**Acceptance Criteria:**
- A notification is sent to the citizen 30 days before credential expiry
- A second notification is sent 7 days before credential expiry
- Notifications are sent to the citizen's registered email and phone number
- Notifications clearly state the credential type and exact expiry date

**Definition of Done:**
- Expiry warning notifications sent at 30 days and 7 days before expiry

---
#### US-9.5
As a government administrator, I want to revoke a citizen's credential due to fraud, forgery, or investigation, so that the compromised credential is immediately invalidated and can no longer be used for verification.

**Acceptance Criteria:**
- Admin must provide a mandatory revocation reason before revocation is processed
- Revocation takes effect immediately — QR codes return INVALID on the next scan
- No grace period or caching delay is permitted after revocation
- Revocation is logged to the audit trail with the admin's ID, reason, and timestamp
- Citizen is notified of the revocation

**Definition of Done:**
- Revocation takes effect immediately
- Revocation reason mandatory and logged
- Citizen notified on revocation

---
#### US-9.6
As a government administrator, I want to place a credential Under Investigation as a temporary status, so that I can flag suspicious activity without permanently revoking a credential before an investigation concludes.

**Acceptance Criteria:**
- Admin can set a credential status to Under Investigation
- A credential with status Under Investigation returns INVALID on QR verification
- Admin can lift the investigation status and restore to Active, or proceed to full revocation
- Status change is logged to the audit trail
- Citizen is notified when their credential is placed under investigation

**Definition of Done:**
- Under Investigation status prevents VALID verification result
- Admin can transition from Under Investigation to Active or Revoked

---
## 3.2.10 Epic 10: Audit Logging & POPIA Compliance

---

#### US-10.1
As a government administrator, I want the registering of an institution to be logged to the audit trail, so that there is a traceable record of every institution onboarded into the system.

**Acceptance Criteria:**
- A log entry is created for every institution registration attempt
- Log entry includes the admin's ID, institution name, institution type, and timestamp
- Log entry is written atomically with the institution record
- Log entry cannot be edited or deleted

**Definition of Done:**
- Audit log entries are append-only
- All covered event types produce a log entry with actor ID, role, event type, and timestamp

---
#### US-10.2
As a Home Affairs official, I want a citizen's consent to be captured and logged with timestamp and official ID, so that there is a verifiable record of consent for POPIA compliance.

**Acceptance Criteria:**
- A log entry is created when consent is captured for a citizen
- Log entry includes the official's ID, citizen's SA ID, and a precise timestamp
- Log entry is immutable
- Consent log is retained indefinitely, including after account deletion

**Definition of Done:**
- Consent events logged immutably with official ID and timestamp

---
#### US-10.3
As a citizen, changing my password must be logged to the audit trail, so that any security-relevant account changes are traceable.

**Acceptance Criteria:**
- A log entry is created for every successful password change
- Log entry includes the citizen's user ID, event type PasswordChanged, and timestamp
- Log entry does not include the old or new password values
- Log entry is immutable

**Definition of Done:**
- Password change events logged without exposing password values

---
#### US-10.4
As the government administrator, I want every verification attempt to be logged regardless of result, so that there is a complete record of all credential verification events.

**Acceptance Criteria:**
- A log entry is created for every verification scan, whether VALID or INVALID
- Log entry includes the official's ID, credential reference, result, failure reason, and timestamp
- Log entry is written synchronously with the verification response
- Log entry is immutable

**Definition of Done:**
- Every verification attempt logged regardless of result

---
#### US-10.5
As a government administrator, every revocation must be logged with reason, admin ID, and timestamp, so that there is a fully accountable record of every credential revocation.

**Acceptance Criteria:**
- A log entry is created for every credential revocation
- Log entry includes the admin's ID, credential ID, citizen's ID, revocation reason, and timestamp
- Log entry is written atomically with the revocation
- Log entry is immutable

**Definition of Done:**
- All revocation events logged atomically with mandatory reason, admin ID, and timestamp

---
## 3.2.11 Epic 11: Account Management & Device Security

---

#### US-11.1
As a citizen, I want to change my password from account settings, so that I can keep my account secure if I believe my credentials have been compromised.

**Acceptance Criteria:**
- Citizen must enter their current password before a new one is accepted
- New password must meet complexity requirements (min 10 chars, uppercase, lowercase, digit, special char)
- All active sessions except the current one are invalidated after the change
- A confirmation notification is sent to the citizen's registered email and phone
- Password change is logged to the audit trail

**Definition of Done:**
- Password change validates current password, enforces complexity, invalidates other sessions

---
#### US-11.2
As a citizen, I want to reset my forgotten password via email or phone, so that I can regain access to my wallet without contacting support.

**Acceptance Criteria:**
- Citizen can request a reset using their registered email or phone number
- Reset link or OTP expires after 15 minutes
- New password must meet complexity requirements
- Account is temporarily locked after 3 consecutive failed reset attempts
- Password reset is logged to the audit trail

**Definition of Done:**
- Password reset flow works end-to-end with expiry and rate limiting

---
#### US-11.3
As a citizen, I want to update my contact details (email and phone number), so that notifications and security alerts are sent to my current contact information.

**Acceptance Criteria:**
- Citizen must verify ownership of the new email or phone via OTP before the change takes effect
- Previous contact details remain active until OTP verification succeeds
- Contact detail change is logged to the audit trail
- Citizen receives a notification on both the old and new contact details confirming the change

**Definition of Done:**
- Contact detail changes require OTP verification before taking effect

---
#### US-11.4
As a citizen, I want to delete my FlashID account, so that I can exercise my right to erasure under POPIA if I no longer wish to use the service.

**Acceptance Criteria:**
- Citizen must confirm account deletion with password authentication
- Account is soft-deleted — not immediately purged from the database
- A 90-day POPIA data retention period is enforced before hard deletion
- Audit log entries are retained indefinitely even after account deletion
- Citizen receives a confirmation notification

**Definition of Done:**
- Account deletion triggers soft-delete with 90-day POPIA retention period
- Audit logs retained indefinitely after deletion

---
#### US-11.5
As a citizen, I want to view all devices that are currently trusted to access my FlashID wallet, so that I can identify any devices I no longer authorise.

**Acceptance Criteria:**
- Citizen can view a list of all trusted devices showing device type, name, and last active date
- The current device is clearly highlighted in the list
- List is ordered by most recently active

**Definition of Done:**
- Trusted device list shows all required fields and highlights current device

---
#### US-11.6
As a citizen, I want to mark a device as lost or stolen to immediately revoke its access to my wallet, so that my credentials cannot be accessed from a compromised device.

**Acceptance Criteria:**
- All active sessions on the revoked device are immediately invalidated
- Device is removed from the trusted devices list
- Citizen cannot undo a device revocation — the device must re-authenticate from scratch
- Device revocation is logged to the audit trail

**Definition of Done:**
- Lost/stolen device revocation immediately invalidates all sessions on that device

---
#### US-11.7
As a citizen, I want to set up a duress PIN that opens a restricted safe-mode view of my wallet, so that I can protect my real credentials if I am ever forced to unlock the app under coercion.

**Acceptance Criteria:**
- Duress PIN must be different from the citizen's normal PIN
- Duress PIN is stored as a hash — never in plaintext
- Entering the duress PIN opens a safe-mode wallet with only non-sensitive placeholder credentials
- Real credentials are completely hidden in safe mode

**Definition of Done:**
- Duress PIN distinct from normal PIN, stored as hash
- Safe-mode wallet shows only placeholder credentials

---
#### US-11.8
As a citizen, I want the system to silently alert security when my duress PIN is used, so that a possible coercion or fraud event is flagged for investigation without alerting the attacker.

**Acceptance Criteria:**
- Entering the duress PIN creates a silent security alert — no visible indication to the person watching
- Alert is logged to the audit trail with the citizen's ID, device ID, and timestamp
- No UI change or error message is shown when the duress PIN is used
- Security alert is accessible to authorised administrators

**Definition of Done:**
- Duress PIN activation creates a silent security alert with no visible UI indication to attacker

---
## 3.2.12 Epic 12: Advanced Features & Certified Documents

---

#### US-12.1
As a citizen, I want to generate a digitally certified copy of my credential as a downloadable document, so that I can use it for formal submissions that require a certified copy of my ID or licence.

**Acceptance Criteria:**
- Certified copy can only be generated for credentials with status Active
- Document is generated as a signed PDF with an embedded verification QR code
- PDF includes all credential fields, issuing authority, generation date, and digital signature
- The embedded QR code can be scanned to verify the document's authenticity
- Certified copy generation is logged to the audit trail

**Definition of Done:**
- Certified copy generated as a signed PDF with embedded verification QR
- Available only for Active credentials

---
#### US-12.2
As an emergency official (paramedic, firefighter, police), I want to scan a citizen's emergency QR code to retrieve critical identity and medical information, so that I can identify the citizen and provide appropriate emergency care when they cannot speak for themselves.

**Acceptance Criteria:**
- Emergency QR returns only emergency-safe fields to authorised emergency officials
- Emergency access requires the official to be authenticated as an authorised emergency responder
- Emergency access is logged immediately with the official's ID, timestamp, and location
- Citizen's primary contact is notified when emergency access is used

**Definition of Done:**
- Emergency QR returns only emergency-safe fields
- Emergency access logged immediately
- Citizen primary contact notified on emergency access

---
#### US-12.3
As a citizen, I want to configure which information is included in my emergency QR, so that I control what emergency responders can access about me.

**Acceptance Criteria:**
- Citizen can toggle optional fields in their emergency profile (e.g. blood type, allergies, medical conditions)
- Mandatory identification fields (name, SA ID, date of birth) cannot be removed from the emergency profile
- Changes to the emergency profile are saved and reflected in the next emergency QR
- Citizen can view a preview of what emergency responders will see

**Definition of Done:**
- Citizen can configure optional emergency fields
- Mandatory identification fields cannot be removed

---

