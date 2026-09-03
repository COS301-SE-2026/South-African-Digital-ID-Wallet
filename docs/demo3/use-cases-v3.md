# SA Digital ID Wallet — Use Case Overview  
**Tech Titans · COS 301 Capstone 2026**

# Use Cases

The following use case diagrams represent the core FlashID workflows develpoed. These diagrams show the main system actors, system boundaries, and user-facing functions currently being implemented or demonstrated.

---
## 1. Authentication, Verification and Access Management

The Authentication, Verification and Access Management subsystem allows users to securely register, authenticate and verify their identity before accessing FlashID. The subsystem also provides additional device verification when a user attempts to access their account from an untrusted device.

![Authentication, Verification and Access Management Use Case Diagram](../images/authentication_use_case.drawio.svg)

### Register User Account

**TUCBW:** This use case begins when a Citizen chooses to register a FlashID account after being onboarded and provides the required registration information.

**TUCEW:** This use case ends when the Citizen's account has been successfully created and the email verification process has been initiated.

### Verify Email with OTP

**TUCBW:** This use case begins when a registered Citizen submits the OTP sent to their registered email address.

**TUCEW:** This use case ends when the OTP has been successfully validated and the Citizen's email address is marked as verified.

### Login

**TUCBW:** This use case begins when a User submits their FlashID login credentials.

**TUCEW:** This use case ends when the User's credentials have been successfully authenticated and either access is granted for a trusted device or device verification is required for an untrusted device.

### Verify Device by OTP

**TUCBW:** This use case begins when a User attempting to log in from an untrusted device submits the device verification OTP sent to their registered email address.

**TUCEW:** This use case ends when the OTP has been successfully validated, the device has been recorded as trusted, and the User's authenticated session is established.

### Resend OTP 

**TUCBW:** This use case begins when a User requests a new OTP after the original code has not been received or can no longer be used.

**TUCEW:** This use case ends when a new OTP has been generated, the verification expiry period has been refreshed, and the new OTP has been sent to the User's registered email address.

### POPIA Compliance
- **Section 8 — Accountability:** FlashID must ensure that authentication, email verification, and device verification processes comply with POPIA and that access to user accounts is appropriately controlled.

- **Section 10 — Minimality:** Only personal information necessary to authenticate users, verify email addresses, and identify trusted devices may be collected and processed.

- **Section 13 — Purpose Specification:** User credentials, OTPs, device information, IP addresses, and approximate location data may only be processed for authentication, verification, account security, and trusted-device management.

- **Section 14 — Retention and Restriction of Records:** Authentication and verification information must not be retained for longer than necessary. Temporary information such as OTPs must expire after the defined verification period.

- **Section 15 — Further Processing Limitation:** Authentication, device, IP address, and location information must not be reused for purposes incompatible with the security and verification purposes for which it was collected.

- **Section 18 — Notification to Data Subject:** Users must be informed of the personal information collected during registration and authentication, including device and approximate location information where applicable, and the purpose for which it is processed.

- **Sections 19–22 — Security Safeguards:** Passwords, OTPs, authentication tokens, and trusted-device tokens must be appropriately protected. FlashID must implement safeguards such as password hashing, expiring OTPs, secure HttpOnly cookies, access control, and authentication audit logging.

---
## 2. Upload an Institution

The Upload an Institution subsystem allows a government administrator to upload institution data, verify the institution, generate an institution API key, and view the API key after registration.

![Upload Institution Use Case Diagram](../images/Upload_an_Institution.svg)

### POPIA Compliance

- **Section 8 — Accountability:** Only authorised government administrators may register and verify institutions.
- **Section 13 — Purpose Specification:** Institution data and API keys are used only for authorised FlashID integration.
- **Section 15 — Further Processing Limitation:** API keys must only be used for approved communication between FlashID and registered institutions.
- **Sections 19–22 — Security Safeguards:** API keys must be securely generated, stored, displayed, and managed.

---
## 3. Onboard Citizen

The Onboard Citizen subsystem allows a Home Affairs official to retrieve a citizen identity record, capture citizen consent, capture contact details, register a pending FlashID account, and send an activation code.

![Onboard Citizen Use Case Diagram](../images/Onboard_Citizen.svg)

### POPIA Compliance

- **Section 8 — Accountability:** The official’s onboarding actions will be logged.
- **Section 10 — Minimality:** Only necessary identity and contact details is be captured.
- **Section 11 — Consent:** Explicit citizen consent must be captured before onboarding.
- **Section 12 — Collection Directly from Data Subject:** Contact details and consent are collected directly from the citizen.
- **Section 13 — Purpose Specification:** Citizen data is used for FlashID onboarding.
- **Sections 17–18 — Openness:** Citizens are to be informed about how their data will be used.
- **Sections 19–22 — Security Safeguards:** Identity records, activation codes, and contact details must be securely processed.

---
## 4. Citizen Registration

The Citizen Registration subsystem allows citizens to register for a FlashID account. Registration may occur using an activation code or through physical ID verification.

![Citizen Registration Use Case Diagram](../images/Citizen_Registration.svg)

### POPIA Compliance

- **Section 10 — Minimality:** Registration should only collect the information required to create and verify the account.
- **Section 11 — Consent:** Citizens voluntarily register and activate their FlashID account.
- **Section 12 — Collection Directly from Data Subject:** Registration information is collected directly from the citizen where possible.
- **Section 13 — Purpose Specification:** Registration data is used to create and activate the FlashID account.
- **Section 19 — Security Safeguards:** Activation codes, passwords, and identity verification steps must be securely handled.

---
## 5. Issue Credentials

The Issue Credentials subsystem allows authorised officials to verify a citizen and issue signed digital credentials. The system supports generating signed digital IDs and signed digital driver’s licences, then notifying the citizen once the credential has been issued.

![Issue Credentials Use Case Diagram](../images/Issue_Credentials_UC_Diagram.svg)

### Search & View Citizen Status

**TUCBW:** This use case begins with an Official entering a citizen's SA ID number into the admin portal to look them up.

**TUCEW:** This use case ends with the citizen's FlashID status, profile detials, and any existing credentials being displayed to the Official or an error if no matching citizen is found.

---

### Capture Citizen Consent

**TUCBW:** This use case begins with an Official confirming the citizen is Activated in FlashID and selecting a credential type to issue to the citizen.

**TUCEW:** This use case ends with the Official confirming POPIA Section 11 consent and the consent is recorded to the audit trail, or the action is blocked and the Official is shown an error because consent was not given.

---

### Generate Signed Identity Document Credential

**TUCBW:** This use case begins with an Official initiating the issuance of a identity document credential.

**TUCEW:** This use case ends with the citizen's identity document record retrieved from the government registry (POPIA Section 10 & 16), signed (POPIA Section 19-22) and stored in FlashID as an Active credential linked to the citizen (POPIA Section 13) and an audit log entry has been recorded.

---

### Generate Signed Driver's License Credential

**TUCBW:** This use case begins with an Official initiating the issuance of a driver's license credential.

**TUCEW:** This use case ends with the citizen's driver's license record retrieved from the government registry (POPIA Section 10 & 16), signed (POPIA Section 19-22) and stored in FlashID as an Active credential linked to the citizen (POPIA Section 13) and an audit log entry has been recorded.

---

### Notify Citizen

**TUCBW:** This use case begins with a new credential having been successfully persisted for a citizen.

**TUCEW:** This use case ends with an in-app notification created for the citizen, indicating that their new credential has been added to their FlashID wallet.

### POPIA Compliance

- **Section 10 — Minimality:** Only the data required to issue the credential should be processed.
- **Section 11 — Consent:** Credential issuing should occur after the citizen has been onboarded and consent has been captured.
- **Section 13 — Purpose Specification:** Citizen data is processed only for credential issuing.
- **Section 16 — Information Quality:** Credentials should be generated from verified citizen records.
- **Sections 19–22 — Security Safeguards:** Credentials must be digitally signed and protected from tampering.

---

## 6. Access Credentials

The Access Credentials subsystem allows citizens to log in, view their credentials, generate certified copies, generate QR codes, scan QR codes, and control selective disclosure preferences.

![Access Credentials Use Case Diagram](../images/Access_Credentials.svg)

### POPIA Compliance

- **Section 10 — Minimality:** QR codes and selective disclosure should expose only the minimum required information.
- **Section 11 — Consent:** Citizens choose when to generate QR codes, certified copies, and disclosure preferences.
- **Section 13 — Purpose Specification:** Credential information is shared only for verification or certified copy purposes.
- **Section 19 — Security Safeguards:** Access to credentials must be protected through authentication and secure QR generation.
- **Section 23 — Access to Personal Information:** Citizens can view and access their own credential information.

---
## 7. Account Management

The Account Management subsystem allows citizens to maintain their FlashID account details and security settings. This includes changing passwords, updating usernames, updating contact details, and managing trusted devices.

![Account Management Use Case Diagram](../images/Account_Management.svg)

### POPIA Compliance

- **Section 8 — Accountability:** Account changes must be logged and traceable.
- **Section 10 — Minimality:** Only required account and contact information should be collected or updated.
- **Section 11 — Consent:** Citizens voluntarily initiate updates to their own account information.
- **Section 19 — Security Safeguards:** Password changes and trusted device management protect citizen data from unauthorised access.
- **Section 23 — Access to Personal Information:** Citizens are able to access and manage their own personal account information.

---
## 8. Credentials Management

The Credentials Management subsystem allows the system and government administrators to manage the lifecycle of citizen credentials. This includes expiring driver’s licences, reactivating renewed licences, updating citizen credentials, investigating credentials, and viewing audit logs.

![Credentials Management Use Case Diagram](../images/Credentials_Management_v2.svg)

### Automatically Expire Credential

**TUCBW:** This use case begins with the system's scheduled credential expiry check running (automatically every day at 00:00 SAST, or manually triggered by a Government Administrator as a testing action) and identifying an Active driver's license credential whose expiry date has passed.

**TUCEW:** This use case ends with the credential's status being updated to Expired, an audit log entry being recorded, and the citizen being notified of the expiration in-app.

### Update Citizen Credentials

**TUCBW:** This use case begins with the system's scheduled update citizen credentials check running (automatically every day at 00:00 SAST, or manually triggered by a Government Administrator as a testing action) and updating any credentials in FlashID that have been updated in the Government Registry.

**TUCEW:** This use case ends with the citizen's personal details and/or credentials being updated to match the Government Registry, the credential being re-signed with a fresh Ed25519 signature where applicable, an audit log entry being recorded for each change, and the citizen being notified of the update in-app.

### Reactivate Driver's License

**TUCBW:** This use case begins with a Government Administrator selecting a credential currently under Investigation or Revoked, and choosing to lift that status.

**TUCEW:** This use case ends with the credential's status being restored to Active and the credential resigned. The status change being logged to the audit log, and the citizen being notified.

### Revoke Credential

**TUCBW:** This use case begins with a Government Administrator selecting a credential to revoke or put under investigation, and providing a mandatory revocation reason.

**TUCEW:** This use case ends with the credential's status being set to Revoked/Under Investigation, QR verification for that credential immediately returning INVALID, the revocation being logged to the audit log, and the citizen being notified.

### View Audit Log

**TUCBW:** This use case begins with the Government Admin clicking on the view audit log page.

**TUCEW:** This use case ends with the Government admin being able to view the immutable audit logs in a table format.

### POPIA Compliance

- **Section 8 — Accountability:** Administrative actions must be audit logged, system-triggered actions (e.g. automatic credential expiry) are logged without a human actor, since accountability for automated processing still applies under POPIA.
- **Section 15 — Further Processing Limitation:** Credential data must only be used for valid legal, administrative, or verification purposes.
- **Section 16 — Information Quality:** Credential records must remain accurate, current, and updated when authoritative source data changes.
- **Sections 19–22 — Security Safeguards:** Only authorised administrators may update, investigate, or reactivate credentials.

## 8. View Dashboards

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