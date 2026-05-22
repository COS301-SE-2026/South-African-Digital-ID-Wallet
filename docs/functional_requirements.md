# FlashID — Functional Requirements
**Tech Titans · COS 301 Capstone 2026**

---

# 4.1 Authentication and User Management Subsystem

## R1: User Registration and Authentication

The FlashID system shall provide secure authentication and identity onboarding functionality for citizens, government administrators, and verification officials.

---

### R1.1: Citizen Registration

The system shall allow South African citizens to securely register for a FlashID account.

#### R1.1.1:
The system shall allow citizens to register using:
- South African ID number
- Mobile number
- Email address

#### R1.1.2:
The system shall validate:
- ID number format
- Email format
- Password complexity requirements

#### R1.1.3:
The system shall prevent duplicate citizen registrations using the same South African ID number.

#### R1.1.4:
The system shall require citizens to verify their mobile number using OTP verification.

#### R1.1.5:
The system shall securely store citizen registration information in the backend database.

---

### R1.2: Citizen Login

The system shall provide secure login functionality for registered citizens.

#### R1.2.1:
The system shall allow login using:
- Email and password
- Mobile number and password

#### R1.2.2:
The system shall support biometric authentication including:
- Fingerprint authentication
- Facial recognition authentication

#### R1.2.3:
The system shall issue JWT authentication tokens upon successful login.

#### R1.2.4:
The system shall automatically expire inactive user sessions after a configurable timeout period.

#### R1.2.5:
The system shall securely log citizens out of all active sessions when requested.

---

### R1.3: Government Administrator Authentication

The system shall provide secure authentication for government administrators.

#### R1.3.1:
The system shall restrict administrator access to authorized personnel only.

#### R1.3.2:
The system shall support role-based administrator permissions.

#### R1.3.3:
The system shall support multi-factor authentication for administrators.

#### R1.3.4:
The system shall maintain audit logs of all administrator login attempts.

---

### R1.4: Verification Official Authentication

The system shall provide authentication mechanisms for verification officials.

#### R1.4.1:
The system shall allow officials to authenticate before performing credential verification.

#### R1.4.2:
The system shall associate each verification action with the authenticated official account.

---

# 4.2 Credential Management Subsystem

## R2: Digital Credential Issuance and Management

The FlashID system shall support the issuance, storage, management, and revocation of digital credentials.

---

### R2.1: Digital ID Credential Issuance

The system shall allow government administrators to issue digital identity credentials.

#### R2.1.1:
The system shall allow administrators to issue South African digital identity credentials to registered citizens.

#### R2.1.2:
The system shall generate a unique credential identifier for every issued credential.

#### R2.1.3:
The system shall cryptographically sign each credential using secure public/private key cryptography.

#### R2.1.4:
The system shall associate issued credentials with the correct citizen profile.

#### R2.1.5:
The system shall notify citizens when credentials have been successfully issued.

---

### R2.2: Driver’s Licence Credential Issuance

The system shall allow government administrators to issue digital driver’s licence credentials.

#### R2.2.1:
The system shall store:
- Licence number
- Vehicle classes
- Restrictions
- Expiry date
- Issuing office

#### R2.2.2:
The system shall automatically mark expired licences as inactive.

#### R2.2.3:
The system shall allow administrators to renew expired driver’s licences.

---

### R2.3: Credential Revocation

The system shall support credential revocation workflows.

#### R2.3.1:
The system shall allow administrators to revoke compromised credentials.

#### R2.3.2:
The system shall allow administrators to suspend credentials under investigation.

#### R2.3.3:
The system shall maintain credential statuses including:
- Active
- Suspended
- Revoked
- Expired

#### R2.3.4:
The system shall notify citizens when credential statuses change.

---

### R2.4: Secure Credential Storage

The system shall securely store citizen credentials.

#### R2.4.1:
The mobile application shall securely store credentials using encrypted local storage.

#### R2.4.2:
The system shall prevent unauthorized access to stored credentials.

#### R2.4.3:
The system shall support offline credential viewing for previously issued credentials.

#### R2.4.4:
The system shall prevent raw personally identifiable information from being exposed in QR payloads.

---

# 4.3 QR Verification Subsystem

## R3: Real-Time Credential Verification

The FlashID system shall support secure QR-based identity verification.

---

### R3.1: QR Code Generation

The system shall generate secure QR codes for credential presentation.

#### R3.1.1:
The system shall generate unique QR payloads linked to specific credentials.

#### R3.1.2:
The system shall cryptographically sign QR payloads.

#### R3.1.3:
The system shall generate time-limited QR verification sessions.

#### R3.1.4:
The QR payload shall not contain raw personally identifiable information.

---

### R3.2: QR Credential Verification

The system shall support real-time credential validation.

#### R3.2.1:
The system shall allow officials to scan QR codes using the verification portal.

#### R3.2.2:
The system shall validate:
- Credential authenticity
- Credential status
- Credential signature integrity

#### R3.2.3:
The system shall display verification results in real time.

#### R3.2.4:
The system shall reject:
- Expired credentials
- Revoked credentials
- Tampered credentials

#### R3.2.5:
The system shall automatically expire verification sessions after a predefined period.

---

### R3.3: Verification Logging

The system shall maintain verification audit records.

#### R3.3.1:
The system shall log:
- Verification timestamp
- Official identity
- Credential reference
- Verification outcome

#### R3.3.2:
The system shall associate verification records with authenticated officials.

---

# 4.4 Role-Based Access Control Subsystem

## R4: Role-Based Access Control

The FlashID system shall enforce secure role separation and authorization controls.

---

### R4.1: Role Separation

The system shall support the following roles:
- Citizen
- Verification Official
- Government Administrator

#### R4.1.1:
The system shall restrict users to functionality permitted by their assigned role.

#### R4.1.2:
The system shall prevent unauthorized privilege escalation.

---

### R4.2: Administrative Permissions

The system shall support administrator permission management.

#### R4.2.1:
The system shall allow privileged administrators to assign permissions.

#### R4.2.2:
The system shall allow privileged administrators to revoke permissions.

#### R4.2.3:
The system shall maintain audit logs for all permission changes.

---

# 4.5 Audit Logging and Compliance Subsystem

## R5: Audit Logging and Compliance

The FlashID system shall maintain comprehensive audit and compliance records.

---

### R5.1: Audit Logging

The system shall log all critical system actions.

#### R5.1.1:
The system shall log:
- Login attempts
- Credential issuance
- Credential revocation
- Verification attempts
- Permission changes

#### R5.1.2:
The system shall maintain immutable audit records.

#### R5.1.3:
The system shall associate all audit records with timestamps and actor identifiers.

---

### R5.2: POPIA Compliance

The system shall support POPIA-compliant identity management.

#### R5.2.1:
The system shall minimize exposure of citizen data during verification workflows.

#### R5.2.2:
The system shall encrypt sensitive data at rest.

#### R5.2.3:
The system shall encrypt sensitive data during transmission.

#### R5.2.4:
The system shall support traceability and accountability for all data access operations.

---

# 4.6 Notification Subsystem

## R6: Push Notifications and Alerts

The FlashID system shall notify users regarding important credential events.

---

### R6.1: Credential Notifications

The system shall send notifications for credential-related events.

#### R6.1.1:
The system shall notify citizens when credentials are issued.

#### R6.1.2:
The system shall notify citizens when credentials are revoked or suspended.

#### R6.1.3:
The system shall notify citizens when credential expiry dates are approaching.

---

### R6.2: Push Notification Support

The mobile application shall support push notifications.

#### R6.2.1:
The system shall deliver notifications to authenticated mobile devices.

#### R6.2.2:
The system shall allow users to view notification history.

---

# 4.7 Analytics and Reporting Subsystem

## R7: Analytics and Reporting

The FlashID system shall support administrative analytics and reporting functionality.

---

### R7.1: Verification Analytics

The system shall provide verification analytics dashboards.

#### R7.1.1:
The system shall display:
- Verification frequency
- Verification success rates
- Verification failure rates

#### R7.1.2:
The system shall generate analytics trends over time.

---

### R7.2: Administrative Reports

The system shall support report generation.

#### R7.2.1:
The system shall generate reports for:
- Issued credentials
- Revoked credentials
- Verification activity
- User activity

#### R7.2.2:
The system shall allow administrators to export reports.

---