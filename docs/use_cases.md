# SA Digital ID Wallet — Use Case Overview  
**Tech Titans · COS 301 Capstone 2026**

---

## UC-01 — Upload an Institution (Hospital, Bank, Police, etc.)
**Actor:** Government Administrator  

### Description  
Registers an institution and issues a secure API key for integration with FlashID.

### Main Flow  
1. Admin submits institution details (name, type, registration number, email)  
2. System creates an `Institution` record  
3. System generates a secure API key  
4. API key is shared securely with the institution  
5. Audit log records `INSTITUTION_REGISTERED`

### POPIA Compliance  
- **Section 8 (Accountability):** Only authorised admins can register institutions  
- **Sections 19–22 (Security Safeguards):** API keys securely generated and managed  
- **Section 15 (Further Processing Limitation):** API keys used only for system communication  

---

## UC-02 — Onboard Citizen (Home Affairs Official) ((includes UC-04))((includes UC-05))
**Actor:** Home Affairs Official  
**Supporting Actor:** Mock Government Registry  

### Description  
Citizen is onboarded into FlashID after physical identity verification and explicit consent.

### Main Flow  
1. Official retrieves verified identity record from MockGov  
2. Official confirms identity physically  
3. Citizen provides explicit consent  
4. Official captures contact details (phone/email)  
5. System creates a pending FlashID account  
6. Activation link/OTP sent to citizen  
7. Audit log records onboarding

### POPIA Compliance  
- **Section 11 (Consent):** Explicit opt-in captured  
- **Section 10 (Minimality):** Only required identity data transferred  
- **Section 13 (Purpose Specification):** Data used only for onboarding  
- **Section 12 (Collection):** Data collected directly during process  
- **Sections 19–22 (Security):** Controlled API access to MockGov  
- **Sections 17–18 (Openness):** Citizen informed of data usage  

---

## UC-03 — Self-Register via Physical ID ((includes UC-04))
**Actor:** Citizen  
**Supporting Actor:** Mock Government Registry / Face Verification Service  

### Description  
Citizen activates a FlashID wallet using an existing physical ID document and identity verification checks.

### Main Flow  
1. Citizen selects “Activate with Physical ID”  
2. Citizen enters ID number and surname  
3. Citizen uploads physical ID photo  
4. Citizen completes selfie/liveness check  
5. System verifies identity against MockGov and face verification service  
6. If verification succeeds, citizen provides consent  
7. System creates wallet and issues available credentials  

### POPIA Compliance  
- **Section 11 (Consent):** Citizen explicitly consents before onboarding  
- **Section 10 (Minimality):** Only necessary identity data is retrieved and stored  
- **Section 13 (Purpose Specification):** Data used only for identity onboarding  
- **Sections 19–22 (Security Safeguards):** Strong verification reduces impersonation risk  
- **Sections 26–33 (Special Personal Information):** Biometric/face data must be handled with heightened protection  

---

## UC-04 — Activate Digital Wallet
**Actor:** Citizen  

### Description  
Citizen activates their FlashID wallet using an activation link or OTP.

### Main Flow  
1. Citizen receives activation link/OTP  
2. Citizen sets password  
3. System validates token  
4. Wallet is activated  
5. Credentials are made available  

### POPIA Compliance  
- **Section 11 (Consent):** User voluntarily activates account  
- **Section 19 (Security):** Secure authentication and password storage  
- **Section 23 (Access):** User gains access to their personal data  

---

## UC-05 — Issue National ID Credential
**Actor:** Government Administrator  

### Description  
A digital ID credential is issued based on verified government identity records.

### Main Flow  
1. Admin selects verified citizen  
2. System retrieves identity data from MockGov  
3. System creates a signed ID credential  
4. Credential stored in FlashID wallet  
5. Citizen notified  

### POPIA Compliance  
- **Section 16 (Information Quality):** Data sourced from authoritative registry  
- **Section 10 (Minimality):** Only essential identity attributes stored  
- **Section 26 (Special Personal Information):** ID number handled securely  
- **Sections 19–22 (Security):** Credential signed and protected  

---

## UC-06 — Issue Driver’s Licence Credential
**Actor:** Registered Institution / Government Administrator  

### Description  
A driver’s licence credential is issued after a successful driving test.

### Main Flow  
1. Institution sends API request confirming test pass  
2. System validates API key  
3. Credential created and signed  
4. Credential added to citizen wallet  
5. Citizen notified  

### POPIA Compliance  
- **Section 8 (Accountability):** Only authorised institutions can issue credentials  
- **Section 10 (Minimality):** Only licence-specific data stored  
- **Section 15 (Further Processing Limitation):** Data used only for licensing  
- **Sections 19–22 (Security):** API authentication enforced  

---

## UC-07 — View Credentials
**Actor:** Citizen  

### Description  
Citizen views stored credentials in their digital wallet.

### Main Flow  
1. Citizen logs in  
2. System retrieves credentials  
3. Credentials displayed securely  

### POPIA Compliance  
- **Section 23 (Access):** Users can access their own data  
- **Section 16 (Information Quality):** Data reflects latest state  
- **Section 19 (Security):** Secure access control enforced  

---

## UC-08 — Manage User Account
**Actor:** Citizen  

### Description  
Citizen manages basic account security settings, including updating their password.

### Main Flow  
1. Citizen logs into FlashID  
2. Citizen opens account settings  
3. Citizen selects “Change Password”  
4. System verifies current password or OTP  
5. Citizen enters new password  
6. System updates password securely  
7. Audit log records `PASSWORD_UPDATED`

### POPIA Compliance  
- **Section 19 (Security Safeguards):** Passwords are securely hashed and protected  
- **Section 23 (Access):** Citizen can manage access to their own account  
- **Section 8 (Accountability):** Security-related account changes are logged  

---

## UC-09 — Generate One-Time Verifiable QR Code
**Actor:** Citizen  

### Description  
Citizen generates a temporary QR code for identity verification.

### Main Flow  
1. Citizen selects a credential  
2. System creates a short-lived signed payload  
3. QR code generated with expiry timer  
4. QR displayed in app  

### POPIA Compliance  
- **Section 10 (Minimality):** QR contains no raw personal data  
- **Section 19 (Security):** Payload signed and time-limited  
- **Section 15 (Purpose Specification):** Used only for verification  

---

## UC-10 — Scan and Verify QR Code
**Actor:** Citizen 

### Description  
Verifier scans a QR code to validate a credential.

### Main Flow  
1. Verifier scans QR code  
2. System validates signature and expiry  
3. Credential status checked  
4. Minimal data returned  
5. QR marked as used  

### POPIA Compliance  
- **Section 10 (Minimality):** Only essential data displayed  
- **Section 15 (Purpose Specification):** Used only for verification  
- **Sections 19–22 (Security):** One-time use and signature validation  
- **Section 8 (Accountability):** Verification logged  

---
## UC-11 — Generate QR Code with Selective Disclosure
**Actor:** Citizen  

### Description  
Citizen generates a QR code and selects which credential fields may be disclosed to the verifier.

### Main Flow  
1. Citizen selects credential  
2. Citizen chooses disclosure profile  
3. System enforces mandatory minimum display fields  
4. Citizen selects optional fields to disclose  
5. System creates short-lived signed QR payload  
6. QR displayed with countdown timer  

### POPIA Compliance  
- **Section 10 (Minimality):** Only selected/necessary data is disclosed  
- **Section 11 (Consent):** Citizen controls optional disclosure  
- **Section 13 (Purpose Specification):** QR used only for verification  
- **Section 19 (Security Safeguards):** QR is signed, time-limited, and protected  

---

## UC-12 — Save Default Disclosure Preferences
**Actor:** Citizen  

### Description  
Citizen saves default preferences for what information should be shown during credential verification.

### Main Flow  
1. Citizen opens disclosure settings  
2. Citizen selects default fields per credential type  
3. System saves disclosure preferences  
4. Preferences are applied when generating future QR codes  

### POPIA Compliance  
- **Section 10 (Minimality):** Defaults reduce unnecessary disclosure  
- **Section 11 (Consent):** Citizen chooses disclosure preferences  
- **Section 23 (Access):** Citizen can view and change preferences  

---

## UC-13 — Request Additional Credential Information
**Actor:** Official  
**Supporting Actor:** Citizen  

### Description  
An official requests additional credential information during verification, and the citizen approves or denies the request.

### Main Flow  
1. Official scans citizen QR code  
2. Official requests additional fields  
3. Citizen receives request  
4. Citizen approves or denies disclosure  
5. If approved, system shows requested fields  
6. Audit log records disclosure event  

### POPIA Compliance  
- **Section 11 (Consent):** Citizen approves additional disclosure  
- **Section 10 (Minimality):** Only requested and approved fields are shared  
- **Section 8 (Accountability):** Disclosure request is logged  
- **Section 13 (Purpose Specification):** Information shared only for stated verification purpose  

---

## UC-14 — Update Credential Information
**Actor:** Government Administrator / Registered Institution  
**Supporting Actor:** Mock Government Registry  

### Description  
Credential information is updated when authoritative source data changes.

### Main Flow  
1. Government admin or registered institution submits update request  
2. System validates authority/API key  
3. System updates credential fields  
4. Credential is re-signed  
5. Citizen notified  
6. Audit log records `CREDENTIAL_UPDATED`

### POPIA Compliance  
- **Section 16 (Information Quality):** Credential remains accurate and up-to-date  
- **Section 8 (Accountability):** Updates are traceable  
- **Sections 19–22 (Security Safeguards):** Only authorised actors may update credentials  

---

## UC-15 — Update Trusted Devices
**Actor:** Citizen  

### Description  
Citizen manages trusted devices and can mark a device as lost or stolen.

### Main Flow  
1. Citizen logs into FlashID from a trusted device  
2. Citizen opens “Trusted Devices”  
3. System displays registered devices  
4. Citizen marks a device as lost/stolen  
5. System revokes that device session/token  
6. Audit log records `DEVICE_REVOKED`

### POPIA Compliance  
- **Section 19 (Security Safeguards):** Lost/stolen devices are blocked from accessing personal data  
- **Section 8 (Accountability):** Device changes are logged  
- **Section 23 (Access):** Citizen controls access to their account  

---

## UC-16 — Automatically Expire Credential
**Actor:** System  

### Description  
The system automatically inactivates credentials that have reached their expiry date (e.g., driver’s licences).

### Main Flow  
1. System checks credential expiry dates (scheduled job)  
2. If current date ≥ expiry date  
3. Credential status updated to `Expired`  
4. Audit log recorded  
5. Citizen may be notified  

### POPIA Compliance  
- **Section 16 (Information Quality):** Ensures credentials remain accurate and up-to-date  
- **Section 8 (Accountability):** System actions are logged and traceable  
- **Section 19 (Security Safeguards):** Automated processes prevent misuse of expired credentials  

---

## UC-17 — Revoke Credential
**Actor:** Government Administrator  

### Description  
A government administrator manually revokes or suspends a credential due to fraud, forgery, or investigation.

### Main Flow  
1. Admin selects a credential  
2. Admin marks credential as `Revoked` or `Under Investigation`  
3. System updates credential status  
4. Audit log recorded with admin details  
5. Citizen notified  

### POPIA Compliance  
- **Section 16 (Information Quality):** Ensures data reflects current legal status  
- **Section 8 (Accountability):** Admin actions are fully audit logged  
- **Section 15 (Further Processing Limitation):** Data used only for legal/verification purposes  
- **Sections 19–22 (Security):** Access restricted to authorised administrators  

---


## UC-18 — Generate Certified Copy of Credential
**Actor:** Citizen  

### Description  
Citizen generates a digitally certified copy of a credential for formal use.

### Main Flow  
1. Citizen selects credential  
2. Citizen selects “Generate Certified Copy”  
3. System creates signed certificate document  
4. Certified copy includes verification reference/QR  
5. Citizen downloads or shares document  

### POPIA Compliance  
- **Section 10 (Minimality):** Certified copy includes only required credential details  
- **Section 11 (Consent):** Citizen initiates generation  
- **Section 19 (Security Safeguards):** Copy is digitally signed and verifiable  

---

## UC-19 — Emergency QR Access
**Actor:** Emergency Official  
**Supporting Actor:** Citizen  

### Description  
Emergency officials scan a restricted emergency QR code to identify a citizen during emergencies.

### Main Flow  
1. Emergency official scans emergency QR  
2. System verifies official authorisation  
3. System validates QR and credential status  
4. System displays emergency-safe identity information  
5. Audit log records emergency access  

### POPIA Compliance  
- **Section 10 (Minimality):** Only emergency-relevant information is shown  
- **Section 13 (Purpose Specification):** Used only for emergency identification  
- **Sections 19–22 (Security Safeguards):** Only recognised emergency officials can access emergency information  
- **Section 8 (Accountability):** Emergency access is logged  

---

## UC-20 — Duress PIN / Honeypot Security Mode
**Actor:** Citizen  
**Supporting Actor:** Verifier / Security Monitoring System  

### Description  
If a citizen is forced to unlock the app, a duress PIN opens a restricted fake-safe mode and silently flags suspicious access.

### Main Flow  
1. Citizen enters normal PIN incorrectly multiple times  
2. Citizen enters duress PIN  
3. System opens limited safe-mode wallet  
4. Scanner/verifier sees controlled information  
5. System silently logs possible coercion/fraud event  
6. Security alert is created for review  

### POPIA Compliance  
- **Section 19 (Security Safeguards):** Protects citizen data during coercion or fraud risk  
- **Section 8 (Accountability):** Suspicious events are logged  
- **Section 15 (Further Processing Limitation):** Alert data used only for security investigation  

---
