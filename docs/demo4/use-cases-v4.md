# SA Digital ID Wallet: Use Case Overview
**Tech Titans · COS 301 Capstone 2026**

# Use Cases

The following use case diagrams represent the core FlashID workflows developed. These diagrams show the main system actors, system boundaries, and user-facing functions implemented for Demo 4.

---
## 1. Authentication, Verification and Access Management

The Authentication, Verification and Access Management subsystem allows users to securely register, authenticate and verify their identity before accessing FlashID. The subsystem also provides additional device verification when a user attempts to access their account from an untrusted device.

![Authentication, Verification and Access Management Use Case Diagram](../images/authentication_use_case.drawio.svg)

### Register User Account

**TUCBW:** This use case begins when a Citizen chooses to create a FlashID account and provides an email address and password.

**TUCEW:** This use case ends when the Citizen's account has been successfully created and a verification OTP has been sent to their email address.

### Verify Email with OTP

**TUCBW:** This use case begins when a registered Citizen submits the OTP sent to their registered email address.

**TUCEW:** This use case ends when the OTP has been successfully validated and the Citizen's email address is marked as verified.

### Login

**TUCBW:** This use case begins when a User submits their FlashID login credentials.

**TUCEW:** This use case ends when the User's credentials have been successfully authenticated and either access is granted for a trusted device or device verification is required for an untrusted device, or when the account is locked for 30 minutes after 5 failed attempts.

### Verify Device by OTP

**TUCBW:** This use case begins when a User attempting to log in from an untrusted device submits the device verification OTP sent to their registered email address.

**TUCEW:** This use case ends when the OTP has been successfully validated, the device has been recorded as trusted, and the User's authenticated session is established.

### Resend OTP

**TUCBW:** This use case begins when a User requests a new OTP after the original code has not been received or can no longer be used.

**TUCEW:** This use case ends when a new OTP has been generated, the verification expiry period has been refreshed, and the new OTP has been sent to the User's registered email address.

### POPIA Compliance
- **Section 8 - Accountability:** FlashID must ensure that authentication, email verification, and device verification processes comply with POPIA and that access to user accounts is appropriately controlled.

- **Section 10 - Minimality:** Only personal information necessary to authenticate users, verify email addresses, and identify trusted devices may be collected and processed.

- **Section 13 - Purpose Specification:** User credentials, OTPs, device information, IP addresses, and approximate location data may only be processed for authentication, verification, account security, and trusted-device management.

- **Section 14 - Retention and Restriction of Records:** Authentication and verification information must not be retained for longer than necessary. Temporary information such as OTPs must expire after the defined verification period.

- **Section 15 - Further Processing Limitation:** Authentication, device, IP address, and location information must not be reused for purposes incompatible with the security and verification purposes for which it was collected.

- **Section 18 - Notification to Data Subject:** Users must be informed of the personal information collected during registration and authentication, including device and approximate location information where applicable, and the purpose for which it is processed.

- **Sections 19-22 - Security Safeguards:** Passwords, OTPs, authentication tokens, and trusted-device tokens must be appropriately protected. FlashID implements safeguards such as password hashing, expiring OTPs, secure HttpOnly cookies on the web, secure token storage on mobile, access control, and authentication audit logging.

---
## 2. Upload an Institution

The Upload an Institution subsystem allows a government administrator to enter institution details, have them validated, generate an institution API key, and view the API key once after registration.

![Upload Institution Use Case Diagram](../images/Upload_an_Institution.svg)

### POPIA Compliance

- **Section 8 - Accountability:** Only authorised government administrators may register institutions, and every registration is audit logged.
- **Section 13 - Purpose Specification:** Institution data and API keys are used only for authorised FlashID integration.
- **Section 15 - Further Processing Limitation:** API keys must only be used for approved communication between FlashID and registered institutions.
- **Sections 19-22 - Security Safeguards:** API keys are randomly generated, shown only once, and never stored in plaintext.

---
## 3. Onboard Citizen

The Onboard Citizen subsystem allows a Home Affairs official to retrieve a citizen identity record, capture citizen consent, capture contact details, register a pending FlashID record, email the citizen an activation link and receive a 6-digit activation PIN to give to the citizen.

![Onboard Citizen Use Case Diagram](../images/Onboard_Citizen.svg)

### POPIA Compliance

- **Section 8 - Accountability:** The official's onboarding actions are logged.
- **Section 10 - Minimality:** Only necessary identity and contact details are captured.
- **Section 11 - Consent:** Explicit citizen consent must be captured before onboarding.
- **Section 12 - Collection Directly from Data Subject:** Contact details and consent are collected directly from the citizen.
- **Section 13 - Purpose Specification:** Citizen data is used for FlashID onboarding.
- **Sections 17-18 - Openness:** Citizens are to be informed about how their data will be used.
- **Sections 19-22 - Security Safeguards:** Identity records, activation links, activation PINs and contact details must be securely processed; only hashes of the activation token and PIN are stored.

---
## 4. Citizen Registration

The Citizen Registration subsystem allows a citizen with a FlashID account to link it to their identity. Linking may occur using the activation link and PIN from onboarding, or through physical ID verification with an Azure Face liveness check matched against the government registry portrait. Once linked, the citizen can add their existing credentials from the government registry.

![Citizen Registration Use Case Diagram](../images/Citizen_Registration.svg)

### POPIA Compliance

- **Section 10 - Minimality:** Registration should only collect the information required to create and verify the account.
- **Section 11 - Consent:** Citizens voluntarily register, and must give explicit consent before any biometric processing in physical ID verification.
- **Section 12 - Collection Directly from Data Subject:** Registration information is collected directly from the citizen where possible.
- **Section 13 - Purpose Specification:** Registration data is used to create and activate the FlashID account.
- **Section 19 - Security Safeguards:** Activation codes, passwords, and identity verification steps must be securely handled.

---
## 5. Issue Credentials

The Issue Credentials subsystem allows authorised officials to look up a citizen and issue digital credentials sourced from the government registry. The system supports issuing digital IDs and digital driver's licences, then notifying the citizen once the credential has been issued.

![Issue Credentials Use Case Diagram](../images/Issue_Credentials_UC_Diagram.svg)

### Search & View Citizen Status

**TUCBW:** This use case begins with an Official entering a citizen's SA ID number into the officials portal to look them up.

**TUCEW:** This use case ends with the citizen's FlashID status, profile details, and any existing credentials being displayed to the Official, or an error if no matching citizen is found. The lookup is recorded in the audit log.

---

### Capture Citizen Consent

**TUCBW:** This use case begins with an Official confirming the citizen is Activated in FlashID and selecting a credential type to issue to the citizen.

**TUCEW:** This use case ends with the Official confirming POPIA Section 11 consent and the consent is recorded to the audit trail, or the action is blocked and the Official is shown an error because consent was not given.

---

### Generate Identity Document Credential

**TUCBW:** This use case begins with an Official initiating the issuance of an identity document credential.

**TUCEW:** This use case ends with the citizen's identity document record retrieved from the government registry (POPIA Section 10 & 16) and stored in FlashID as an Active credential linked to the citizen (POPIA Section 13), and an audit log entry has been recorded.

---

### Generate Driver's Licence Credential

**TUCBW:** This use case begins with an Official initiating the issuance of a driver's licence credential.

**TUCEW:** This use case ends with the citizen's driver's licence record retrieved from the government registry (POPIA Section 10 & 16) and stored in FlashID as an Active credential linked to the citizen (POPIA Section 13), and an audit log entry has been recorded.

---

### Notify Citizen

**TUCBW:** This use case begins with a new credential having been successfully persisted for a citizen.

**TUCEW:** This use case ends with an in-app notification created for the citizen, indicating that their new credential has been added to their FlashID wallet.

### POPIA Compliance

- **Section 10 - Minimality:** Only the data required to issue the credential should be processed.
- **Section 11 - Consent:** Credential issuing should occur after the citizen has been onboarded and consent has been captured.
- **Section 13 - Purpose Specification:** Citizen data is processed only for credential issuing.
- **Section 16 - Information Quality:** Credentials are generated from verified government registry records.
- **Sections 19-22 - Security Safeguards:** Only Officials can issue credentials, and credentials are cryptographically signed whenever they are presented as a QR code or offline package.

---

## 6. Access Credentials

The Access Credentials subsystem allows citizens to log in, view their credentials, generate certified copies, choose which fields to disclose, and generate one-time QR codes. Officials scan these QR codes to verify credentials, and anyone can verify a certified copy.

![Access Credentials Use Case Diagram](../images/Access_Credentials.svg)

### Generate Certified Copy

**TUCBW:** This use case begins when a Citizen chooses to generate a certified copy of an Active credential.

**TUCEW:** This use case ends with a PDF containing the credential fields and a verification QR code downloaded by the Citizen, and a hash of the PDF stored for later verification. The copy is valid for 90 days.

### Verify Certified Copy

**TUCBW:** This use case begins when any person scans the QR code on a certified copy, opens its verification link, or uploads the PDF.

**TUCEW:** This use case ends with the result displayed: valid, expired, altered, or linked to a credential that is no longer Active.

### POPIA Compliance

- **Section 10 - Minimality:** QR codes and selective disclosure expose only the minimum required information.
- **Section 11 - Consent:** Citizens choose when to generate QR codes and certified copies, and which fields to disclose.
- **Section 13 - Purpose Specification:** Credential information is shared only for verification or certified copy purposes.
- **Section 19 - Security Safeguards:** Access to credentials is protected through authentication, biometric confirmation on mobile, and signed one-time QR codes.
- **Section 23 - Access to Personal Information:** Citizens can view and access their own credential information.

---
## 7. Account Management

The Account Management subsystem allows citizens to maintain their FlashID account details and security settings. This includes changing passwords, resetting forgotten passwords, updating their email address, managing trusted devices, responding to security alerts and deleting their account.

![Account Management Use Case Diagram](../images/Account_Management.svg)

### Respond to Security Alert

**TUCBW:** This use case begins when fraud detection raises a security alert for a Citizen, for example after impossible travel between sign-ins, and the Citizen opens the alert in the mobile app.

**TUCEW:** This use case ends with the Citizen either securing the account (after re-entering their password, all sessions end, the suspicious device is removed and any QR restriction is lifted) or dismissing the alert as their own activity, and the outcome recorded in the audit log.

### POPIA Compliance

- **Section 8 - Accountability:** Email changes, password resets and security alert actions are logged and traceable.
- **Section 10 - Minimality:** Only required account and contact information should be collected or updated.
- **Section 11 - Consent:** Citizens voluntarily initiate updates to their own account information.
- **Section 19 - Security Safeguards:** Password changes, trusted device management and fraud detection protect citizen data from unauthorised access.
- **Section 23 - Access to Personal Information:** Citizens are able to access and manage their own personal account information.

---
## 8. Credentials Management

The Credentials Management subsystem allows the system and government administrators to manage the lifecycle of citizen credentials. This includes expiring driver's licences, reinstating revoked or investigated credentials, updating citizen credentials from the government registry, placing credentials under investigation, and viewing audit logs.

![Credentials Management Use Case Diagram](../images/Credentials_Management_v2.svg)

### Automatically Expire Credential

**TUCBW:** This use case begins with the system's scheduled credential expiry check running (automatically every day at 00:00 SAST, or manually triggered by a Government Administrator as a testing action) and identifying an Active driver's licence credential whose expiry date has passed.

**TUCEW:** This use case ends with the credential's status being updated to Expired, an audit log entry being recorded, and the citizen being notified of the expiration in-app.

### Update Citizen Credentials

**TUCBW:** This use case begins with the system's scheduled update citizen credentials check running (automatically every day at 00:00 SAST, or manually triggered by a Government Administrator as a testing action) and updating any credentials in FlashID that have been updated in the Government Registry.

**TUCEW:** This use case ends with the citizen's personal details and/or credentials being updated to match the Government Registry, an audit log entry being recorded for each change, and the citizen being notified of the update in-app.

### Reinstate Credential

**TUCBW:** This use case begins with a Government Administrator selecting a credential currently under Investigation or Revoked, choosing to reinstate it, and providing a reason.

**TUCEW:** This use case ends with the credential's status being restored to Active, the status change being logged to the audit log, and the citizen being notified.

### Revoke Credential

**TUCBW:** This use case begins with a Government Administrator selecting a credential to revoke or put under investigation, and providing a mandatory reason.

**TUCEW:** This use case ends with the credential's status being set to Revoked or Investigation, QR verification for that credential being rejected immediately, the change being logged to the audit log, and the citizen being notified.

### View Audit Log

**TUCBW:** This use case begins with the Government Admin clicking on the view audit log page.

**TUCEW:** This use case ends with the Government admin being able to view the audit logs in a table format.

### POPIA Compliance

- **Section 8 - Accountability:** Administrative actions must be audit logged, system-triggered actions (e.g. automatic credential expiry) are logged without a human actor, since accountability for automated processing still applies under POPIA.
- **Section 15 - Further Processing Limitation:** Credential data must only be used for valid legal, administrative, or verification purposes.
- **Section 16 - Information Quality:** Credential records must remain accurate, current, and updated when authoritative source data changes.
- **Sections 19-22 - Security Safeguards:** Only authorised administrators may update, investigate, or reinstate credentials.

---

## 9. View Dashboards

The View Dashboards subsystem allows each authenticated user type to view a role-specific landing page summarising information relevant to them: citizens see their account and activity summary, officials see their own recent activity plus their institution's audit history, and government administrators see system-wide status, counts, and analytics.

![View Dashboards Use Case Diagram](../images/View_Dashboard.svg)

### View Citizen Dashboard

**TUCBW:** This use case begins with an authenticated Citizen navigating to their dashboard.

**TUCEW:** This use case ends with the Citizen's account summary, recent activity, and notifications displayed.

### View Official Dashboard

**TUCBW:** This use case begins with an authenticated Official navigating to their dashboard.

**TUCEW:** This use case ends with the Official's own recent activity displayed, and their institution's full audit history available to search and filter, with each such lookup itself recorded as an audit log entry.

### View Government Admin Dashboard

**TUCBW:** This use case begins with an authenticated Government Administrator navigating to their dashboard.

**TUCEW:** This use case ends with system status, headline counts, a system-wide activity feed, and analytics for the selected date range displayed.

### POPIA Compliance

- **Section 8 - Accountability:** An official viewing their institution's audit history is itself an audit-logged event, so access to that data is traceable, not just the data itself.
- **Section 10 - Minimality:** The official's institution history masks citizen ID numbers rather than displaying them in full. The admin's system-wide feed is restricted to an allow-list of institution/system-level events, excluding citizen-level data from a view that spans institution boundaries.
- **Sections 19-22 - Security Safeguards:** Each dashboard is restricted to its own role. Citizens, officials, and government administrators can't view one another's dashboard.
- **Section 23 - Access to Personal Information:** Citizens can view their own account and activity data.

---

## 10. View Government Admin Audit Logs

The Audit Logs subsystem allows an authenticated Government Administrator to view, search, and inspect the actions recorded across the platform, supporting oversight and investigation of credential, account, and institutional changes.

![Government Admin Audit Logs Use Case Diagram](../images/gov-audit-logs.drawio.svg)

### View government admin audit logs

**TUCBW:** This use case begins with an authenticated Government Administrator navigating to the audit logs page.

**TUCEW:** This use case ends with the paginated list of audit log entries displayed, showing the timestamp, action, user, role, entity, and details.

### Search government admin audit logs

**TUCBW:** This use case begins with the Government Administrator entering a search term, choosing an action, or setting a date range while viewing the audit logs list.

**TUCEW:** This use case ends with the list filtered to matching entries, with the result count and pagination updated accordingly.

### View government admin audit log details

**TUCBW:** This use case begins with the Government Administrator selecting an entry from the audit logs list to view its details.

**TUCEW:** This use case ends with the full detail record displayed.

### POPIA Compliance

- **Section 8 - Accountability:** Audit log entries record the actor, action and time of every critical operation, so administrative oversight is based on a traceable history.
- **Sections 19-22 - Security Safeguards:** Access to audit logs is restricted to the Government Administrator role; other roles cannot view system-wide audit history.
- **Section 23 - Access to Personal Information:** Audit log entries that reference a citizen or official's actions are only accessible to administrators for legitimate oversight purposes, not for general browsing.

---

## 11. Offline Verification

The Offline Verification subsystem lets a Citizen present a credential, and an Official verify it, when neither phone has an internet connection. The credential is prepared and signed while online, bound to the Citizen's phone, and checked entirely on the Official's phone against verification data cached while online. Scans made offline are added to the audit log when the Official's phone reconnects.

![Offline Verification Use Case Diagram](../images/offline-verification.drawio.svg)

### Prepare Offline Credential

**TUCBW:** This use case begins when a signed-in Citizen opens the FlashID home screen while online.

**TUCEW:** This use case ends with a signed offline package, bound to the Citizen's phone, stored encrypted on the phone for each active credential.

### Present Offline Code

**TUCBW:** This use case begins when a Citizen chooses to share a credential and selects the offline code, with or without a connection.

**TUCEW:** This use case ends with an animated QR code showing only the chosen fields, re-signed by the Citizen's phone every 5 seconds while it is displayed.

### Refresh Verification Data

**TUCBW:** This use case begins when an Official's phone is online and the Official opens FlashID or the scanner.

**TUCEW:** This use case ends with the issuer keys and a signed revocation list stored on the Official's phone, ready for offline verification.

### Verify Offline Code

**TUCBW:** This use case begins when an Official scans a Citizen's animated offline QR code.

**TUCEW:** This use case ends with the result shown on the Official's phone: the disclosed fields and portrait when verified, or a specific reason when refused.

### Sync Offline Verifications

**TUCBW:** This use case begins when an Official's phone that made offline scans regains a connection, signs in, or returns to the foreground.

**TUCEW:** This use case ends with each queued scan recorded once in the audit log and removed from the phone.

### POPIA Compliance

- **Section 10 - Minimality:** Only the fields the Citizen chooses to share leave the phone; every other field travels as a salted digest that reveals nothing.
- **Sections 19-22 - Security Safeguards:** Offline packages are encrypted on the device and bound to the Citizen's phone, recordings stop verifying within about 90 seconds, screenshots are blocked on the sharing screen, and offline data is wiped on sign-out.
- **Section 8 - Accountability:** Every offline scan is attributed to the Official who made it and recorded in the audit log, with the phone's time and the server's receipt time.
- **Section 11 - Consent:** An offline presentation happens only when the Citizen explicitly chooses to show the offline code.

---
