# Tech Titans - South African Digital ID Wallet - A cryptographically secure, nationally scalable digital identity wallet for South African citizens.

## Project Description
The SA Digital ID Wallet allows South African citizens to securely store and present government-issued credentials (ID, driver's licence) via QR code, eliminating reliance on physical documents for banks, hospitals, government services, and law enforcement.


## Documentation
- [Functional Requirements (SRS)](docs/SRS.md)
- [GitHub Project Board](https://github.com/COS301-SE-2026/South-African-Digital-ID-Wallet/projects)


## Team Members

| Name | Student Number | GitHub | LinkedIn |
|------|---------------|--------|----------|
| Unathi Tshakalisa | u24730841 | [babychucks](https://github.com/babychucks) | [LinkedIn](https://linkedin.com/in/unathi-tshakalisa-702a582a4) |
| Nathan Chisadza | u24825532 | [TINODIWA](https://github.com/TINODIWA) | [LinkedIn](https://linkedin.com/in/nathaniel-paul-chisadza) |
| Ryan Liao | u24573699 | [Ryan-Liao-Code](https://github.com/Ryan-Liao-Code) | [LinkedIn](https://linkedin.com/in/huai-en-ryan-liao) |
| Dominiqu Nigatu | u24580482 | [Domy05](https://github.com/Domy05) | [LinkedIn](https://linkedin.com/in/dominiqu-nigatu) |
| Zaynab Samir | u22506099 | [infamouszay](https://github.com/infamouszay) | [LinkedIn](https://linkedin.com/in/zaynab-samir-168b7532a) |

**Unathi Tshakalisa** — Team Lead. Passionate about building practical, accessible technology. Strong in UI engineering and integration, focused on simplifying complex problems into intuitive solutions.

**Nathan Chisadza** — Mathematics Tutor and Teaching Assistant for Data Structures & Algorithms. Combines a strong algorithmic foundation with full-stack skills in React and C#, thriving in collaborative high-pressure environments.

**Ryan Liao** — Junior Software Engineer at Codehesion, shipping production web and mobile applications while completing his degree. A natural full-stack builder grounded in systems programming and real delivery discipline.

**Dominiqu Nigatu** — Delivery-focused full-stack engineer with a strong interest in clean architecture and collaborative problem-solving. Comfortable across the entire stack from frontend to backend integration.

**Zaynab Samir** — Final-year CS student passionate about cybersecurity, testing, and systems. Skilled across a broad technical range from systems-level C++ to frontend development and backend services engineering.


## Repository Structure

This project follows a **monorepo** structure — all platforms (backend, web, mobile) live in a single repository for unified version control, shared CI/CD pipelines, and consistent branching strategy.

South-African-Digital-ID-Wallet/
├── backend/          # ASP.NET Core Web API (.NET 10)
├── web/              # Next.js + React web portal
├── mobile/           # React Native Expo mobile app
├── docs/             # Project documentation
└── .github/          # GitHub Actions CI/CD workflows


## Branching Strategy

We follow a **feature branch workflow** with the following branch types:

| Branch | Purpose |
|---|---|
| `main` | Production-ready code — merged into before each demo |
| `dev` | Integration branch — all features merge here first |
| `feature/` | New features e.g. `feature/upload-institution` |
| `fix/` | Bug fixes e.g. `fix/cors-policy` |
| `docs/` | Documentation updates e.g. `docs/architectural-requirements` |
| `tests/` | Testing additions e.g. `tests/institution-validator` |

**Rules:**
- No direct commits to `main` or `dev`
- All PRs require at least 1 approving review before merging into dev and 2 before merging into main.
- All PRs must pass CI checks (build, lint, format, test) before merging
- Branch names must be lowercase kebab-case


## Badges

### Code Coverage
[![codecov](https://codecov.io/gh/COS301-SE-2026/South-African-Digital-ID-Wallet/branch/dev/graph/badge.svg)](https://codecov.io/gh/COS301-SE-2026/South-African-Digital-ID-Wallet)


### Build
![Web CI](https://github.com/COS301-SE-2026/South-African-Digital-ID-Wallet/actions/workflows/web.yml/badge.svg)
![Backend CI](https://github.com/COS301-SE-2026/South-African-Digital-ID-Wallet/actions/workflows/backend.yml/badge.svg)


### Requirements
![Version](https://img.shields.io/badge/version-0.1.0-blue)
![.NET](https://img.shields.io/badge/.NET-10.0-purple)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![License](https://img.shields.io/badge/license-MIT-green)

### Issue Tracking
![GitHub issues](https://img.shields.io/github/issues/COS301-SE-2026/South-African-Digital-ID-Wallet)
![GitHub pull requests](https://img.shields.io/github/issues-pr/COS301-SE-2026/South-African-Digital-ID-Wallet)
![GitHub last commit](https://img.shields.io/github/last-commit/COS301-SE-2026/South-African-Digital-ID-Wallet/dev)
![GitHub contributors](https://img.shields.io/github/contributors/COS301-SE-2026/South-African-Digital-ID-Wallet)

[![Monitoring](https://img.shields.io/badge/monitoring-UptimeRobot-green)](https://stats.uptimerobot.com/xDz6ZNXIFp)


## Our Tech Stack
- **Backend:** ASP.NET Core Web API (.NET 10)
- **Web:** Next.js + React (TypeScript)
- **Mobile:** React Native (Expo, TypeScript)
- **Database:** Azure SQL + Cosmos DB
- **Auth:** ASP.NET Core Identity + JWT
- **Crypto:** Ed25519
- **CI/CD:** GitHub Actions
- **Hosting:** Azure App Services