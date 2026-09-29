# Wireframes

## Overview

This document outlines the FlashID platform wireframes and describes the layout, navigation flow, interaction points, and annotations for the proposed system.

---

# Wireframe Screens

# Login Page

![Login Page](./images/login-page.png)

## Description

The Login Page uses a two-panel layout:

* Left panel contains FlashID branding, platform messaging, and security highlights.
* Right panel contains:

  * Email field
  * Password field
  * Login button
  * Forgot password link
  * Register link

## Key Features

* Government-backed verification messaging
* Secure credential sharing messaging
* Clean authentication card layout

---

# Register Page

![Register Page](./images/register-page.png)

## Description

The Register Page follows the same two-panel structure as the Login Page.

## Input Fields

* South African ID Number
* Username
* Password
* Verify Password

## Validation Guidance

Password requirements are displayed beneath the password field:

* Minimum 10 characters
* Uppercase letter
* Lowercase letter
* Digit
* Special character

---

# Onboard Citizen Page

![Onboard Citizen Page](./images/onboard-citizen-page.png)

## Description

The Onboard Citizen Page uses the authenticated application shell.

## Main Sections

### Retrieve Identity Record

Allows officials to:

* Enter citizen ID number
* Capture citizen consent
* Retrieve identity data from the government registry

### Capture Contact Details

Allows officials to:

* Capture phone number
* Capture email address
* Capture onboarding consent
* Create pending FlashID account
* Send activation code

### Onboarding Status Panel

Displays onboarding progress:

* Identity record retrieved
* Consent captured
* Contact details captured
* Pending account created
* Activation code sent

### Audit Log Preview

Displays onboarding audit trail information.

---

# Register Institution Page

![Register Institution Page](./images/register-institution-page.png)

## Description

Authenticated page used to register institutions onto the platform.

## Input Fields

* Institution Name
* Institution Type
* Verification Number
* Admin ID

## Actions

* Register Institution button

## Notes

* Institution Type uses a searchable dropdown.

---

# View Institutions Page

![View Institutions Page](./images/view-institutions-page.png)

## Description

Authenticated page for browsing registered institutions.

## Features

* Full-width search bar
* Institution listing area
* Institution filtering capability

---

# Under Construction Page

![Under Construction Page](./images/under-construction-page.png)

## Description

Fallback page for unfinished features.

## Features

* Friendly “Page Under Construction” message
* “Coming Soon” badge
* Uses authenticated dashboard shell

---

# Navigation Flow

## Unauthenticated Users

Users enter through:

* Login Page
* Register Page

After successful authentication, users are redirected to the Dashboard.

## Authenticated Users

Authenticated users can navigate via the sidebar to:

* Onboard Citizen
* Register Institution
* View Institutions

Other navigation links currently redirect to the Under Construction page.

---

# Layout and Components

## Sidebar

Authenticated pages include:

* Dark green fixed sidebar
* FlashID branding
* Navigation groups
* User avatar section
* Sidebar collapse functionality

## Page Headers

Each page contains:

* Bold page title
* Subtitle/description
* Top-right user avatar

## Form Inputs

* Labels displayed above inputs
* Validation helper text where required
* Full-width primary buttons
* Muted green secondary actions

## Status Panel

Displays workflow progress using sequential status indicators.

---

# User Interaction Points

| Page                 | Action                          | Feedback                            |
| -------------------- | ------------------------------- | ----------------------------------- |
| Login                | Enter email/password and login  | Redirect to dashboard               |
| Register             | Submit registration form        | Success/failure validation feedback |
| Onboard Citizen      | Retrieve identity record        | Identity record populated           |
| Onboard Citizen      | Capture consent/contact details | Checklist updates                   |
| Onboard Citizen      | Send activation code            | Activation code dispatched          |
| Register Institution | Submit institution form         | Institution registered              |
| View Institutions    | Search institutions             | Filtered institution list           |
| Sidebar Links        | Open unfinished pages           | Under Construction page             |

---

# Annotations

* Consent checkboxes are mandatory before onboarding actions can proceed.
* Identity retrieval and onboarding actions remain disabled until consent is captured.
* Password validation guidance is displayed inline during registration.
* Onboarding status acts as a live workflow tracker.
* Institution categories are constrained through a searchable dropdown.
* Under Construction pages indicate planned future functionality.
* Sidebar structure remains visible even for incomplete features.

---

# Figma Link

https://www.figma.com/design/hFiGJIbipXyu7hGhz6jFmv/COS301-Capstone-Wireframes

Access Email:
[u24573699@tuks.co.za](mailto:u24573699@tuks.co.za)