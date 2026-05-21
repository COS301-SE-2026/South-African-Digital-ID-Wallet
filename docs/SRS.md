# Software Requirements Specification (SRS)
# FlashID — South African Digital ID Wallet

> COS 301 Capstone Project 2026  
> Team: Tech Titans  
> Client: Agile Bridge (Pty) Ltd  
> Version: 0.1 Draft

---

# Table of Contents

1. Introduction  
2. System Overview  
3. User Characteristics / Stories and Actors  
4. Functional Requirements  
5. Use Cases  
6. API Service Contracts  
7. Domain Model  
8. Architectural Requirements  
9. Technology Requirements  
10. Constraints and Assumptions  
11. Non-Functional Requirements  
12. Future Enhancements  

---

# 1. Introduction

## 1.1 Purpose

FlashID is a secure South African Digital Identity Wallet system that enables citizens to digitally store, manage, and present government-issued credentials such as South African IDs and driver's licences.

The system aims to reduce dependency on fragile physical identity documents and replace insecure identity-sharing practices such as sending ID copies over WhatsApp or email.

The solution provides:
- Secure digital identity storage
- Cryptographically signed credentials
- QR-based identity verification
- Role-based administrative management
- Real-time credential validation
- Comprehensive audit logging

The system consists of:
- A citizen mobile wallet application
- A web-based verification portal
- A government administrative dashboard
- An officials administrative dashboard

---

## 1.2 Business Problem

In South Africa, identity verification still heavily depends on physical documentation. Lost, stolen, or forged identity documents create major risks for citizens, government institutions, banks, hospitals, and law enforcement agencies.

FlashID addresses these issues through:
- Digital identity credentials
- Cryptographic verification
- Real-time QR validation
- Secure mobile credential storage
- Controlled identity disclosure

---

## 1.3 Scope

The FlashID prototype will:
- Allow citizens to onboard and access a digital identity wallet
- Allow authorized government administrators to issue credentials
- Allow officials to verify credentials through QR scanning
- Support credential revocation and audit tracking
- Demonstrate secure, scalable identity verification workflows

The prototype will simulate institutional integrations using mock or controlled government services.

---

# 2. System Overview

FlashID is a multi-platform digital identity ecosystem consisting of:

| Platform | Purpose |
|---|---|
| Citizen Mobile App | Stores and presents digital credentials |
| Official Verification Portal | Allows verification of credentials |
| Government Admin Dashboard | Allows credential issuance and management |

The system follows CLEAN Architecture principles to separate:
- Business logic
- Infrastructure concerns
- Presentation logic
- Data persistence

---

# 3.1 User Characteristics and Actors

## 3.1.1 Citizen

A South African citizen who:
- Registers for FlashID
- Stores digital credentials
- Authenticates securely
- Presents credentials using QR codes
- Scan QR codes
- Receives status notifications

---

## 3.1.2 Government Administrator

Authorized personnel who:
- Issue credentials
- Revoke credentials
- Manage citizen onboarding
- View audit logs
- Manage verification workflows

---

## 3.1.3 Official

External authorized entities such as:
- Banks
- Hospitals
- Police officers
- Insurance agencies
- DLTC
- Home Affairs

Officials may:
- Verify credentials
- Receive limited verification data
- Validate authenticity in real time
- Communicate with FlashID to send citizen data to the system

---

# 3.2 Epics and User Stories

## 3.2.1 Epic 1: Identity Onboarding & Citizen Registration
#### US - 1.1
As a Home Affairs official, I want to retrieve a citizen's verified identity record from the government registry, so that I can onboard them into FlashID using authoritative data.

#### US - 1.2
As a Home Affairs official, I want to capture a citizen's explicit consent before creating their FlashID account, so that their data is processed lawfully under POPIA Section 11.

#### US - 1.3
As a Home Affairs official, I want to capture a citizen's contact detaisl (phone and/or email) during onboarding, so that the citizen can receive their activation link and future notifications

#### US - 1.4
As a Home Affairs official, I want to send an activation link or OTP to the citizen after onboarding, so that the citizen can securely activate their wallet at their own convenience before the activation code expires.

#### US - 1.5
As a citizen, I want to register on FlashID using my physical ID document and a selfie, so that I can activate my digital wallet without visiting a Home Affairs office.

#### US - 1.6
As a citizen, I want to provide explicit consent before my identity data is processed during self-registration, so that I understand and agree to how my personal information will be used.

#### US - 1.7
As a citizen, I want to receive feedback when my identity verification fails during registration, so that I know what went wrong and can take corrective action.

#### US - 1.8
As a citizen, I want to set up biometric authentication (fingerprint or face) when activating my wallet, so that I can log in securely without typing a password each time.

#### US - 1.9
As a citizen, I want to provide explicit consent before my identity data is processed during registration with an activation code, so that I understand and agree to how my personal information will be used.

#### US - 1.10
As a citizen, I want to request a new activation link if mine has expired, so that I am not permanently locked out of activating my account.

---

## 3.2.2 Epic 2: Authentication & Role Based Access Control (RBAC)

#### US - 2.1
As a citizen, I want to log into my account and see the citizen's portal, so that I have no access to another user's portal.

#### US - 2.2
As a citizen, I want to be able to register with a username, ID, and password, so that my account can be uniquely identified.

---

## 3.2.3 Epic 3: Institution Registration & API Key Management

#### US - 3.1
As a government administrator, I want to register an institution (bank, hospital, police station, insurance agency) with the system, so that verified institutions can integrate with FlashID and perform credential verification.

#### US - 3.2
As a government administrator, I want to view all registered institutions and their status, so that I can manage which institutions are authorised to access the system.

#### US - 3.3
As a government administrator, I want to regenerate an institution's API key, so that I can revoke access if a key is compromised without removing the institution.

#### US - 3.4
As a government administrator, I want to view and search for institutions that have been registered by institution name, institution type, institution verification number, or the government admin that registered the institution.

---

## 3.2.4 Epic 4: Digital Credential Issuance

#### US - 4.1
As a government administrator, I want to issue a digital National ID credential to a registered citizen, so that the citizen can use their digital ID for secure identity verification.

#### US - 4.2
As a government administrator, I want to search for a citizen by ID number or name before issuing a credential, so that I can confirm I am issuing to the correct person.

#### US - 4.3
As a registered institution, I want to submit a credential issuance request via the API after a citizen passes their driving test, so that the citizen's digital driver's licence is automatically issued to their wallet.

#### US - 4.4 ########################################### COME BACK


#### US - 4.5
As a citizen, I want to receive a push notification when a new credential is issued to my wallet, so that I am aware of all credentials issued in my name.

---

## 3.2.5 Epic 5: Credential Wallet & Viewing

#### US - 5.1
As a citizen, I want to view all credentials stored in my digital wallet, so that I can see what digital documents I have and their current status.

#### US - 5.2
As a citizen, I want to view the full details of an individual credential, so that I can confirm the information on my digital document is correct.

#### US - 5.3
As a citizen, I want to access my stored credentials when I have no internet connection, so that I can still present my identity in areas with poor connectivity.

---

## 3.2.6 Epic 6: QR Code Generation & Selective Disclosure

#### US - 6.1
As a citizen, I want to generate a one-time QR code for a selected credential, so that an official can verify my identity without seeing my raw personal data.

#### US - 6.2
As a citizen, I want to see a clear expiry countdown and be notified when my QR code expires, so that I know when to regenerate it during a verification interaction.	

#### US - 6.3
As a citizen, I want to choose which fields from my credential are disclosed when I generate a QR code, so that I share only the minimum personal information needed for each verification.

#### US - 6.4

As a citizen, I want to see exactly which of my fields will be visible to the verifier before confirming QR generation, so that I can make an informed disclosure decision.	

#### US - 6.5
As a citizen, I want to save my preferred disclosure settings per credential type, so that I don't have to manually select fields every time I generate a QR code.

#### US - 6.6
As a citizen, I want to save my preferred disclosure settings per verifier type (hospital, police, home affairs, DLTC), so that I don't have to manually select fields every time I generate a QR code.

---

## 3.2.7 Epic 7: Cryptographic Security & Key Management

#### US - 7.1
As a government administrator, issuing a credential must result in it being signed with Ed25519 at the point of issuance, so that any tampering is mathematically detectable.

#### US - 7.2
As a registered institution, an API Key credential must be cryptogrpahically signed on creation, so authenticity and integrity of the API key is guarenteed.

#### US - 7.3
As an official, the system must perform a live signature verification on every QR scan, so that I can trust the result is based on the current state of the credential.

#### US - 7.4
As a government administrator, a credential must be re-signed after every update, so that the updated credential carries a fresh, valid signature.

---

## 3.2.8 Epic 8: Credential Verification

#### US - 8.1
As an official, I want to scan a citizen's QR code to verify their credential in real time, so that I can confirm their identity instantly without requiring a physical document.

#### US - 8.2
As an official, I want to manually enter a credential token when QR scanning is not possible, so that I can still verify credentials if the camera is unavailable.

#### US - 8.3
As an official, I want to see a clear 'VALID' or 'INVALID' result with the reason for failure, so that I can take the correct action and inform the citizen appropriately.

#### US - 8.4
As an official, I want to request additional credential fields from a citizen during verification, so that I can access information needed for my specific use case beyond the default disclosure.

#### US - 8.5
As a citizen, I want to approve or deny an official's request for additional credential information, so that I remain in control of what personal data I share during verification.

---

## 3.2.9 Epic 9: Credential Lifecycle Management

#### US - 9.1
#### US - 9.2
#### US - 9.3
#### US - 9.4
#### US - 9.5
#### US - 9.6

---

## 3.2.10 Epic 10: Audit Logging & POPIA Compliance

---

## 3.2.11 Epic 11: Account Management & Device Security

---

## 3.2.12 Epic 12: Advanced Features & Certified Documents

---

# 4. Functional Requirements

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

# 5. Use Cases


---

# 6. API Service Contracts

---
# 7. Domain Model


---

# 8. Architectural Requirements

---
# 9. Technology Requirements

| Category | Technology |
|---|---|
| Frontend | Next.js + React |
| Mobile | React Native (Expo) |
| Backend | ASP.NET Core Web API |
| Database | Azure SQL + Cosmos DB |
| ORM | Entity Framework Core |
| Authentication | ASP.NET Identity + JWT |
| Mapping | AutoMapper |
| Hosting | Azure App Services |
| CI/CD | GitHub Actions |

---

# 10. Constraints and Assumptions

## Constraints
- No live government integrations during prototype phase
- POPIA compliance required
- Must support mobile and web platforms
- Must use Azure infrastructure

## Assumptions
- Citizens possess smartphones
- Institutions have internet access
- Mock integrations represent real-world systems

---

# 11. Non-Functional Requirements

## Security


## Performance


## Reliability


## Maintainability
- Modular CLEAN Architecture
- Repository pattern

## Accessibility
- Responsive mobile-first design
- WCAG-conscious UI implementation

---

# 12. Future Enhancements

Potential future features include:
- Passport credentials
- Vehicle registration credentials
- Offline verification mode
- Blockchain-backed audit trails
- International interoperability
- NFC credential verification
- Selective disclosure verification
- Digital birth certificates
