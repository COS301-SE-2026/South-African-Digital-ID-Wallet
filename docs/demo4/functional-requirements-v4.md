# Functional Requirements: FlashID
**Tech Titans · COS 301 Capstone 2026**

> This document contains the complete functional requirements for the FlashID system (R1-R11). Requirements describe the system as built for Demo 4. Requirements that were planned but not built are listed under [Future Work](#future-work).
> See [SRS](./SRS-v4.md) for the full Software Requirements Specification.

---
# Functional Requirements

---

## 4.1 Authentication and User Management Subsystem

### R1: User Registration and Authentication

The FlashID system shall provide secure authentication and account registration functionality for citizens, government administrators, and officials.

---

#### R1.1: Citizen Registration

##### R1.1.1:
The system shall allow citizens to register using an email address and password.

##### R1.1.2:
The system shall validate the email format and require a password of at least 10 characters containing an uppercase letter, a lowercase letter, a digit and a special character.

##### R1.1.3:
The system shall prevent duplicate citizen registrations using the same email address.

##### R1.1.4:
The system shall require citizens to verify their email with a 6-digit OTP that expires after 10 minutes and is blocked after 5 wrong attempts.

##### R1.1.5:
The system shall securely store citizen registration information in the backend database, with passwords hashed using BCrypt.

---

#### R1.2: Citizen Login

##### R1.2.1:
The system shall allow login using email and password.

##### R1.2.2:
The mobile app shall support unlocking with the device's biometrics (fingerprint or face), with the device PIN as a fallback. Biometric data shall never leave the device.

##### R1.2.3:
The system shall issue JWT authentication tokens upon successful login.

##### R1.2.4:
The system shall expire sessions after 8 hours, or after 30 days when the user selects "remember me".

##### R1.2.5:
The system shall record successful and failed logins in the audit log, and record the device type and approximate location (city and country from the IP address) for security monitoring.

##### R1.2.6:
The system shall require users to verify devices that log into their accounts for the first time using an OTP sent by email, which expires after 10 minutes.

##### R1.2.7:
The system shall allow the device verification code to be resent, subject to rate limiting.

##### R1.2.8:
The system shall end all of a user's active sessions when the user signs out.

##### R1.2.9:
The system shall lock an account for 30 minutes after 5 consecutive failed login attempts.

---

#### R1.3: Government Administrator Authentication

##### R1.3.1:
The system shall restrict administrator access to authorized personnel only.

##### R1.3.2:
The system shall restrict administrator endpoints to users with the GovernmentAdministrator role.

##### R1.3.3:
The system shall maintain audit logs of all login attempts, including those of administrators.

---

#### R1.4: Verification Official Authentication

##### R1.4.1:
The system shall allow officials to authenticate before performing credential verification.

##### R1.4.2:
The system shall associate each verification action with the authenticated official account.

---

#### R1.5: Government Administrator Accounts

##### R1.5.1:
The system shall assign the role GovernmentAdministrator to all government administrator accounts. Administrator accounts are provisioned by the system, not through public registration.

##### R1.5.2:
The system shall record a government ID for every administrator.

##### R1.5.3:
The system shall hash and securely store all administrator passwords.

---

## 4.2 Credential Management Subsystem

### R2: Digital Credential Issuance and Management

---

#### R2.1: Digital ID Credential Issuance

##### R2.1.1:
The system shall allow officials to issue South African digital identity and driver's licence credentials to activated citizens, after recording the citizen's POPIA consent.

##### R2.1.2:
The system shall generate a unique credential identifier for every issued credential.

##### R2.1.3:
The system shall source all credential data from the government registry at the point of issuance.

##### R2.1.4:
The system shall associate issued credentials with the correct citizen profile.

##### R2.1.7:
The system shall allow a verified citizen to add their existing identity document and driver's licence to their wallet from the government registry, skipping credential types they already hold.

---

#### R2.2: Driver's Licence Credential Issuance

##### R2.2.1:
The system shall store: licence number, licence code, restrictions, expiry date, country of issue and photo.

##### R2.2.2:
The system shall automatically mark expired licences as Expired.

---

#### R2.3: Credential Revocation and Status Management

##### R2.3.1:
The system shall allow administrators to revoke compromised credentials. Administrators shall be required to provide a mandatory revocation reason before the revocation is processed.

##### R2.3.2:
The system shall allow administrators to place a credential in Investigation status as a temporary measure pending a final revocation decision.

##### R2.3.3:
The system shall maintain credential statuses including: Active, Inactive, Investigation, Revoked, Expired.

##### R2.3.4:
A credential with status Investigation shall be rejected on verification. Administrators may reinstate it to Active or proceed to full revocation, and may also reinstate a revoked credential. Reinstatement requires a reason.

##### R2.3.6:
The system shall run a scheduled automated job daily at 00:00 SAST to check driver's licence expiry dates. Any credential whose expiry date has passed shall have its status automatically updated to Expired. A missed run shall be caught up on the next service start-up, and administrators may trigger the check manually.

---

#### R2.4: Secure Credential Storage

##### R2.4.1:
The mobile application shall securely store offline credentials in encrypted local storage, with the encryption key held in the device's secure storage.

##### R2.4.2:
The system shall prevent unauthorized access to stored credentials.

##### R2.4.3:
The system shall support offline credential viewing for previously issued credentials.

##### R2.4.4:
The system shall prevent raw personally identifiable information from being exposed in online QR payloads. An offline presentation, explicitly selected by the citizen, may carry only the fields the citizen chose to disclose, while undisclosed fields remain salted digests. Compensating controls: selective disclosure, holder binding that makes a copied or recorded code stop verifying within about 90 seconds, the embedded portrait, blocked screenshots on the sharing screen, animated frames, and packages that expire after at most 30 days.

##### R2.4.5:
Citizen photographs referenced by a credential shall be stored in a location that does not allow public access. For an online credential, a link granting temporary access to a photograph shall only be created at the moment a credential is being verified, and that link shall stop working after 5 minutes. For offline verification, the credential carries a downscaled 160 x 160 WebP copy of the portrait inside the signed credential, never a link.

---

#### R2.5: Credential Updates

##### R2.5.1:
The system shall run a daily job that compares active credentials with the government registry and updates any fields that have changed. Administrators may trigger the job manually. Each update shall be logged and the citizen notified.

---

## 4.3 QR Verification Subsystem

### R3: Real-Time Credential Verification

---

#### R3.1: QR Code Generation

##### R3.1.1:
The system shall generate unique QR payloads linked to specific credentials.

##### R3.1.2:
The system shall cryptographically sign QR payloads using ES256 with a key held in Azure Key Vault.

##### R3.1.3:
The system shall generate QR codes that are valid for 60 seconds.

##### R3.1.4:
The QR payload shall not contain raw personally identifiable information. It carries the credential reference and the names of the disclosed fields only.

##### R3.1.5:
The system shall enforce one-time use on generated QR codes. A QR code that has been scanned shall be rejected on any subsequent scan, and a new QR code must be generated.

##### R3.1.6:
The system shall display a live expiry countdown timer to the citizen while a QR code is active. On the web portal, a visual warning shall be shown when fewer than 15 seconds remain. When the timer reaches zero the QR code shall be visually replaced with an expired state.

##### R3.1.7:
The system shall track single-use QR verification tokens in a datastore that automatically removes expired entries without requiring a manual cleanup process.

##### R3.1.8:
When a citizen generates a new QR code for a credential, any previously generated QR codes for that same credential that are still active shall become immediately unusable.

##### R3.1.9:
The system shall block QR generation while fraud detection has restricted the citizen's account (see R10.6).

---

#### R3.2: QR Credential Verification

##### R3.2.1:
The system shall allow officials to scan QR codes using the mobile app.

##### R3.2.2:
The system shall validate: the token signature, the token expiry, one-time use, and the credential's current status.

##### R3.2.3:
The system shall display verification results in real time.

##### R3.2.4:
The system shall reject tokens for credentials that are Expired, Revoked, under Investigation or otherwise not Active, and tokens that have been tampered with.

##### R3.2.5:
The system shall automatically expire verification sessions after a predefined period.

##### R3.2.7:
The system shall return a single invalid result for every online verification failure, without revealing which check failed. Offline verification failures show a specific reason (see R3.6.7).

##### R3.2.8:
The verification response shall contain only the credential type and the fields the citizen chose to disclose, with the photograph provided as a temporary link (see R2.4.5).

---

#### R3.3: Verification Logging

##### R3.3.1:
The system shall log every successful verification with the timestamp, official identity, credential reference and outcome. Tokens that fail signature or format checks shall be logged as failed verifications.

##### R3.3.2:
The system shall associate verification records with authenticated officials.

---

#### R3.4: Selective Disclosure

##### R3.4.1:
The system shall allow citizens to select which credential fields are included in a QR code payload before generation.

##### R3.4.2:
The system shall enforce a mandatory minimum set of fields per credential type that cannot be excluded from any QR code payload. For an identity document, the mandatory fields are: date of birth and photograph. For a driver's licence, the mandatory fields are: photo, expiry date and date of birth. The photograph enables the verifying official to visually cross-reference the credential against the person presenting it, reducing the risk of a credential being presented by someone other than its rightful holder.

##### R3.4.3:
The web portal shall display a pre-generation preview to the citizen showing exactly which fields will be visible to the verifier before the QR code is generated.

---

#### R3.6: Offline Verification

##### R3.6.1:
The citizen shall be able to present a credential without an internet connection as an animated QR code, choosing which optional fields to disclose. Mandatory fields for the credential type shall always be included.

##### R3.6.2:
The wallet shall prepare an offline package for each credential while the device is online, store it in encrypted storage on the device, and discard it once expired. A package shall be valid for at most 30 days.

##### R3.6.3:
Every offline presentation shall be bound to the citizen's device. The wallet shall sign it with a device key at least every 5 seconds while it is shown, and a verifier shall refuse a presentation whose binding is missing, invalid or older than 30 seconds, allowing 60 seconds of clock difference.

##### R3.6.4:
A verifier shall verify an offline presentation entirely on its own device, using a cached issuer key set and revocation list, and shall show the disclosed fields, the portrait and any warning.

##### R3.6.5:
A verifier shall refuse a credential that appears on its cached revocation list. It shall warn when its verification data is over 24 hours old and refuse to verify when it is over 7 days old.

##### R3.6.6:
Every offline verification result shall be kept on the verifier's device and recorded in the audit trail once the device is online, including both the device's scan time and the server's receipt time. A result shall be recorded only once however often the upload is retried.

##### R3.6.7:
A failed offline verification shall show the verifier a specific reason, including that the credential is revoked or expired, that the code could not be linked to the citizen's phone, or that the code has expired and must be shown again.

##### R3.6.8:
When a verifier without connection scans an online QR code, the system shall tell the verifier to ask the citizen for the offline code.

---

## 4.4 Role-Based Access Control Subsystem

### R4: Role-Based Access Control

---

#### R4.1: Role Separation

The system shall support the following roles: Citizen, Official and GovernmentAdministrator.

##### R4.1.1:
The system shall restrict users to functionality permitted by their assigned role.

##### R4.1.2:
The system shall prevent unauthorized privilege escalation.

##### R4.1.3:
The system shall restrict emergency QR access to users with the Official role. Emergency access shall only return the medical fields and emergency contacts configured by the citizen in their emergency profile. All emergency access events shall be logged immediately with the official's ID, institution, timestamp and location (when provided).

---

## 4.5 Audit Logging and Compliance Subsystem

### R5: Audit Logging and Compliance

---

#### R5.1: Audit Logging

##### R5.1.1:
The system shall log: login attempts, logouts, device verification, credential issuance, credential revocation and reinstatement, verification attempts, consent capture, password resets, email changes, fraud alerts and emergency access.

##### R5.1.2:
The system shall not provide any endpoint that allows an audit log entry to be edited.

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

### R6: Notifications and Alerts

---

#### R6.1: Credential Notifications

##### R6.1.1:
The system shall notify citizens when credentials are issued.

##### R6.1.2:
The system shall notify citizens when credentials are revoked, placed under Investigation, reinstated, expired or updated from the registry.

---

#### R6.2: Notification Delivery

##### R6.2.1:
The system shall deliver notifications in-app to the citizen's account, and by email for activation links, one-time codes and emergency access alerts.

##### R6.2.2:
The system shall allow users to view notification history.

---

## 4.7 Analytics and Reporting Subsystem

### R7: Analytics and Reporting

---

#### R7.1: Verification Analytics

##### R7.1.1:
The system shall display to government administrators: verifications, credentials issued, active officials and active institutions for a selected date range.

##### R7.1.2:
The system shall show daily trends for each metric and the change compared with the previous period.

---

#### R7.3: Dashboards

##### R7.3.1:
The system shall show each role a dashboard: citizens see their account summary, recent activity and notifications; officials see their stats and recent activity; government administrators see system status, headline counts and a system-wide activity feed.

##### R7.3.2:
The administrator activity feed shall only include institution-level and system-level events, excluding citizen-level data.

##### R7.3.3:
The system shall allow officials to search and filter their institution's audit history by text, action, type and date range. Citizen ID numbers shall be masked, and each lookup shall itself be recorded in the audit log.

---

## 4.8 Institution Registration & API Key Management Subsystem

### R8: Institution Registration and API Key Management

---

#### R8.1: Institution Registration

##### R8.1.1:
The system shall allow government administrators to register external institutions of the following types: Home Affairs, Licensing Department, Law Enforcement, Healthcare and Financial Institution.

##### R8.1.2:
The system shall require a verification number of up to 100 characters for each institution.

##### R8.1.3:
The system shall reject institution registration if the verification number already exists in the system.

##### R8.1.4:
The system shall generate a random API key for each institution upon successful registration.

##### R8.1.5:
The system shall display the generated API key exactly once at the point of creation. It shall not be retrievable again after dismissal.

##### R8.1.6:
The system shall never store the plaintext API key.

##### R8.1.7:
The system shall log every institution registration to the audit trail with the administrator's ID and a timestamp.

---

#### R8.2: Institution Management

##### R8.2.1:
The system shall allow government administrators to view a list of all registered institutions with their name, type and verification number.

##### R8.2.2:
The system shall allow government administrators to search institutions by name, type or verification number using a single partial-match search.

---

## 4.9 Cryptographic Security & Key Management Subsystem

### R9: Cryptographic Security and Key Management

---

#### R9.1: Credential Signing

##### R9.1.1:
Every offline credential shall be signed with ES256 as an SD-JWT when its offline package is created. The signature covers all credential fields through salted digests and binds the credential to the holder's device key.

##### R9.1.2:
A signing failure shall prevent the offline package from being saved, and the failure shall be logged to the audit trail.

##### R9.1.3:
The QR signing key shall be stored in Azure Key Vault and never in the application database. The offline credential signing key shall be accessed through a replaceable signing provider so that it can move to Azure Key Vault without code changes.

---

#### R9.2: Signature Verification

##### R9.2.1:
The system shall verify the issuer signature on every credential presentation using ES256. Online presentations shall be verified live by the backend and verification results shall not be cached. Offline presentations shall be verified on the verifier's device against a cached issuer key set and revocation list, whose age shall be shown to the verifier.

##### R9.2.2:
Any credential or token whose contents have been altered after signing shall fail signature verification and be rejected.

---

#### R9.3: Key Rotation

##### R9.3.1:
The system shall check Azure Key Vault daily for a new version of the QR signing key, activate the new version and mark the previous key as Retired.

##### R9.3.2:
Every credential shall be signed with ES256 before it can be presented offline. Offline packages shall be refreshed while the device is online and shall be valid for at most 30 days.

---

## 4.10 Account Management & Device Security Subsystem

### R10: Account Management and Device Security

---

#### R10.1: Password Management

##### R10.1.1:
The system shall allow citizens to change their password by confirming their current password before the new one is accepted.

##### R10.1.2:
The system shall allow citizens to reset a forgotten password via an OTP sent to their registered email address. The OTP shall expire after 15 minutes and be blocked after 5 wrong attempts.

##### R10.1.3:
The system shall end all active sessions, including the current one, and remove all trusted devices when a password change is performed.

---

#### R10.2: Contact Detail Management

##### R10.2.1:
The system shall allow citizens to update their registered email address after re-entering their password.

##### R10.2.2:
The system shall require OTP verification of the new email address before the change takes effect. The OTP shall expire after 10 minutes.

---

#### R10.3: Account Deletion

##### R10.3.1:
The system shall allow citizens to delete their FlashID account, removing their account, credentials, trusted devices and notifications.

---

#### R10.4: Trusted Device Management

##### R10.4.1:
The system shall maintain a list of trusted devices for each citizen, showing each device's name and marking the current device.

##### R10.4.2:
The system shall allow citizens to remove a trusted device. A removed device shall pass email device verification again at its next sign-in.

---

#### R10.6: Fraud Detection

##### R10.6.1:
The system shall check sign-ins and QR generation for suspicious activity, including impossible travel between sign-in locations that would require travel faster than 900 km/h.

##### R10.6.2:
The system shall create a security alert for the citizen for every medium-risk or high-risk event.

##### R10.6.3:
The system shall block QR generation for 30 minutes after a high-risk event.

##### R10.6.4:
The system shall allow citizens to secure their account from an alert, after re-entering their password, which ends all sessions, removes the suspicious device (or all other devices) and lifts the QR restriction. Citizens may instead dismiss an alert that was their own activity.

##### R10.6.5:
The system shall allow citizens to turn impossible travel detection and enhanced verification on or off after re-entering their password.

---

## 4.11 Emergency Access & Certified Documents Subsystem

### R11: Emergency Access and Certified Documents

---

#### R11.1: Emergency Access

##### R11.1.1:
The system shall allow citizens to enable an emergency profile after giving consent, register their phone's key to sign emergency codes, fill in chosen medical fields, and add emergency contacts in priority order.

##### R11.1.2:
Medical fields in the emergency profile shall be encrypted at the application level before storage.

##### R11.1.3:
An emergency code shall be signed by the citizen's phone, be short-lived, and be usable only once.

##### R11.1.4:
The system shall email the citizen and their emergency contacts whenever their emergency profile is accessed.

##### R11.1.5:
The system shall allow emergency access while offline and record it when the official's phone reconnects.

##### R11.1.6:
The system shall allow citizens to view who accessed their emergency profile, the institution, time, reason given, location (when provided) and whether the access was offline.

---

#### R11.2: Certified Copies

##### R11.2.1:
The system shall allow citizens to generate a certified copy of an Active credential as a PDF with an embedded verification QR code.

##### R11.2.2:
The system shall store a hash of each certified copy PDF and a snapshot of the credential, and the copy shall be valid for 90 days.

##### R11.2.3:
The system shall allow anyone to verify a certified copy without signing in, by scanning its QR code, opening its link or uploading the PDF, and shall report whether it is valid, expired, altered or linked to a credential that is no longer Active.

---
