# Software Requirements Specification (SRS)
# FlashID — South African Digital ID Wallet

> COS 301 Capstone Project 2026  
> Team: Tech Titans  
> Client: Agile Bridge (Pty) Ltd  
> Version: 0.1

---

# Table of Contents

1. Introduction  
2. System Overview  
3. User Characteristics and Actors  
4. Functional Requirements  
5. Use Cases  
6. API Service Contracts  
7. Domain Model  
8. Architectural Requirements  
9. Technology Requirements  
10. Constraints and Assumptions  
11. Future Enhancements  

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

# 3. User Characteristics and Actors

## 3.1 Citizen

A South African citizen who:
- Registers for FlashID
- Stores digital credentials
- Authenticates securely
- Presents credentials using QR codes
- Scan QR codes
- Receives status notifications

---

## 3.2 Government Administrator

Authorized personnel who:
- Issue credentials
- Revoke credentials
- Manage citizen onboarding
- View audit logs
- Manage verification workflows

---

## 3.3 Official

External authorized entities such as:
- Banks
- Hospitals
- Police officers
- Insurance agencies
- DLTC

Officials may:
- Verify credentials
- Receive limited verification data
- Validate authenticity in real time
- Communicate with FlashID to send citizen data to the system

---

# 4. Functional Requirements

See [functional_requirements.md](./functional_requirements.md) for the full functional requirements specification.
---

# 5. Use Cases


---

# 6. API Service Contracts

See [API.md](./API.md) for preliminary API contracts and payloads supporting these use cases.

---
# 7. Domain Model


---

# 8. Architectural Requirements
See [architecture.md](./architecture.md) for the overarching architectural approach, quality requirements, design patterns, and constraints guiding Demo 1 implementation. 
---
# 9. Technology Requirements

| Category | Technology | Version |
|---|---|---|
| Backend | ASP.NET Core Web API | .NET 10 |
| Web Frontend | Next.js + React | 16.x + 19.x |
| Mobile | React Native + Expo | Latest |
| Relational DB | Azure SQL (SQL Server) | Latest |
| Document DB | Azure Cosmos DB | Latest |
| ORM | Entity Framework Core | Latest |
| Authentication | ASP.NET Identity + JWT Bearer | Latest |
| Frontend State | React Query (@tanstack) | 5.x |
| Styling | Tailwind CSS + shadcn/ui | Latest |
| Testing (Backend) | xUnit v3 | 3.x |
| Testing (Frontend) | Jest + React Testing Library | Latest |
| CI/CD | GitHub Actions | Latest |
| Coverage | Codecov | Latest |

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

# 11. Future Enhancements

Potential future features include:
- Passport credentials
- Vehicle registration credentials
- Offline verification mode
- Blockchain-backed audit trails
- International interoperability
- NFC credential verification
- Selective disclosure verification
- Digital birth certificates
