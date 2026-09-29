# Estonia Digital Identity Model

Estonia is one of the clearest examples of a national digital identity ecosystem. Its model combines strong cryptographic identity, secure data exchange, and legally binding digital signatures.

## 3-Layer Architecture

### Layer 1: Digital Identity

Every resident has:

- A unique ID number
- A cryptographic identity based on PKI

This identity can be stored in one of three ways:

- **ID card**
- **SIM card** for Mobile-ID
- **App** for Smart-ID

### Layer 2: Cryptography and Security

Each resident has:

- A **private key** stored with the resident
- A **public key** stored with the government or trusted identity provider

How it works:

- The **private key** proves who the user is
- The **public key** lets the system verify that identity

This enables:

- Secure login
- Legally binding signatures
- Protection against impersonation, because the government does not have the private key

### Layer 3: Data Exchange Layer (X-Road)

Estonia does not keep everything in one central database.

- Each institution keeps its own data
- Examples include health, police, tax, and other government systems
- X-Road connects these systems securely

This creates a federated model where trusted systems exchange data without centralising everything in one place.

## End-to-End Flow

### 1. Identity Creation

The user applies online and is physically verified.

The system then creates:

- An ID number
- Cryptographic keys
- Digital certificates

The user receives:

- An ID card
- PIN codes
  - One PIN for authentication
  - One PIN for signing

### 2. Secure Login Example

1. The user inserts the card or opens the app
2. The user enters a PIN
3. The system sends a cryptographic challenge
4. The user’s private key signs the challenge
5. The server verifies the signature using the public key

This means no password is needed.

#### Cryptographic Challenge

The challenge flow works like this:

1. A service asks the user to prove their identity
2. The server generates a random number
3. The server sends the number to the device
4. The device signs it with the private key
5. The server verifies the signature with the public key

### 3. Accessing Services

Once authenticated, the user can access:

- Tax systems
- Business registration
- Medical records
- Police systems
- Other public services

### 4. Data Sharing

When one service needs information from another service:

1. The requesting system sends a request through X-Road
2. The source authority responds
3. The exchange is encrypted and logged

For example, a bank may request a user’s ID details and tax status through the exchange layer.

## Signing Documents

When the user signs a document:

1. The user clicks **Sign Document**
2. The user enters the second PIN
3. The private key signs the document
4. The signature is legally binding

## Big Idea

Estonia is best understood as a **federated identity verification ecosystem**.

Key principles:

- Multiple trusted providers
- Consent-based sharing
- Less centralised trust
- One login for many services

There are no separate accounts for every service. The national eID is trusted across tax, health, police, banks, and other systems.

## Main Parts of the System

The ecosystem has five major parts:

1. **User**
2. **Digital ID provider**
3. **Digital ID exchange layer**
4. **Government or business service**
5. **Attribute providers**

## Digital ID Provider

The digital ID provider is the app or platform the user installs.

In our case, this would be **FlashID**.

The provider:

- Authenticates the user
- Proves the user’s identity
- Stores digital credentials

It does **not**:

- Contain all government data
- Replace every government database

## Australia Compared to Estonia

Australia uses a lighter identity model than Estonia.

Instead of relying on one national PKI-style system, identity is often assembled from multiple evidence sources.

This means the identity is built from proof rather than stored as one all-powerful credential.

## Registration Flow

Typical registration steps:

1. Download the app
2. Enter basic details
	- Name
	- Date of birth
	- Email
	- Phone number
3. Upload documents
	- Passport
	- Driver’s licence
	- Medicare card
	- Birth certificate

## Verification Flow Example

1. The user uploads a passport
2. The app sends the document to the issuing authority
3. The authority confirms the document is real and belongs to the user
4. The system assembles a digital identity from multiple evidence sources
5. A digital credential is created and stored in the app

## Biometric Verification

The app may also use biometric checks:

- The user takes a selfie scan
- The system compares it to government records
- The verified identity is linked to the digital credential

The credential lives inside the app.

## Where Cryptography Is Used

Cryptography is used internally for:

- Secure tokens
- Multi-factor authentication
- Certificates
- Secure credential storage

## Relevance to FlashID

This model is useful for FlashID because it shows how identity can be:

- Verified securely
- Stored in a user-controlled app
- Shared only when needed
- Backed by trusted authorities without centralising all data

It also highlights the difference between:

- A **strong national PKI model** like Estonia
- A **lighter evidence-based identity model** like Australia

