# Software Architecture Specification (SAS)
## FlashID - South African Digital ID Wallet

> COS 301 Capstone Project 2026  
> Team: Tech Titans  
> Client: Agile Bridge (Pty) Ltd  
> Version: 0.1

## 1. Introduction

This Software Architecture Specification (SAS) describes the technical structure of FlashID (South African Digital ID Wallet). The architectural decisions made to satisfy the requirements defined in the SRS. The SRS specifies *what* the system must do, where as this document *how* the system is built, deployed and operated to meet those requirements.

FlashID is composed of four subsystems: Next.js for web portal for citizens, administrators and officials. React Native for mobile app wallet for citizens and ASP.NET Core for backend API that owns identity, credential, authentication logic and a separate government-registry service that simulates the external national ID authority from Home Affairs that FlashID integrates against. All components are containerised or published via GitHub Actions and deployed to Azure Web Apps, with SQL Server for persistence and Azure Blob Storage for credential photo storage.

## 2. Architectural Requirements

### 2.1 Architectural Patterns

### 2.2 Design Patterns

### 2.3 Constraints

### 2.4 Architectural Diagram

### 2.5 Mapping Quality Requirements to Architechtural Decisions

## 3. Technology Requirements

## 4. API Contracts

## 5. Deployment

### 5.1 Live System

### 5.2 Environment Parity

### 5.3 Infrastructure as Code / Containerisation

### 5.4 Secrets Management

### 5.5 Rollback Strategy

### 5.6 Deployment Diagram

### 5.7 CI/CD Pipeline Diagram
