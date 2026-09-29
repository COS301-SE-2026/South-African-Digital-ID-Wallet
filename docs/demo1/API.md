# FlashID — API Service Contracts
**Tech Titans · COS 301 Capstone 2026**

> Base URL: `http://localhost:5118` (development)  
> All endpoints return JSON. All protected endpoints require a valid JWT token transmitted via HttpOnly cookie.

---

## Auth

### GET /api/auth/me
Returns the currently authenticated user's profile.

**Authentication:** Required

**Response 200:**
```json
{
  "id": "string",
  "names": "string",
  "surname": "string",
  "email": "string",
  "role": "string"
}
```

---

### POST /api/auth/login
Authenticates a user and sets a JWT token in an HttpOnly cookie.

**Authentication:** None

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response 200:** JWT token set in HttpOnly cookie, user profile returned  
**Response 401:** Invalid credentials  
**Response 423:** Account locked out

---

### POST /api/auth/logout
Clears the JWT cookie and ends the user session.

**Authentication:** Required

**Response 200:** Session ended, cookie cleared

---

## Citizens

### POST /api/citizens/register
Registers a new citizen account using a South African ID number and activation code.

**Authentication:** None  
**Rate Limit:** 5 requests per minute per client

**Request Body:**
```json
{
  "saId": "string",
  "username": "string",
  "password": "string",
  "activationCode": "string"
}
```

**Validation Rules:**
- `saId` — exactly 13 numeric digits
- `username` — minimum 8 characters, no whitespace
- `password` — minimum 10 characters, must contain uppercase, lowercase, digit, and special character
- `activationCode` — non-empty

**Response 200:** Citizen account created  
**Response 400:** Validation error  
**Response 429:** Rate limit exceeded

---

## Institutions

### POST /api/institutions/register
Registers a new institution and returns a one-time API key.

**Authentication:** Required (Government Administrator)

**Request Body:**
```json
{
  "name": "string",
  "type": 0,
  "verificationNumber": "string",
  "adminId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

**Institution Types:**
| Value | Type |
|---|---|
| 0 | HomeAffairs |
| 1 | LicensingDepartment |

**Validation Rules:**
- `name` — required, max 256 characters
- `verificationNumber` — required, max 100 characters, must be unique
- `adminId` — valid non-empty GUID of a registered Government Administrator

**Response 200:**
```json
{
  "institutionId": "string",
  "name": "string",
  "type": "string",
  "apiKey": "flashid_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "apiKeyReference": "string",
  "verificationNumber": "string",
  "createdAt": "2026-05-21T00:00:00Z"
}
```
> ⚠️ The `apiKey` is returned only once and never stored in plaintext. Copy it immediately.

**Response 400:** Validation error  
**Response 404:** Admin not found  
**Response 409:** Verification number already exists

---

### GET /api/institutions
Returns all registered institutions.

**Authentication:** Required (Government Administrator)

**Response 200:**
```json
[
  {
    "institutionId": "string",
    "name": "string",
    "type": "string",
    "verificationNumber": "string",
    "registeredById": "string",
    "createdAt": "2026-05-21T00:00:00Z"
  }
]
```

---

### GET /api/institutions/{institutionId}
Returns a single institution by ID.

**Authentication:** Required

**Path Parameter:**
- `institutionId` — UUID of the institution

**Response 200:** Institution object  
**Response 404:** Institution not found

---

## Onboarding

### GET /api/onboarding/verify/{idNumber}
Looks up a citizen's identity record from the mock government registry.

**Authentication:** Required (Official)

**Path Parameter:**
- `idNumber` — South African ID number (13 digits)

**Response 200:**
```json
{
  "saId": "string",
  "names": "string",
  "surname": "string",
  "dateOfBirth": "string",
  "gender": "string"
}
```
**Response 404:** Identity record not found

---

### POST /api/onboarding/citizen
Onboards a citizen after identity verification, generating an activation code.

**Authentication:** Required (Official)

**Request Body:**
```json
{
  "saId": "string",
  "phoneNumber": "string",
  "email": "string",
  "consentGiven": true
}
```

**Response 200:**
```json
{
  "activationCode": "string",
  "citizenId": "string",
  "message": "string"
}
```
**Response 400:** Validation error or consent not given  
**Response 409:** Citizen already onboarded

---

## Schemas

### InstitutionType
0 = HomeAffairs
1 = LicensingDepartment

### LoginRequestDto
```json
{
  "email": "string",
  "password": "string"
}
```

### RegisterCitizenRequestDto
```json
{
  "saId": "string",
  "username": "string",
  "password": "string",
  "activationCode": "string"
}
```

### RegisterInstitutionRequestDto
```json
{
  "name": "string",
  "type": 0,
  "verificationNumber": "string",
  "adminId": "uuid"
}
```

### OnboardCitizenRequest
```json
{
  "saId": "string",
  "phoneNumber": "string",
  "email": "string",
  "consentGiven": true
}
```