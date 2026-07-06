# Functional Requirements — FlashID
**Tech Titans · COS 301 Capstone 2026**

> This document contains the complete functional requirements for the FlashID system (R1-R10).
> See [SRS.md](./SRS.md) for the full Software Requirements Specification.

---
# Functional Requirements

---

## 4.1 Authentication and User Management Subsystem

### R1: User Registration and Authentication

The FlashID system shall provide secure authentication and identity onboarding functionality for citizens, government administrators, and verification officials.

---

#### R1.1: Citizen Registration

##### R1.1.1:
The system shall allow citizens to register using: South African ID number, mobile number, and email address.

##### R1.1.2:
The system shall validate: ID number format (exactly 13 digits), email format, and password complexity requirements.

##### R1.1.3:
The system shall prevent duplicate citizen registrations using the same South African ID number.

##### R1.1.4:
The system shall require citizens to verify their mobile number using OTP verification.

##### R1.1.5:
The system shall securely store citizen registration information in the backend database.

##### R1.1.6:
The system shall support citizen registration via a pre-issued activation code sent by a Home Affairs official, as an alternative to self-registration with a physical ID document.

##### R1.1.7:
The system shall lock a citizen account after 5 consecutive failed login attempts and notify the account holder.

---

#### R1.2: Citizen Login

##### R1.2.1:
The system shall allow login using: email and password, or mobile number and password.

##### R1.2.2:
The system shall support biometric authentication including fingerprint authentication and facial recognition authentication.

##### R1.2.3:
The system shall issue JWT authentication tokens upon successful login.

##### R1.2.4:
The system shall automatically expire inactive user sessions after a configurable timeout period.

##### R1.2.5:
The system shall securely log citizens out of all active sessions when requested.

---

#### R1.3: Government Administrator Authentication

##### R1.3.1:
The system shall restrict administrator access to authorized personnel only.

##### R1.3.2:
The system shall support role-based administrator permissions.

##### R1.3.3:
The system shall support multi-factor authentication for administrators.

##### R1.3.4:
The system shall maintain audit logs of all administrator login attempts.

---

#### R1.4: Verification Official Authentication

##### R1.4.1:
The system shall allow officials to authenticate before performing credential verification.

##### R1.4.2:
The system shall associate each verification action with the authenticated official account.

---

#### R1.5: Government Administrator Registration

##### R1.5.1:
The system shall allow existing government administrators to register new government administrator accounts.

##### R1.5.2:
The system shall assign the role GovernmentAdministrator to all registered government administrator accounts.

##### R1.5.3:
The system shall require a unique government employee ID for every administrator registration.

##### R1.5.4:
The system shall reject duplicate government employee IDs and duplicate email addresses during administrator registration.

##### R1.5.5:
The system shall hash and securely store all administrator passwords.

---

## 4.2 Credential Management Subsystem

### R2: Digital Credential Issuance and Management

---

#### R2.1: Digital ID Credential Issuance

##### R2.1.1:
The system shall allow administrators to issue South African digital identity credentials to registered citizens.

##### R2.1.2:
The system shall generate a unique credential identifier for every issued credential.

##### R2.1.3:
The system shall cryptographically sign each credential using Ed25519 at the point of issuance.

##### R2.1.4:
The system shall associate issued credentials with the correct citizen profile.

##### R2.1.5:
The system shall notify citizens when credentials have been successfully issued.

##### R2.1.6:
The system shall allow registered institutions to submit credential issuance requests via authenticated API calls using a valid institution API key.

##### R2.1.7:
The system shall validate that an institution is authorised to issue the requested credential type before processing an API-based issuance request.

---

#### R2.2: Driver's Licence Credential Issuance

##### R2.2.1:
The system shall store: Licence number, Vehicle classes, Restrictions, Expiry date, Issuing office.

##### R2.2.2:
The system shall automatically mark expired licences as inactive.

##### R2.2.3:
The system shall allow administrators to renew expired driver's licences.

---

#### R2.3: Credential Revocation and Status Management

##### R2.3.1:
The system shall allow administrators to revoke compromised credentials. Administrators shall be required to provide a mandatory revocation reason before the revocation is processed.

##### R2.3.2:
The system shall allow administrators to place a credential in Under Investigation status as a temporary measure pending a final revocation decision.

##### R2.3.3:
The system shall maintain credential statuses including: Active, Under Investigation, Revoked, Expired.

##### R2.3.4:
The system shall notify citizens when credentials are revoked or placed Under Investigation.

##### R2.3.5:
A credential with status Under Investigation shall return an INVALID result on verification. Administrators may lift the status to Active or proceed to full revocation.

##### R2.3.6:
The system shall send advance expiry warning notifications to citizens at 30 days and 7 days before a credential's expiry date.

##### R2.3.7:
The system shall run a scheduled automated job to check credential expiry dates daily. Any credential whose expiry date has passed shall have its status automatically updated to Expired.

---

#### R2.4: Secure Credential Storage

##### R2.4.1:
The mobile application shall securely store credentials using encrypted local storage.

##### R2.4.2:
The system shall prevent unauthorized access to stored credentials.

##### R2.4.3:
The system shall support offline credential viewing for previously issued credentials.

##### R2.4.4:
The system shall prevent raw personally identifiable information from being exposed in QR payloads.

---

#### R2.5: Credential Updates

##### R2.5.1:
The system shall allow government administrators to update credential fields when authoritative source data changes.

##### R2.5.2:
The system shall allow registered institutions to submit credential update requests via the API for fields within their authorised scope.

##### R2.5.3:
The system shall re-sign the credential with a fresh cryptographic signature after every update.

##### R2.5.4:
The system shall archive the previous version of a credential before applying any update.

---

## 4.3 QR Verification Subsystem

### R3: Real-Time Credential Verification

---

#### R3.1: QR Code Generation

##### R3.1.1:
The system shall generate unique QR payloads linked to specific credentials.

##### R3.1.2:
The system shall cryptographically sign QR payloads using Ed25519.

##### R3.1.3:
The system shall generate time-limited QR verification sessions.

##### R3.1.4:
The QR payload shall not contain raw personally identifiable information.

##### R3.1.5:
The system shall enforce one-time use on generated QR codes. A QR code that has been scanned successfully shall return an INVALID result with reason already_used on any subsequent scan. A QR code that returned INVALID on a scan may not be retried — a new QR code must be generated.

##### R3.1.6:
The system shall display a live expiry countdown timer to the citizen while a QR code is active. A visual warning shall be shown when fewer than 60 seconds remain. When the timer reaches zero the QR code shall be visually replaced with an expired state.

---

#### R3.2: QR Credential Verification

##### R3.2.1:
The system shall allow officials to scan QR codes using the verification portal.

##### R3.2.2:
The system shall validate: Credential authenticity, Credential status, Credential signature integrity.

##### R3.2.3:
The system shall display verification results in real time.

##### R3.2.4:
The system shall reject: Expired credentials, Revoked credentials, Tampered credentials.

##### R3.2.5:
The system shall automatically expire verification sessions after a predefined period.

##### R3.2.6:
The system shall allow officials to enter a credential token manually as an alternative to QR scanning when a camera is unavailable.

##### R3.2.7:
The system shall return one of four distinct failure reasons when a credential fails verification: revoked, expired, qr_expired, or tampered.

##### R3.2.8:
The system shall not include any citizen personally identifiable information in the verification response. The response shall contain only the result, credential type, failure reason if applicable, and timestamp.

---

#### R3.3: Verification Logging

##### R3.3.1:
The system shall log: Verification timestamp, Official identity, Credential reference, Verification outcome.

##### R3.3.2:
The system shall associate verification records with authenticated officials.

---

#### R3.4: Selective Disclosure

##### R3.4.1:
The system shall allow citizens to select which credential fields are included in a QR code payload before generation.

##### R3.4.2:
The system shall enforce a mandatory minimum set of fields that cannot be excluded from any QR code payload. The mandatory fields are: full name, SA ID number, date of birth, and photo. The photo enables the verifying official to visually cross-reference the credential against the person presenting it, reducing the risk of a credential being presented by someone other than its rightful holder.

##### R3.4.3:
The system shall display a pre-generation preview to the citizen showing exactly which fields will be visible to the verifier before the QR code is generated.

##### R3.4.4:
The system shall allow citizens to save preferred disclosure settings per credential type and per verifier type (hospital, police, Home Affairs, DLTC).

---

#### R3.5: Additional Disclosure Request Flow

##### R3.5.1:
The system shall allow an official to request additional credential fields from a citizen after receiving an initial VALID verification result.

##### R3.5.2:
The system shall deliver the official's additional disclosure request to the citizen in real time via push notification.

##### R3.5.3:
The system shall require citizen approval before any additional fields are shared with the official. The official's view shall display a pending state while awaiting the citizen's response. The official shall receive only the fields the citizen explicitly approves.

##### R3.5.4:
For any field the citizen denies, the system shall return a not_disclosed indicator to the official for that field.

##### R3.5.5:
The system shall log the citizen's approval or denial decision to the audit trail, including citizen ID, official ID, fields requested, fields approved, and timestamp.

---

## 4.4 Role-Based Access Control Subsystem

### R4: Role-Based Access Control

---

#### R4.1: Role Separation

The system shall support the following roles: Citizen, Home Affairs Official, Government Administrator, and Emergency Responder.

##### R4.1.1:
The system shall restrict users to functionality permitted by their assigned role.

##### R4.1.2:
The system shall prevent unauthorized privilege escalation.

##### R4.1.3:
The system shall restrict emergency QR access to users authenticated with the Emergency Responder role. Emergency access shall only return emergency-safe fields pre-configured by the citizen in their emergency profile. All emergency access events shall be logged immediately with the responder's ID, timestamp, and location.

---

#### R4.2: Administrative Permissions

##### R4.2.1:
The system shall allow privileged administrators to assign permissions.

##### R4.2.2:
The system shall allow privileged administrators to revoke permissions.

##### R4.2.3:
The system shall maintain audit logs for all permission changes.

---

## 4.5 Audit Logging and Compliance Subsystem

### R5: Audit Logging and Compliance

---

#### R5.1: Audit Logging

##### R5.1.1:
The system shall log: Login attempts, Credential issuance, Credential revocation, Verification attempts, Permission changes, Consent capture, Password changes, Device revocation.

##### R5.1.2:
The system shall maintain immutable, append-only audit records. No user or administrator may edit or delete an audit log entry.

##### R5.1.3:
The system shall associate all audit records with timestamps and actor identifiers.

---

#### R5.2: POPIA Compliance

##### R5.2.1:
The system shall minimize exposure of citizen data during verification workflows.

##### R5.2.2:
The system shall encrypt sensitive data at rest.

##### R5.2.3:
The system shall encrypt sensitive data during transmission.

##### R5.2.4:
The system shall support traceability and accountability for all data access operations.

---

## 4.6 Notification Subsystem

### R6: Push Notifications and Alerts

---

#### R6.1: Credential Notifications

##### R6.1.1:
The system shall notify citizens when credentials are issued.

##### R6.1.2:
The system shall notify citizens when credentials are revoked or placed Under Investigation.

##### R6.1.3:
The system shall notify citizens when credential expiry dates are approaching (30 days and 7 days before expiry).

---

#### R6.2: Push Notification Support

##### R6.2.1:
The system shall deliver notifications to authenticated mobile devices.

##### R6.2.2:
The system shall allow users to view notification history.

---

## 4.7 Analytics and Reporting Subsystem

### R7: Analytics and Reporting

---

#### R7.1: Verification Analytics

##### R7.1.1:
The system shall display: Verification frequency, Verification success rates, Verification failure rates.

##### R7.1.2:
The system shall generate analytics trends over time.

---

#### R7.2: Administrative Reports

##### R7.2.1:
The system shall generate reports for: Issued credentials, Revoked credentials, Verification activity, User activity.

##### R7.2.2:
The system shall allow administrators to export reports.

---

## 4.8 Institution Registration & API Key Management Subsystem

### R8: Institution Registration and API Key Management

---

#### R8.1: Institution Registration

##### R8.1.1:
The system shall allow government administrators to register external institutions including banks, hospitals, police stations, insurance agencies, and driving licence testing centres.

##### R8.1.2:
The system shall require a unique verification number for each institution and validate its format against the registered institution type.

##### R8.1.3:
The system shall reject institution registration if the verification number already exists in the system.

##### R8.1.4:
The system shall generate a cryptographically secure API key for each institution upon successful registration.

##### R8.1.5:
The system shall display the generated API key exactly once at the point of creation. It shall not be retrievable again after dismissal.

##### R8.1.6:
The system shall store only the SHA-256 hash of the API key — never the plaintext value.

---

#### R8.2: Institution Management

##### R8.2.1:
The system shall allow government administrators to view a list of all registered institutions with their name, type, status, and registration date.

##### R8.2.2:
The system shall allow government administrators to search and filter institutions by name, type, verification number, and the administrator who registered them.

##### R8.2.3:
The system shall allow government administrators to deactivate an institution, immediately invalidating its API key.

---

#### R8.3: API Key Management

##### R8.3.1:
The system shall allow government administrators to regenerate an institution's API key. The previous key shall be invalidated immediately upon regeneration.

##### R8.3.2:
The system shall log all institution registration, deactivation, and key regeneration events to the audit trail with the administrator's ID and a timestamp.

---

## 4.9 Cryptographic Security & Key Management Subsystem

### R9: Cryptographic Security and Key Management

---

#### R9.1: Credential Signing

##### R9.1.1:
The system shall sign every credential with an Ed25519 digital signature at the point of issuance. The signature shall cover all credential fields.

##### R9.1.2:
A signing failure shall prevent the credential from being saved. Partial credential creation without a valid signature is not permitted.

##### R9.1.3:
Private signing keys shall be stored in Azure Key Vault. For Demo 1, a LocalSigningStrategy with a secured test key is permitted. The switch to KeyVaultSigningStrategy shall require only a dependency injection configuration change.

---

#### R9.2: Signature Verification

##### R9.2.1:
The system shall perform a live Ed25519 signature verification on every QR scan. Verification results shall never be cached.

##### R9.2.2:
Any credential whose fields have been altered after signing shall fail signature verification and return INVALID with reason tampered.

---

#### R9.3: Key Rotation

##### R9.3.1:
The system shall support cryptographic key rotation without invalidating existing valid credentials signed with a previous key.

##### R9.3.2:
Credentials shall be re-signed with the current active key after every update. The previous signed version shall be archived before the update is applied.

---

## 4.10 Account Management & Device Security Subsystem

### R10: Account Management and Device Security

---

#### R10.1: Password Management

##### R10.1.1:
The system shall allow citizens to change their password by confirming their current password before the new one is accepted.

##### R10.1.2:
The system shall allow citizens to reset a forgotten password via a time-limited OTP sent to their registered email or phone number. The OTP shall expire after 15 minutes.

##### R10.1.3:
The system shall invalidate all active sessions except the current one when a password change is performed.

---

#### R10.2: Contact Detail Management

##### R10.2.1:
The system shall allow citizens to update their registered email address and phone number.

##### R10.2.2:
The system shall require OTP verification of the new contact detail before the change takes effect.

---

#### R10.3: Account Deletion

##### R10.3.1:
The system shall allow citizens to request deletion of their FlashID account.

##### R10.3.2:
Deleted accounts shall be soft-deleted and subject to a 90-day POPIA data retention period before permanent removal.

##### R10.3.3:
Audit log entries associated with a deleted account shall be retained indefinitely regardless of the account deletion.

---

#### R10.4: Trusted Device Management

##### R10.4.1:
The system shall maintain a list of trusted devices for each citizen, showing device type, name, and last active date.

##### R10.4.2:
The system shall allow citizens to revoke access for a lost or stolen device. All active sessions on the revoked device shall be immediately invalidated.

---

#### R10.5: Duress PIN

##### R10.5.1:
The system shall allow citizens to configure a duress PIN that is distinct from their normal PIN.

##### R10.5.2:
Entering the duress PIN shall open a safe-mode view of the wallet displaying only non-sensitive placeholder credentials. Real credentials shall not be accessible in safe mode.

##### R10.5.3:
The system shall generate a silent security alert when the duress PIN is used, with no visible indication to the person observing. The alert shall be logged to the audit trail with citizen ID, device ID, and timestamp.

---

