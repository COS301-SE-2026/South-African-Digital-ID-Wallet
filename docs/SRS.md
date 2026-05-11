# Software Requirements Specification
## South African Digital ID Wallet

**Document Version:** 1.0  
**Last Updated:** May 3, 2026  
**Status:** DRAFT

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [User Stories & User Characteristics](#2-user-stories--user-characteristics)
3. [Functional Requirements](#3-functional-requirements)
4. [API Service Contracts](#4-api-service-contracts)
5. [Domain Model](#5-domain-model)
6. [Use Cases](#6-use-cases)
7. [Architectural Requirements](#7-architectural-requirements)
8. [Quality Requirements](#8-quality-requirements)
9. [Technology Requirements](#9-technology-requirements)
10. [Appendix](#appendix)

---

## 1. Introduction

### 1.1 Business Need

South Africa faces significant challenges in identity verification and credential management across public and private sectors. Currently, citizens rely on physical documents (national IDs, driver's licenses, passports) for identity verification, which are:
- **Vulnerable to fraud** - Physical documents can be forged, lost, or stolen
- **Inefficient** - Manual verification processes are time-consuming and error-prone
- **Inaccessible** - Citizens in remote areas struggle to access verification services
- **Non-compliant** - Physical document systems lack modern audit trails and regulatory compliance mechanisms

The **South African Digital ID Wallet (FlashID)** addresses these challenges by providing a secure, verifiable digital identity ecosystem. It enables:
- Citizens to maintain verified digital credentials in a secure mobile wallet
- Government agencies and institutions to issue, verify, and manage credentials electronically
- Privacy-preserving selective disclosure (sharing only necessary information)
- Full POPIA compliance and audit trails for all identity operations

### 1.2 Audience
This document is intended for:
- **Tech Titans (Development Team)**
- **Agile Bridge (Pty) Ltd (Industry Client)**
- **Industry Mentors — Marco McLaren**
- **COS 301 Lecturers & Assistant Lecturers — University of Pretoria**
- **External evaluators**

---

## 2. User Stories & User Characteristics

### 2.1 Epics & User Stories

#### E01: Identity Onboarding & Citizen Registration
**Compliance:** POPIA | **Actors:** Citizen, Official | **User Stories:** 10 | **Related Use Cases:** 3

| ID | User Story | Priority |
|----|-----------|----------|
| US-02.1 | As a Home Affairs official, I want to retrieve a citizen's verified identity record from the government registry, so that I can onboard them into FlashID using authoritative data. | HIGH |
| US-02.2 | As a Home Affairs official, I want to capture a citizen's explicit consent before creating their FlashID account, so that their data is processed lawfully under POPIA Section 11. | HIGH |
| US-02.3 | As a Home Affairs official, I want to capture a citizen's contact details (phone and email) during onboarding, so that the citizen can receive their activation link and future notifications. | HIGH |
| US-02.4 | As a Home Affairs official, I want to send an activation link or OTP to the citizen after onboarding, so that the citizen can securely activate their wallet at their own convenience. | HIGH |
| US-03.1 | As a citizen, I want to self-register on FlashID using my physical ID document and a selfie, so that I can activate my digital wallet without visiting a Home Affairs office. | HIGH |
| US-03.2 | As a citizen, I want to provide explicit consent before my identity data is processed during self-registration, so that I understand and agree to how my personal information will be used. | HIGH |
| US-03.3 | As a citizen, I want to receive feedback when my identity verification fails during self-registration, so that I know what went wrong and can take corrective action. | MEDIUM |
| US-04.1 | As a citizen, I want to activate my FlashID wallet using the activation link or OTP I received, so that I can start using my digital credentials. | HIGH |
| US-04.2 | As a citizen, I want to set up biometric authentication (fingerprint or face) when activating my wallet, so that I can log in securely without typing a password each time. | HIGH |
| US-04.3 | As a citizen, I want to request a new activation link if mine has expired, so that I am not permanently locked out of activating my account. | MEDIUM |

---

#### E02: Authentication & Role-Based Access Control
**Compliance:** POPIA | **Actors:** Citizen, Official, Gov Admin | **User Stories:** 4 | **Related Use Cases:** 2

| ID | User Story | Priority |
|----|-----------|----------|
| US-04.1 | As a citizen, I want to activate my wallet and set a password on my first login, so that I have a secure initial authentication mechanism. | HIGH |
| US-04.2 | As a citizen, I want to set up biometric authentication (fingerprint or face) when activating my wallet, so that I can log in securely without typing a password each time. | HIGH |
| US-08.1 | As a citizen, I want to change my password from within my account settings, so that I can keep my account secure if I believe my credentials have been compromised. | HIGH |
| US-08.2 | As a citizen, I want to reset my password via email or phone if I have forgotten it, so that I can regain access to my wallet without contacting support. | HIGH |

---

#### E03: Institution Registration & API Key Management
**Compliance:** POPIA | **Actors:** Gov Admin, Institution | **User Stories:** 3 | **Related Use Cases:** 1

| ID | User Story | Priority |
|----|-----------|----------|
| US-01.1 | As a government administrator, I want to register an institution (bank, hospital, police station, insurance agency) with the system, so that verified institutions can integrate with FlashID and perform credential verification. | HIGH |
| US-01.2 | As a government administrator, I want to view all registered institutions and their status, so that I can manage which institutions are authorised to access the system. | HIGH |
| US-01.3 | As a government administrator, I want to regenerate an institution's API key, so that I can revoke access if a key is compromised without removing the institution. | HIGH |

---

#### E04: Digital Credential Issuance
**Compliance:** POPIA | **Actors:** Gov Admin, Institution, Citizen | **User Stories:** 5 | **Related Use Cases:** 2

| ID | User Story | Priority |
|----|-----------|----------|
| US-05.1 | As a government administrator, I want to issue a digital National ID credential to a registered citizen, so that the citizen can use their digital ID for secure identity verification. | HIGH |
| US-05.2 | As a government administrator, I want to search for a citizen by ID number or name before issuing a credential, so that I can confirm I am issuing to the correct person. | HIGH |
| US-06.1 | As a registered institution (e.g. driving test centre), I want to submit a credential issuance request via the API after a citizen passes their driving test, so that the citizen's digital driver's licence is automatically issued to their wallet. | HIGH |
| US-06.2 | As a government administrator, I want to manually issue a Driver's Licence credential to a citizen in the admin portal, so that I can handle edge cases where API-based issuance is not possible. | MEDIUM |
| US-06.3 | As a citizen, I want to receive a push notification when a new credential is issued to my wallet, so that I am aware of all credentials issued in my name. | MEDIUM |

---

#### E05: Credential Wallet & Viewing
**Actors:** Citizen | **User Stories:** 3 | **Related Use Cases:** 1

| ID | User Story | Priority |
|----|-----------|----------|
| US-07.1 | As a citizen, I want to view all credentials stored in my digital wallet, so that I can see what digital documents I have and their current status. | HIGH |
| US-07.2 | As a citizen, I want to view the full details of an individual credential, so that I can confirm the information on my digital document is correct. | HIGH |
| US-07.3 | As a citizen, I want to access my stored credentials when I have no internet connection, so that I can still present my identity in areas with poor connectivity. | MEDIUM |

---

#### E06: QR Code Generation & Selective Disclosure
**Compliance:** POPIA | **Actors:** Citizen | **User Stories:** 5 | **Related Use Cases:** 3

| ID | User Story | Priority |
|----|-----------|----------|
| US-09.1 | As a citizen, I want to generate a one-time QR code for a selected credential, so that an official can verify my identity without seeing my raw personal data. | HIGH |
| US-09.2 | As a citizen, I want to see a clear expiry countdown and be notified when my QR code expires, so that I know when to regenerate it during a verification interaction. | MEDIUM |
| US-11.1 | As a citizen, I want to choose which fields from my credential are disclosed when I generate a QR code, so that I share only the minimum personal information needed for each verification. | HIGH |
| US-11.2 | As a citizen, I want to see exactly which of my fields will be visible to the verifier before confirming QR generation, so that I can make an informed disclosure decision. | HIGH |
| US-12.1 | As a citizen, I want to save my preferred disclosure settings per credential type, so that I don't have to manually select fields every time I generate a QR code. | MEDIUM |

---

#### E07: Cryptographic Security & Key Management
**Compliance:** POPIA | **Actors:** Gov Admin, Institution, System | **User Stories:** 4 | **Related Use Cases:** 5

| ID | User Story | Priority |
|----|-----------|----------|
| US-05.1 | As a government administrator, I want credentials to be signed with Ed25519 at issuance, so that their authenticity and integrity can be cryptographically verified. | HIGH |
| US-06.1 | As a registered institution, I want API-initiated credentials to be signed on creation, so that the credential is cryptographically valid from the moment of issuance. | HIGH |
| US-10.1 | As an official, I want the credential signature to be verified on every QR scan via a live backend call, so that I can be certain the credential has not been tampered with. | HIGH |
| US-14.1 | As a government administrator, I want credentials to be re-signed after every update, so that modifications are authenticated and the credential integrity is maintained. | HIGH |

---

#### E08: Credential Verification
**Compliance:** POPIA | **Actors:** Official, Citizen | **User Stories:** 5 | **Related Use Cases:** 2

| ID | User Story | Priority |
|----|-----------|----------|
| US-10.1 | As an official, I want to scan a citizen's QR code to verify their credential in real time, so that I can confirm their identity instantly without requiring a physical document. | HIGH |
| US-10.2 | As an official, I want to manually enter a credential token when QR scanning is not possible, so that I can still verify credentials if the camera is unavailable. | MEDIUM |
| US-10.3 | As an official, I want to see a clear VALID or INVALID result with the reason for failure, so that I can take the correct action and inform the citizen appropriately. | HIGH |
| US-13.1 | As an official, I want to request additional credential fields from a citizen during a verification, so that I can access information needed for my specific use case beyond the default disclosure. | MEDIUM |
| US-13.2 | As a citizen, I want to approve or deny an official's request for additional credential information, so that I remain in control of what personal data I share during verification. | MEDIUM |

---

#### E09: Credential Lifecycle Management
**Compliance:** POPIA | **Actors:** Gov Admin, Institution, System, Citizen | **User Stories:** 6 | **Related Use Cases:** 3

| ID | User Story | Priority |
|----|-----------|----------|
| US-14.1 | As a government administrator, I want to update a citizen's credential details when authoritative source data changes, so that the citizen's digital credential remains accurate and legally valid. | HIGH |
| US-14.2 | As a registered institution, I want to submit a credential update via the API when relevant information changes, so that citizen credentials reflect up-to-date, authoritative data. | HIGH |
| US-16.1 | As the system, I want to automatically update the status of credentials that have reached their expiry date to 'Expired', so that expired credentials can no longer be used for verification. | HIGH |
| US-16.2 | As the system, I want to send advance expiry warning notifications to citizens before their credential expires, so that citizens can take action before losing access to a valid credential. | MEDIUM |
| US-17.1 | As a government administrator, I want to revoke a citizen's credential due to fraud, forgery, or investigation, so that the compromised credential is immediately invalidated and can no longer be used for verification. | HIGH |
| US-17.2 | As a government administrator, I want to place a credential 'Under Investigation' as a temporary status, so that I can flag suspicious activity without permanently revoking a credential before an investigation concludes. | HIGH |

---

#### E10: Audit Logging & POPIA Compliance
**Compliance:** POPIA | **Actors:** Gov Admin, System | **User Stories:** 5 | **Related Use Cases:** 11

| ID | User Story | Priority |
|----|-----------|----------|
| US-01.1 | As the system, I want every institution registration to be logged to an immutable audit trail, so that all administrative actions for compliance and investigation purposes are recorded. | HIGH |
| US-02.2 | As the system, I want every consent capture to be logged with timestamp and official ID, so that proof of citizen consent can be demonstrated for POPIA compliance. | HIGH |
| US-08.1 | As the system, I want every password change to be logged to the audit trail, so that account security events are traceable and auditable. | HIGH |
| US-10.1 | As the system, I want every verification attempt to be logged regardless of result, so that verification activities are recorded for audit and fraud detection purposes. | HIGH |
| US-17.1 | As the system, I want credential revocations to be logged with reason, admin ID, and timestamp, so that revocation actions are fully auditable and traceable. | HIGH |

---

#### E11: Account Management & Device Security
**Compliance:** POPIA | **Actors:** Citizen | **User Stories:** 8 | **Related Use Cases:** 3

| ID | User Story | Priority |
|----|-----------|----------|
| US-08.1 | As a citizen, I want to change my password from within my account settings, so that I can keep my account secure if I believe my credentials have been compromised. | MEDIUM |
| US-08.2 | As a citizen, I want to reset my password via email or phone if I have forgotten it, so that I can regain access to my wallet without contacting support. | MEDIUM |
| US-08.3 | As a citizen, I want to update my contact details (email and phone number), so that notifications and security alerts are sent to my current contact information. | MEDIUM |
| US-08.4 | As a citizen, I want to delete my FlashID account, so that I can exercise my right to erasure under POPIA if I no longer wish to use the service. | MEDIUM |
| US-15.1 | As a citizen, I want to view all devices that are currently trusted to access my FlashID wallet, so that I can identify any devices I no longer authorise. | MEDIUM |
| US-15.2 | As a citizen, I want to mark a device as lost or stolen to immediately revoke its access to my wallet, so that my credentials cannot be accessed from a compromised device. | MEDIUM |
| US-20.1 | As a citizen, I want to set up a duress PIN that opens a restricted safe-mode view of my wallet, so that I can protect my real credentials if I am ever forced to unlock the app under coercion. | MEDIUM |
| US-20.2 | As a citizen, I want the system to silently alert security when my duress PIN is used, so that a possible coercion or fraud event is flagged for investigation without alerting the attacker. | MEDIUM |

---

#### E12: Advanced Features & Certified Documents
**Compliance:** POPIA | **Actors:** Citizen, Emergency | **User Stories:** 3 | **Related Use Cases:** 2

| ID | User Story | Priority |
|----|-----------|----------|
| US-18.1 | As a citizen, I want to generate a digitally certified copy of my credential as a downloadable PDF document, so that I can use it for formal submissions that require a certified copy of my ID or licence. | MEDIUM |
| US-19.1 | As an emergency official (paramedic, firefighter, police), I want to scan a citizen's emergency QR code to retrieve critical identity and medical information, so that I can identify the citizen and provide appropriate emergency care when they cannot speak for themselves. | HIGH |
| US-19.2 | As a citizen, I want to configure which information is included in my emergency QR, so that I control what emergency responders can access about me. | MEDIUM |

---

## 2.2 User Characteristics

---

## 3. Functional Requirements

### 3.1 [Subsystem 1 Name]

| Req ID | Requirement | Description | Sub-System | Priority |
|--------|------------|-------------|-----------|----------|
| FR-001 | [Requirement Name] | [Detailed description of what the system must do] | [Subsystem] | HIGH |
| FR-002 | [Requirement Name] | [Detailed description of what the system must do] | [Subsystem] | HIGH |
| FR-003 | [Requirement Name] | [Detailed description of what the system must do] | [Subsystem] | MEDIUM |

### 3.2 [Subsystem 2 Name]

| Req ID | Requirement | Description | Sub-System | Priority |
|--------|------------|-------------|-----------|----------|
| FR-004 | [Requirement Name] | [Detailed description of what the system must do] | [Subsystem] | HIGH |
| FR-005 | [Requirement Name] | [Detailed description of what the system must do] | [Subsystem] | MEDIUM |

### 3.3 [Additional Subsystems as needed]

---

## 4. API Service Contracts

### 4.1 [API Endpoint 1]

**Endpoint:** `[METHOD] /api/[endpoint-path]`

**Description:** [Brief description of what this endpoint does]

**Request:**
```json
{
  "field1": "type/description",
  "field2": "type/description"
}
```

**Response (200 OK):**
```json
{
  "Success": true,
  "data": {
    "field1": "type/description",
    "field2": "type/description"
  }
}
```

**Error Responses:**
| Status Code | Description |
|-------------|-------------|
| 400 | [Bad Request Description] |
| 401 | [Unauthorized Description] |
| 500 | [Server Error Description] |

---

### 4.2 [API Endpoint 2]

[Follow same structure as 4.1]

---

## 5. Domain Model

### 5.1 UML Class Diagram

[INSERT UML CLASS DIAGRAM HERE]

**Key Entities:**

| Entity | Description | Key Attributes |
|--------|-------------|-----------------|
| [Entity 1] | [Description] | • [Attribute 1]<br>• [Attribute 2] |
| [Entity 2] | [Description] | • [Attribute 1]<br>• [Attribute 2] |
| [Entity 3] | [Description] | • [Attribute 1]<br>• [Attribute 2] |

---

## 6. Use Cases

### 6.1 High-Level Use Case Diagram

[INSERT HIGH-LEVEL USE CASE DIAGRAM HERE]

### 6.2 Detailed Use Cases with Use Case Diagrams

#### UC-001: [Use Case Name]

---

## 7. Architectural Requirements

### 7.1 Architectural Patterns

- **Pattern 1:** [Name and description]
    - *Justification:* [Why this pattern was chosen]
    - *Components Involved:* [Which components use this pattern]

- **Pattern 2:** [Name and description]
    - *Justification:* [Why this pattern was chosen]
    - *Components Involved:* [Which components use this pattern]

### 7.2 Design Patterns

| Pattern | Use Case | Benefits |
|---------|----------|----------|
| [Pattern Name] | [Where it's used] | [Benefits provided] |
| [Pattern Name] | [Where it's used] | [Benefits provided] |

### 7.3 System Architecture

[INSERT ARCHITECTURE DIAGRAM HERE]

**Architectural Layers:**
- **Presentation Layer:** [Description]
- **Application Layer:** [Description]
- **Domain Layer:** [Description]
- **Infrastructure Layer:** [Description]

### 7.4 Constraints

| Constraint | Description | Impact |
|-----------|-------------|--------|
| [Constraint 1] | [Technical or business constraint] | [Impact on design] |
| [Constraint 2] | [Technical or business constraint] | [Impact on design] |

---

## 8. Quality Requirements

### 8.1 Performance

| Metric | Target | Unit |
|--------|--------|------|
| Response Time | [Value] | ms |
| Throughput | [Value] | requests/sec |
| Load Time | [Value] | seconds |

### 8.2 Reliability

| Metric | Target |
|--------|--------|
| Uptime | [e.g., 99.9%] |
| Mean Time Between Failures (MTBF) | [Value] |
| Mean Time To Recover (MTTR) | [Value] |

### 8.3 Scalability

- **Horizontal Scaling:** [Description of scaling approach]
- **Vertical Scaling:** [Description of scaling approach]
- **Expected Growth:** [Anticipated user/data growth]

### 8.4 Security

| Security Requirement | Description | Implementation |
|---------------------|-------------|-----------------|
| Authentication | [Describe auth mechanism] | [How it's implemented] |
| Authorization | [Describe access control] | [How it's implemented] |
| Data Encryption | [Describe encryption standards] | [What data is encrypted and how] |
| Audit Trail | [Describe logging requirements] | [What events are logged] |

### 8.5 Maintainability

- **Code Standards:** [Description of coding standards to follow]
- **Documentation:** [Required documentation levels]
- **Testing:** [Test coverage targets]
- **Modularity:** [Approach to keeping code modular]

---

## 9. Technology Requirements

### 9.1 Hardware Requirements

| Component | Specification | Justification |
|-----------|--------------|---------------|
| [CPU] | [Specification] | [Why] |
| [Memory] | [Specification] | [Why] |
| [Storage] | [Specification] | [Why] |

### 9.2 Software Requirements

#### Backend
- **Framework:** [.NET Core 10.0]
- **Language:** [C#]
- **Database:** [SQL Server]
- **ORM:** [Entity Framework Core]

#### Frontend/Web
- **Framework:** [React with NextJS]
- **Language:** [TypeScript]
- **Build Tool:** [pnpm]

#### Mobile
- **Platform(s):** [e.g., iOS/Android]
- **Framework:** [React Native]
- **Language:** [TypeScript]

### 9.3 Third-Party Services/Libraries

| Service/Library | Version | Purpose |
|-----------------|---------|---------|
| [Name] | [Version] | [Purpose in the system] |
| [Name] | [Version] | [Purpose in the system] |

### 9.4 Development Environment

- **IDE:** [JetBrains Rider, Visual Studio Code]
- **Version Control:** [Git]
- **CI/CD:** [GitHub Actions]
- **Testing Tools:** [xUnit, NUnit]

---

## 10. Appendix

### A. Glossary

| Term | Definition |
|------|-----------|
| [Term] | [Definition] |
| [Term] | [Definition] |

### B. References

- [Reference 1]
- [Reference 2]
- [Reference 3]

### C. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | May 3, 2026 | [NAME] | Initial draft |

---

**End of Document**